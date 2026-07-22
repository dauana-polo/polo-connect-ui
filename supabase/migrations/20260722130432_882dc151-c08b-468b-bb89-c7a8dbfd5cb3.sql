-- ============================================================
-- Fase 1: Roles, Notificações, Auditoria
-- ============================================================

-- 1. Enum app_role
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','gestor','comercial','pos_venda','juridico','financeiro','logistica','palestrante');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_gestor()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','gestor'))
$$;

-- Policies for user_roles
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

DROP POLICY IF EXISTS "user_roles_admin_write" ON public.user_roles;
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Backfill user_roles from usuarios.perfil
INSERT INTO public.user_roles (user_id, role)
SELECT u.user_id, u.perfil::text::public.app_role
FROM public.usuarios u
WHERE u.user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Promote first user to admin if no admin exists
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::public.app_role FROM public.usuarios
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
ORDER BY created_at ASC LIMIT 1
ON CONFLICT DO NOTHING;

-- 5. Update handle_new_user: first user = admin, rest = comercial; also inserts user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_role public.app_role;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    v_role := 'admin';
  ELSE
    v_role := 'comercial';
  END IF;

  INSERT INTO public.usuarios (user_id, nome, email, perfil, ativo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    v_role::text,
    true
  ) ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  mensagem text,
  tipo text NOT NULL DEFAULT 'info',
  link text,
  lida boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificacoes TO authenticated;
GRANT ALL ON public.notificacoes TO service_role;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notificacoes_own" ON public.notificacoes;
CREATE POLICY "notificacoes_own" ON public.notificacoes FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida ON public.notificacoes(user_id, lida, created_at DESC);

-- Realtime for notificacoes
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;

-- 7. Auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  acao text NOT NULL,
  entidade text NOT NULL,
  entidade_id text,
  dados_antes jsonb,
  dados_depois jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_admin_read" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE INDEX IF NOT EXISTS idx_audit_logs_entidade ON public.audit_logs(entidade, entidade_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);

-- 8. Trigger genérico de auditoria
CREATE OR REPLACE FUNCTION public.log_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_id := COALESCE((row_to_json(OLD)->>'id'),'');
    INSERT INTO public.audit_logs(user_id, acao, entidade, entidade_id, dados_antes)
    VALUES (auth.uid(), 'delete', TG_TABLE_NAME, v_id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    v_id := COALESCE((row_to_json(NEW)->>'id'),'');
    INSERT INTO public.audit_logs(user_id, acao, entidade, entidade_id, dados_antes, dados_depois)
    VALUES (auth.uid(), 'update', TG_TABLE_NAME, v_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    v_id := COALESCE((row_to_json(NEW)->>'id'),'');
    INSERT INTO public.audit_logs(user_id, acao, entidade, entidade_id, dados_depois)
    VALUES (auth.uid(), 'insert', TG_TABLE_NAME, v_id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END $$;

DROP TRIGGER IF EXISTS audit_leads ON public.leads;
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.log_change();

DROP TRIGGER IF EXISTS audit_vendas ON public.vendas;
CREATE TRIGGER audit_vendas AFTER INSERT OR UPDATE OR DELETE ON public.vendas
FOR EACH ROW EXECUTE FUNCTION public.log_change();

DROP TRIGGER IF EXISTS audit_contratos ON public.contratos;
CREATE TRIGGER audit_contratos AFTER INSERT OR UPDATE OR DELETE ON public.contratos
FOR EACH ROW EXECUTE FUNCTION public.log_change();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_change();

DROP TRIGGER IF EXISTS audit_empresas_polo ON public.empresas_polo;
CREATE TRIGGER audit_empresas_polo AFTER INSERT OR UPDATE OR DELETE ON public.empresas_polo
FOR EACH ROW EXECUTE FUNCTION public.log_change();

-- 9. Policies extra em usuarios para admin gerenciar
DROP POLICY IF EXISTS "usuarios_admin_manage" ON public.usuarios;
CREATE POLICY "usuarios_admin_manage" ON public.usuarios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 10. Trigger de notificação: novo lead atribuído
CREATE OR REPLACE FUNCTION public.notificar_lead_atribuido()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid;
BEGIN
  IF NEW.consultor_id IS NOT NULL AND (TG_OP='INSERT' OR OLD.consultor_id IS DISTINCT FROM NEW.consultor_id) THEN
    SELECT user_id INTO v_user FROM public.usuarios WHERE id = NEW.consultor_id;
    IF v_user IS NOT NULL THEN
      INSERT INTO public.notificacoes(user_id, titulo, mensagem, tipo, link)
      VALUES (v_user, 'Novo lead atribuído', 'Empresa: '||COALESCE(NEW.empresa,''), 'info', '/app/crm');
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS notificar_lead_atribuido_trg ON public.leads;
CREATE TRIGGER notificar_lead_atribuido_trg AFTER INSERT OR UPDATE OF consultor_id ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.notificar_lead_atribuido();
