CREATE OR REPLACE FUNCTION public.lead_ganho_criar_venda()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_proposta record; v_pal record; v_venda_id uuid; v_existing int;
BEGIN
  IF NEW.etapa <> 'ganho' OR OLD.etapa = 'ganho' THEN RETURN NEW; END IF;

  -- Skip auto-create if vendas already exist for this lead
  -- (frontend "Marcar ganho" flow inserts vendas manually for each selected palestrante)
  SELECT count(*) INTO v_existing FROM vendas WHERE lead_id = NEW.id;
  IF v_existing > 0 THEN
    NEW.convertido := true;
    RETURN NEW;
  END IF;

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
END $function$;