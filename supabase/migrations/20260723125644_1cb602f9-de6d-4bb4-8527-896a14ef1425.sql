
-- Tarefas
CREATE TABLE public.tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  prazo timestamptz,
  prioridade text NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa','media','alta','urgente')),
  status text NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','em_andamento','concluida','cancelada')),
  responsavel_id uuid REFERENCES public.usuarios(id),
  criado_por uuid REFERENCES public.usuarios(id),
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL,
  tags text[],
  concluida_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tarefas_resp ON public.tarefas(responsavel_id, status);
CREATE INDEX idx_tarefas_prazo ON public.tarefas(prazo) WHERE status <> 'concluida';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarefas TO authenticated;
GRANT ALL ON public.tarefas TO service_role;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tarefas_interno_all" ON public.tarefas
  FOR ALL TO authenticated
  USING (public.meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda','financeiro','juridico','logistica']))
  WITH CHECK (public.meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda','financeiro','juridico','logistica']));

-- Processos
CREATE TABLE public.processos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'onboarding' CHECK (tipo IN ('onboarding','fechamento_contrato','pos_venda','custom')),
  status text NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento','concluido','cancelado')),
  responsavel_id uuid REFERENCES public.usuarios(id),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  etapa_atual integer NOT NULL DEFAULT 0,
  etapas jsonb NOT NULL DEFAULT '[]'::jsonb,
  concluido_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.processos TO authenticated;
GRANT ALL ON public.processos TO service_role;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "processos_interno_all" ON public.processos
  FOR ALL TO authenticated
  USING (public.meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda','financeiro','juridico','logistica']))
  WITH CHECK (public.meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda','financeiro','juridico','logistica']));

-- Agenda de eventos/compromissos
CREATE TABLE public.agenda_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  inicio timestamptz NOT NULL,
  fim timestamptz,
  tipo text NOT NULL DEFAULT 'reuniao' CHECK (tipo IN ('reuniao','ligacao','tarefa','evento','outro')),
  local text,
  responsavel_id uuid REFERENCES public.usuarios(id),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  venda_id uuid REFERENCES public.vendas(id) ON DELETE SET NULL,
  cor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_agenda_inicio ON public.agenda_eventos(inicio);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_eventos TO authenticated;
GRANT ALL ON public.agenda_eventos TO service_role;
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_interno_all" ON public.agenda_eventos
  FOR ALL TO authenticated
  USING (public.meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda','financeiro','juridico','logistica']))
  WITH CHECK (public.meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda','financeiro','juridico','logistica']));

-- Triggers updated_at
CREATE OR REPLACE FUNCTION public.tick_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_tarefas_upd BEFORE UPDATE ON public.tarefas
  FOR EACH ROW EXECUTE FUNCTION public.tick_updated_at();
CREATE TRIGGER trg_processos_upd BEFORE UPDATE ON public.processos
  FOR EACH ROW EXECUTE FUNCTION public.tick_updated_at();
CREATE TRIGGER trg_agenda_upd BEFORE UPDATE ON public.agenda_eventos
  FOR EACH ROW EXECUTE FUNCTION public.tick_updated_at();

-- Notificação ao atribuir tarefa
CREATE OR REPLACE FUNCTION public.notificar_tarefa_atribuida() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid;
BEGIN
  IF NEW.responsavel_id IS NOT NULL AND (TG_OP='INSERT' OR OLD.responsavel_id IS DISTINCT FROM NEW.responsavel_id) THEN
    SELECT user_id INTO v_user FROM public.usuarios WHERE id = NEW.responsavel_id;
    IF v_user IS NOT NULL THEN
      INSERT INTO public.notificacoes(user_id, titulo, mensagem, tipo, link)
      VALUES (v_user, 'Nova tarefa atribuída', COALESCE(NEW.titulo,''), 'info', '/app/tarefas');
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_tarefa_notif AFTER INSERT OR UPDATE OF responsavel_id ON public.tarefas
  FOR EACH ROW EXECUTE FUNCTION public.notificar_tarefa_atribuida();

-- Audit log nas novas tabelas
CREATE TRIGGER trg_tarefas_audit AFTER INSERT OR UPDATE OR DELETE ON public.tarefas
  FOR EACH ROW EXECUTE FUNCTION public.log_change();
CREATE TRIGGER trg_processos_audit AFTER INSERT OR UPDATE OR DELETE ON public.processos
  FOR EACH ROW EXECUTE FUNCTION public.log_change();
