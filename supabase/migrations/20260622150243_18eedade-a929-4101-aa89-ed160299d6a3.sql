
DROP TRIGGER IF EXISTS trg_hist_lead ON public.leads;

CREATE OR REPLACE FUNCTION public.registrar_historico_lead_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid;
BEGIN
  SELECT id INTO v_user FROM usuarios WHERE user_id = auth.uid() LIMIT 1;
  INSERT INTO crm_historico(lead_id,usuario_id,tipo_evento,descricao,payload)
  VALUES (NEW.id, v_user, 'lead_criado', 'Lead criado: '||NEW.empresa, to_jsonb(NEW));
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.registrar_historico_lead_insert() FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.registrar_historico_lead_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid;
BEGIN
  SELECT id INTO v_user FROM usuarios WHERE user_id = auth.uid() LIMIT 1;
  IF OLD.etapa IS DISTINCT FROM NEW.etapa THEN
    NEW.etapa_alterada_em := now();
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.registrar_historico_lead_update() FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.registrar_historico_lead_after_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid;
BEGIN
  SELECT id INTO v_user FROM usuarios WHERE user_id = auth.uid() LIMIT 1;
  IF OLD.etapa IS DISTINCT FROM NEW.etapa THEN
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
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.registrar_historico_lead_after_update() FROM public, anon, authenticated;

DROP FUNCTION IF EXISTS public.registrar_historico_lead() CASCADE;

CREATE TRIGGER trg_hist_lead_ins AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.registrar_historico_lead_insert();
CREATE TRIGGER trg_hist_lead_upd BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.registrar_historico_lead_update();
CREATE TRIGGER trg_hist_lead_aupd AFTER UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.registrar_historico_lead_after_update();
