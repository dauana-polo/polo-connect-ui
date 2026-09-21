# Banco de dados

## Domínios e tabelas

| Domínio | Tabelas principais | Relações centrais |
|---|---|---|
| Identidade | `usuarios`, `user_roles` | usuário autenticado ↔ perfil interno e papéis |
| Comercial | `leads`, `lead_interacoes`, `lead_palestrante_recomendacoes`, `crm_atividades`, `crm_comentarios`, `crm_historico`, `propostas`, `proposta_palestrantes` | lead ↔ cliente, consultor, recomendações e propostas |
| Cadastros | `clientes`, `cliente_contatos`, `palestrantes`, `palestras`, `empresas_polo`, `faixas_cache` | clientes ↔ contatos; palestrantes ↔ palestras e empresa |
| Vendas | `vendas`, `kanban_cards`, `checklists`, `checklist_itens`, `logistica`, `eventos_nps`, `nps_respostas` | venda ↔ cliente, palestrante, proposta e operação |
| Financeiro | `contas_pagar`, `contas_receber`, `comissoes`, `regras_comissao`, `palestrante_indicacoes` | lançamentos e comissões ↔ venda e empresa |
| Jurídico e arquivos | `contratos`, `documentos` | contrato/documento ↔ venda, cliente ou palestrante |
| Produtividade | `agenda_eventos`, `tarefas`, `processos`, `notificacoes` | itens ↔ responsáveis, clientes, leads e vendas |
| Governança | `audit_logs`, `site_config` | auditoria e configuração pública |

## Segurança

As tabelas públicas usam RLS. Papéis são armazenados separadamente em `user_roles`; `has_role` e `is_admin_or_gestor` apoiam as políticas. `audit_logs` e `crm_historico` restringem alterações destrutivas; respostas NPS não permitem edição ou exclusão.

## Funções e automações relevantes

- `handle_new_user`: cria o registro interno após cadastro.
- `criar_kanban_venda`: prepara cards operacionais e registros vinculados à venda.
- `lead_ganho_criar_venda`: automatiza a conversão do lead ganho.
- `calcular_comissoes`: calcula comissões relacionadas à venda.
- `atualizar_status_contas`: atualiza situação financeira.
- `criar_atividades_etapa`: cria atividades do CRM por etapa.
- `registrar_historico_*`, `registrar_historico_recomendacao` e `log_change`: registram histórico e auditoria.
- `validar_matriz_filial`, `validar_proposta_palestrante` e `exigir_motivo_indisponibilidade`: validam regras críticas.

## Estado do protótipo atual

Nenhuma tabela, política, função, storage ou dado foi alterado. Campos de interveniente, testemunha, faturador, anexos e atividades operacionais exibidos no dossiê pós-venda são apenas demonstrativos. No cadastro de palestrantes, as liberações de valor/agenda e os campos de logística/rider também são somente visuais. A área de materiais consulta apenas `foto_url`, `video_url` e registros existentes de `documentos` vinculados por `palestrante_id`.