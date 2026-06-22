
-- ============== 1. LEADS: expandir pipeline ==============
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_etapa_check;
ALTER TABLE public.leads ALTER COLUMN etapa SET DEFAULT 'contato_recebido';
UPDATE public.leads SET etapa = CASE etapa
  WHEN 'novo' THEN 'contato_recebido'
  WHEN 'contato_realizado' THEN 'briefing_realizado'
  WHEN 'fechado' THEN 'ganho'
  ELSE etapa END;
ALTER TABLE public.leads ADD CONSTRAINT leads_etapa_check CHECK (etapa = ANY (ARRAY[
  'contato_recebido','briefing_realizado','recomendacao_palestrante','consulta_palestrante',
  'proposta_enviada','negociacao','contratacao_iniciada','ganho','perdido']));

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS objetivo text,
  ADD COLUMN IF NOT EXISTS orcamento_min numeric,
  ADD COLUMN IF NOT EXISTS orcamento_max numeric,
  ADD COLUMN IF NOT EXISTS posicao integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS etapa_alterada_em timestamptz DEFAULT now();

-- ============== 2. RECOMENDAÇÕES POR LEAD ==============
CREATE TABLE IF NOT EXISTS public.lead_palestrante_recomendacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  palestrante_id uuid NOT NULL REFERENCES public.palestrantes(id) ON DELETE CASCADE,
  cache_proposto numeric,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','consultado','disponivel','indisponivel','recomendado')),
  observacoes text,
  ordem integer DEFAULT 0,
  disponibilidade_verificada_em timestamptz,
  criado_por uuid REFERENCES public.usuarios(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (lead_id, palestrante_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_palestrante_recomendacoes TO authenticated;
GRANT ALL ON public.lead_palestrante_recomendacoes TO service_role;
ALTER TABLE public.lead_palestrante_recomendacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rec_interno" ON public.lead_palestrante_recomendacoes
  FOR ALL TO authenticated
  USING (meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda']))
  WITH CHECK (meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda']));
CREATE INDEX idx_rec_lead ON public.lead_palestrante_recomendacoes(lead_id);

-- ============== 3. PROPOSTA_PALESTRANTES: ligar à recomendação ==============
ALTER TABLE public.proposta_palestrantes
  ADD COLUMN IF NOT EXISTS recomendacao_id uuid REFERENCES public.lead_palestrante_recomendacoes(id) ON DELETE SET NULL;

ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS versao integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS condicoes_comerciais text,
  ADD COLUMN IF NOT EXISTS observacoes text,
  ADD COLUMN IF NOT EXISTS taxas numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_total numeric;

-- Trigger: proposta_palestrante exige recomendação do mesmo lead
CREATE OR REPLACE FUNCTION public.validar_proposta_palestrante()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_lead_id uuid; v_rec_lead uuid;
BEGIN
  SELECT lead_id INTO v_lead_id FROM public.propostas WHERE id = NEW.proposta_id;
  IF v_lead_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.recomendacao_id IS NULL THEN
    RAISE EXCEPTION 'Palestrante deve ser selecionado a partir das recomendações do lead.';
  END IF;
  SELECT lead_id INTO v_rec_lead FROM public.lead_palestrante_recomendacoes WHERE id = NEW.recomendacao_id;
  IF v_rec_lead <> v_lead_id THEN
    RAISE EXCEPTION 'A recomendação não pertence ao lead da proposta.';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_validar_pp ON public.proposta_palestrantes;
CREATE TRIGGER trg_validar_pp BEFORE INSERT OR UPDATE ON public.proposta_palestrantes
  FOR EACH ROW EXECUTE FUNCTION public.validar_proposta_palestrante();

-- ============== 4. ATIVIDADES ==============
CREATE TABLE IF NOT EXISTS public.crm_atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('ligacao','email','whatsapp','reuniao','tarefa','followup')),
  titulo text NOT NULL,
  descricao text,
  prazo timestamptz,
  concluida boolean DEFAULT false,
  concluida_em timestamptz,
  concluida_por uuid REFERENCES public.usuarios(id),
  responsavel_id uuid REFERENCES public.usuarios(id),
  criado_por uuid REFERENCES public.usuarios(id),
  automatica boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_atividades TO authenticated;
GRANT ALL ON public.crm_atividades TO service_role;
ALTER TABLE public.crm_atividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ativ_interno" ON public.crm_atividades FOR ALL TO authenticated
  USING (meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda']))
  WITH CHECK (meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda']));
CREATE INDEX idx_ativ_lead ON public.crm_atividades(lead_id);
CREATE INDEX idx_ativ_pend ON public.crm_atividades(responsavel_id, concluida) WHERE concluida = false;

-- ============== 5. HISTÓRICO ==============
CREATE TABLE IF NOT EXISTS public.crm_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES public.usuarios(id),
  tipo_evento text NOT NULL,
  descricao text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.crm_historico TO authenticated;
GRANT ALL ON public.crm_historico TO service_role;
ALTER TABLE public.crm_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hist_select" ON public.crm_historico FOR SELECT TO authenticated
  USING (meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda']));
CREATE POLICY "hist_insert" ON public.crm_historico FOR INSERT TO authenticated
  WITH CHECK (meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda']));
CREATE INDEX idx_hist_lead ON public.crm_historico(lead_id, created_at DESC);

-- ============== 6. COMENTÁRIOS ==============
CREATE TABLE IF NOT EXISTS public.crm_comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES public.usuarios(id),
  texto text NOT NULL,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_comentarios TO authenticated;
GRANT ALL ON public.crm_comentarios TO service_role;
ALTER TABLE public.crm_comentarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "com_interno" ON public.crm_comentarios FOR ALL TO authenticated
  USING (meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda']))
  WITH CHECK (meu_perfil() = ANY (ARRAY['admin','gestor','comercial','pos_venda']));
CREATE INDEX idx_com_lead ON public.crm_comentarios(lead_id, created_at DESC);

-- ============== 7. TRIGGER: criar atividades automáticas por etapa ==============
CREATE OR REPLACE FUNCTION public.criar_atividades_etapa()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_resp uuid := NEW.consultor_id;
BEGIN
  IF NEW.etapa = 'contato_recebido' THEN
    INSERT INTO crm_atividades(lead_id,tipo,titulo,prazo,responsavel_id,automatica) VALUES
      (NEW.id,'ligacao','Entrar em contato com cliente',now()+interval '24 hours',v_resp,true),
      (NEW.id,'reuniao','Agendar briefing',now()+interval '24 hours',v_resp,true),
      (NEW.id,'tarefa','Validar informações básicas',now()+interval '24 hours',v_resp,true);
  ELSIF NEW.etapa = 'briefing_realizado' THEN
    INSERT INTO crm_atividades(lead_id,tipo,titulo,responsavel_id,automatica) VALUES
      (NEW.id,'tarefa','Levantar objetivos do evento',v_resp,true),
      (NEW.id,'tarefa','Definir orçamento',v_resp,true),
      (NEW.id,'tarefa','Definir perfil do palestrante',v_resp,true),
      (NEW.id,'tarefa','Registrar informações do evento',v_resp,true);
  ELSIF NEW.etapa = 'consulta_palestrante' THEN
    INSERT INTO crm_atividades(lead_id,tipo,titulo,responsavel_id,automatica) VALUES
      (NEW.id,'tarefa','Consultar agenda',v_resp,true),
      (NEW.id,'tarefa','Consultar cachê atualizado',v_resp,true),
      (NEW.id,'tarefa','Solicitar disponibilidade',v_resp,true);
  ELSIF NEW.etapa = 'negociacao' THEN
    INSERT INTO crm_atividades(lead_id,tipo,titulo,prazo,responsavel_id,automatica) VALUES
      (NEW.id,'followup','Follow-up 1',now()+interval '2 days',v_resp,true),
      (NEW.id,'followup','Follow-up 2',now()+interval '5 days',v_resp,true),
      (NEW.id,'followup','Follow-up 3',now()+interval '10 days',v_resp,true);
  ELSIF NEW.etapa = 'contratacao_iniciada' THEN
    INSERT INTO crm_atividades(lead_id,tipo,titulo,responsavel_id,automatica) VALUES
      (NEW.id,'tarefa','Solicitar contrato',v_resp,true),
      (NEW.id,'tarefa','Solicitar dados fiscais',v_resp,true),
      (NEW.id,'tarefa','Solicitar assinatura',v_resp,true),
      (NEW.id,'tarefa','Solicitar pagamento inicial',v_resp,true);
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.criar_atividades_etapa() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_ativ_insert ON public.leads;
CREATE TRIGGER trg_ativ_insert AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.criar_atividades_etapa();

DROP TRIGGER IF EXISTS trg_ativ_update ON public.leads;
CREATE TRIGGER trg_ativ_update AFTER UPDATE OF etapa ON public.leads
  FOR EACH ROW WHEN (OLD.etapa IS DISTINCT FROM NEW.etapa)
  EXECUTE FUNCTION public.criar_atividades_etapa();

-- ============== 8. TRIGGER: histórico automático ==============
CREATE OR REPLACE FUNCTION public.registrar_historico_lead()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid; v_user uuid;
BEGIN
  v_uid := auth.uid();
  SELECT id INTO v_user FROM usuarios WHERE user_id = v_uid LIMIT 1;
  IF TG_OP='INSERT' THEN
    INSERT INTO crm_historico(lead_id,usuario_id,tipo_evento,descricao,payload)
    VALUES (NEW.id,v_user,'lead_criado','Lead criado: '||NEW.empresa,to_jsonb(NEW));
  ELSIF TG_OP='UPDATE' THEN
    IF OLD.etapa IS DISTINCT FROM NEW.etapa THEN
      NEW.etapa_alterada_em := now();
      INSERT INTO crm_historico(lead_id,usuario_id,tipo_evento,descricao,payload)
      VALUES (NEW.id,v_user,'etapa_alterada','Etapa: '||OLD.etapa||' → '||NEW.etapa,
              jsonb_build_object('de',OLD.etapa,'para',NEW.etapa));
    END IF;
    IF OLD.consultor_id IS DISTINCT FROM NEW.consultor_id THEN
      INSERT INTO crm_historico(lead_id,usuario_id,tipo_evento,descricao,payload)
      VALUES (NEW.id,v_user,'responsavel_alterado','Responsável alterado',
              jsonb_build_object('de',OLD.consultor_id,'para',NEW.consultor_id));
    END IF;
    IF OLD.orcamento_est IS DISTINCT FROM NEW.orcamento_est THEN
      INSERT INTO crm_historico(lead_id,usuario_id,tipo_evento,descricao,payload)
      VALUES (NEW.id,v_user,'valor_alterado','Orçamento alterado',
              jsonb_build_object('de',OLD.orcamento_est,'para',NEW.orcamento_est));
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.registrar_historico_lead() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_hist_lead ON public.leads;
CREATE TRIGGER trg_hist_lead BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.registrar_historico_lead();

-- Histórico de recomendações
CREATE OR REPLACE FUNCTION public.registrar_historico_recomendacao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid; v_nome text;
BEGIN
  SELECT id INTO v_user FROM usuarios WHERE user_id = auth.uid() LIMIT 1;
  IF TG_OP='INSERT' THEN
    SELECT nome INTO v_nome FROM palestrantes WHERE id = NEW.palestrante_id;
    INSERT INTO crm_historico(lead_id,usuario_id,tipo_evento,descricao,payload)
    VALUES (NEW.lead_id,v_user,'palestrante_recomendado','Palestrante recomendado: '||coalesce(v_nome,''),to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP='DELETE' THEN
    SELECT nome INTO v_nome FROM palestrantes WHERE id = OLD.palestrante_id;
    INSERT INTO crm_historico(lead_id,usuario_id,tipo_evento,descricao,payload)
    VALUES (OLD.lead_id,v_user,'palestrante_removido','Palestrante removido: '||coalesce(v_nome,''),to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.registrar_historico_recomendacao() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_hist_rec ON public.lead_palestrante_recomendacoes;
CREATE TRIGGER trg_hist_rec AFTER INSERT OR DELETE ON public.lead_palestrante_recomendacoes
  FOR EACH ROW EXECUTE FUNCTION public.registrar_historico_recomendacao();

-- ============== 9. TRIGGER: ao GANHAR, criar venda (dispara kanbans) ==============
CREATE OR REPLACE FUNCTION public.lead_ganho_criar_venda()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_proposta record; v_pal record; v_venda_id uuid;
BEGIN
  IF NEW.etapa <> 'ganho' OR OLD.etapa = 'ganho' THEN RETURN NEW; END IF;
  IF NEW.cliente_id IS NULL THEN
    RAISE EXCEPTION 'Cliente é obrigatório para fechar a venda.';
  END IF;
  SELECT * INTO v_proposta FROM propostas
    WHERE lead_id = NEW.id ORDER BY versao DESC, created_at DESC LIMIT 1;
  IF v_proposta.id IS NULL THEN
    RAISE EXCEPTION 'É preciso criar uma proposta antes de fechar o lead.';
  END IF;
  SELECT pp.palestrante_id, pp.cache_proposto INTO v_pal
    FROM proposta_palestrantes pp
    WHERE pp.proposta_id = v_proposta.id AND pp.selecionado = true
    ORDER BY pp.ordem LIMIT 1;
  IF v_pal.palestrante_id IS NULL THEN
    SELECT pp.palestrante_id, pp.cache_proposto INTO v_pal
      FROM proposta_palestrantes pp WHERE pp.proposta_id = v_proposta.id
      ORDER BY pp.ordem LIMIT 1;
  END IF;
  IF v_pal.palestrante_id IS NULL THEN
    RAISE EXCEPTION 'A proposta precisa ter ao menos um palestrante.';
  END IF;

  INSERT INTO vendas(proposta_id,lead_id,cliente_id,palestrante_id,consultor_id,titulo,
                     data_evento,cidade,formato,publico_estimado,briefing,valor_total,cache_palestr)
  VALUES (v_proposta.id,NEW.id,NEW.cliente_id,v_pal.palestrante_id,NEW.consultor_id,
          coalesce(v_proposta.titulo,'Venda - '||NEW.empresa),NEW.data_pretendida,NEW.cidade_evento,
          NEW.formato,NEW.publico_estimado,NEW.descricao,
          coalesce(v_proposta.valor_total, v_pal.cache_proposto, 0),
          coalesce(v_pal.cache_proposto,0))
  RETURNING id INTO v_venda_id;

  NEW.convertido := true;
  INSERT INTO crm_historico(lead_id,tipo_evento,descricao,payload)
  VALUES (NEW.id,'venda_criada','Venda criada e kanbans operacionais disparados',
          jsonb_build_object('venda_id',v_venda_id));
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.lead_ganho_criar_venda() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_lead_ganho ON public.leads;
CREATE TRIGGER trg_lead_ganho BEFORE UPDATE OF etapa ON public.leads
  FOR EACH ROW WHEN (NEW.etapa = 'ganho' AND OLD.etapa IS DISTINCT FROM 'ganho')
  EXECUTE FUNCTION public.lead_ganho_criar_venda();
