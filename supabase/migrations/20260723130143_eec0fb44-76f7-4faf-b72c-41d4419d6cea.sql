
-- AGENDA
CREATE TABLE IF NOT EXISTS public.agenda_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'reuniao',
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ,
  local TEXT,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_eventos TO authenticated;
GRANT ALL ON public.agenda_eventos TO service_role;
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all agenda" ON public.agenda_eventos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TAREFAS
CREATE TABLE IF NOT EXISTS public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  prazo TIMESTAMPTZ,
  prioridade TEXT NOT NULL DEFAULT 'media',
  status TEXT NOT NULL DEFAULT 'aberta',
  responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  venda_id UUID REFERENCES public.vendas(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarefas TO authenticated;
GRANT ALL ON public.tarefas TO service_role;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all tarefas" ON public.tarefas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PROCESSOS
CREATE TABLE IF NOT EXISTS public.processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'custom',
  etapas JSONB NOT NULL DEFAULT '[]'::jsonb,
  etapa_atual INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  concluido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.processos TO authenticated;
GRANT ALL ON public.processos TO service_role;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all processos" ON public.processos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_agenda_updated BEFORE UPDATE ON public.agenda_eventos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tarefas_updated BEFORE UPDATE ON public.tarefas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_processos_updated BEFORE UPDATE ON public.processos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
