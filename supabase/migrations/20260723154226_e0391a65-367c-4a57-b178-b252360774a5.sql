-- Sprint 01: Base consolidation

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_consultor_id ON public.leads(consultor_id);
CREATE INDEX IF NOT EXISTS idx_leads_cliente_id ON public.leads(cliente_id);
CREATE INDEX IF NOT EXISTS idx_leads_etapa ON public.leads(etapa);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vendas_lead_id ON public.vendas(lead_id);
CREATE INDEX IF NOT EXISTS idx_vendas_palestrante_id ON public.vendas(palestrante_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON public.vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_consultor_id ON public.vendas(consultor_id);
CREATE INDEX IF NOT EXISTS idx_vendas_data_evento ON public.vendas(data_evento);

CREATE INDEX IF NOT EXISTS idx_kanban_cards_venda_id ON public.kanban_cards(venda_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_setor_coluna ON public.kanban_cards(setor, coluna);

CREATE INDEX IF NOT EXISTS idx_crm_atividades_lead_id ON public.crm_atividades(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_atividades_responsavel ON public.crm_atividades(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_crm_historico_lead_id ON public.crm_historico(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_comentarios_lead_id ON public.crm_comentarios(lead_id);

CREATE INDEX IF NOT EXISTS idx_propostas_lead_id ON public.propostas(lead_id);
CREATE INDEX IF NOT EXISTS idx_proposta_palestrantes_proposta_id ON public.proposta_palestrantes(proposta_id);
CREATE INDEX IF NOT EXISTS idx_lead_pal_rec_lead_id ON public.lead_palestrante_recomendacoes(lead_id);

CREATE INDEX IF NOT EXISTS idx_contas_pagar_venc ON public.contas_pagar(vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON public.contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_venc ON public.contas_receber(vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON public.contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_venda_id ON public.contas_receber(venda_id);

CREATE INDEX IF NOT EXISTS idx_comissoes_venda_id ON public.comissoes(venda_id);
CREATE INDEX IF NOT EXISTS idx_comissoes_conta_id ON public.comissoes(conta_id);

CREATE INDEX IF NOT EXISTS idx_agenda_eventos_inicio ON public.agenda_eventos(inicio);
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_responsavel ON public.agenda_eventos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel_id ON public.tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON public.tarefas(status);
CREATE INDEX IF NOT EXISTS idx_processos_status ON public.processos(status);

CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida ON public.notificacoes(user_id, lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created ON public.notificacoes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entidade ON public.audit_logs(entidade, entidade_id);

CREATE INDEX IF NOT EXISTS idx_logistica_venda_id ON public.logistica(venda_id);
CREATE INDEX IF NOT EXISTS idx_eventos_nps_venda_id ON public.eventos_nps(venda_id);

-- Tighten permissive RLS
DROP POLICY IF EXISTS "auth all agenda" ON public.agenda_eventos;
CREATE POLICY "authenticated all agenda" ON public.agenda_eventos
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth all processos" ON public.processos;
CREATE POLICY "authenticated all processos" ON public.processos
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth all tarefas" ON public.tarefas;
CREATE POLICY "authenticated all tarefas" ON public.tarefas
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Revoke EXECUTE on trigger-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.log_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notificar_lead_atribuido() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notificar_tarefa_atribuida() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.criar_atividades_etapa() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.criar_kanban_venda() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calcular_comissoes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.gerar_numero_contrato() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lead_ganho_criar_venda() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validar_proposta_palestrante() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.registrar_historico_lead_after_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.registrar_historico_lead_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.registrar_historico_lead_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.registrar_historico_recomendacao() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.atualizar_status_contas() FROM PUBLIC, anon, authenticated;

-- Multi-empresa preparation (nullable, non-breaking)
ALTER TABLE public.leads          ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas_polo(id) ON DELETE SET NULL;
ALTER TABLE public.vendas         ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas_polo(id) ON DELETE SET NULL;
ALTER TABLE public.clientes       ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas_polo(id) ON DELETE SET NULL;
ALTER TABLE public.palestrantes   ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas_polo(id) ON DELETE SET NULL;
ALTER TABLE public.contas_pagar   ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas_polo(id) ON DELETE SET NULL;
ALTER TABLE public.contas_receber ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas_polo(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_empresa_id ON public.leads(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vendas_empresa_id ON public.vendas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_clientes_empresa_id ON public.clientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_palestrantes_empresa_id ON public.palestrantes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_empresa ON public.contas_pagar(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_empresa ON public.contas_receber(empresa_id);