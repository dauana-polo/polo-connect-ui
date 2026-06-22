
-- 0. Adicionar UNIQUE em usuarios.user_id (se ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'usuarios_user_id_key' AND conrelid = 'public.usuarios'::regclass
  ) THEN
    ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 1. Trigger auto-criar perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, nome, email, perfil, ativo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'comercial',
    true
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Policies fallback SELECT
DROP POLICY IF EXISTS "leads_select_any_auth" ON public.leads;
CREATE POLICY "leads_select_any_auth" ON public.leads FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "crm_atividades_select_any_auth" ON public.crm_atividades;
CREATE POLICY "crm_atividades_select_any_auth" ON public.crm_atividades FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "crm_comentarios_select_any_auth" ON public.crm_comentarios;
CREATE POLICY "crm_comentarios_select_any_auth" ON public.crm_comentarios FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "crm_historico_select_any_auth" ON public.crm_historico;
CREATE POLICY "crm_historico_select_any_auth" ON public.crm_historico FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "rec_select_any_auth" ON public.lead_palestrante_recomendacoes;
CREATE POLICY "rec_select_any_auth" ON public.lead_palestrante_recomendacoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "propostas_select_any_auth" ON public.propostas;
CREATE POLICY "propostas_select_any_auth" ON public.propostas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "proposta_pal_select_any_auth" ON public.proposta_palestrantes;
CREATE POLICY "proposta_pal_select_any_auth" ON public.proposta_palestrantes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "lead_int_select_any_auth" ON public.lead_interacoes;
CREATE POLICY "lead_int_select_any_auth" ON public.lead_interacoes FOR SELECT TO authenticated USING (true);

-- 3. GRANTs
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads, public.crm_atividades, public.crm_comentarios, public.lead_palestrante_recomendacoes, public.propostas, public.proposta_palestrantes, public.lead_interacoes, public.usuarios TO authenticated;
GRANT SELECT, INSERT ON public.crm_historico TO authenticated;
GRANT ALL ON public.leads, public.crm_atividades, public.crm_comentarios, public.crm_historico, public.lead_palestrante_recomendacoes, public.propostas, public.proposta_palestrantes, public.lead_interacoes, public.usuarios TO service_role;

-- 4. Backfill: criar perfil admin para usuários já existentes em auth.users
INSERT INTO public.usuarios (user_id, nome, email, perfil, ativo)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'name', u.email), u.email, 'admin', true
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.usuarios WHERE user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;
