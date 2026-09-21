# Changelog

## [2026-09-21] - Protótipo comercial, negociação e pós-venda

- Criada a área visual `Consulta/Negociação`, limitada à negociação e ao retorno dos palestrantes, com dados fictícios.
- Adicionado ao CRM o protótipo integrado de cliente/contatos, recomendação, proposta em PDF e fechamento obrigatório com CNPJ e motivos de perda.
- Adicionada ao Pós-venda uma visão geral de Jurídico, Logística, Financeiro e Faturamento, com dossiê demonstrativo de envolvidos, faturador, documentos, QR Code e atividades.
- A rota de Processos foi preservada fora do menu.
- Corrigida a estabilidade da hidratação da tela de acesso sem mudar seu fluxo visual.
- Nenhum schema, dado, arquivo ou integração externa foi alterado; todas as novas ações são demonstrativas.

## [2026-07-25] - Bloco 2b Operacional

- **Agenda** (`app.agenda.tsx`): dialog "Novo compromisso" migrado para RHF+Zod (`compromissoSchema` com `requiredString` no título e validação de data/hora); botão de criar gated por `<Can resource="agenda" action="edit">`; `LoadingState`/`ErrorState` cobrindo o carregamento do mês.
- **Tarefas** (`app.tarefas.tsx`): dialog "Nova tarefa" com RHF+Zod (`tarefaSchema`); `AsyncState` na lista; botão criar, checkbox de conclusão e botão de excluir gated por `<Can resource="tarefas" action="edit">`; exclusão passa por `ConfirmDialog`.
- **Processos** (`app.processos.tsx`): `NovoProcessoDialog` reescrito com RHF+Zod (`processoSchema`); `AsyncState` na grade; ações "Avançar etapa" e "Remover" no drawer gated por `<Can resource="processos" action="edit">`; remoção passa por `ConfirmDialog`.
- **Logística** (`app.logistica.tsx`): `LoadingState`/`ErrorState` no carregamento; botão "Salvar logística" gated por `<Can resource="logistica" action="edit">` com fallback informando modo somente leitura.
- **Palestrantes** (`app.palestrantes.tsx`): botões novo/editar/excluir gated por `<Can resource="palestrantes" action="edit">`; lista lateral usando `AsyncState` com empty/error consistentes.
- **Eventos** (`app.eventos.tsx`): já opera como leitura (checklists + NPS) — sem ações mutativas, mantido; relacionamentos venda↔checklists e venda↔NPS validados.
- **Marcar como Ganho** (`MarcarGanhoDialog`): validações reforçadas — exige proposta, cliente vinculado, data pretendida, ao menos um palestrante recomendado marcado, e cachê proposto > 0 em cada selecionado; conflito de agenda por palestrante/data continua checado; invalida `vendas` e `kanban` após sucesso para refletir automaticamente kanban operacional e checklists gerados pelo trigger `criar_kanban_venda`. Gate `<Can resource="crm" action="edit">` já aplicado no ponto de disparo (LeadDrawer + botão de topo do CRM no Bloco 2a).

## [2026-07-24] - Bloco 2a Comercial finalizado


## [2026-07-24] - Bloco 2a Comercial finalizado

- **LeadDrawer (CRM)**: `TabDetalhes` migrado para react-hook-form + zod (schema com `requiredString`, `optionalEmail`, `phoneSchema`, `isoDateSchema`); campos ficam `disabled` sem permissão `crm:edit`; botão Salvar, wizard "Nova venda" e "Marcar como ganho" gated por `<Can>`; select de etapa desabilitado sem permissão.
- **VendaDrawer**: reescrito com react-hook-form + zod (`vendaSchema` com `moneySchema`, `isoDateSchema`, `requiredString`), `Controller` para selects, `LoadingState` no carregamento, validação de conflito de agenda mantida, todos os inputs `disabled` sem `vendas:edit`.
- **Clientes**: `NovoClienteForm` aceita `initial` e faz `update` quando em modo edição; novo botão "Editar" no cabeçalho do cliente, protegido por `<Can resource="clientes" action="edit">`; consulta BrasilAPI reaproveitada.

## [2026-07-24] - Bloco 2a (primeiro ciclo)

- `NewLeadDialog`, `app.propostas`, `app.vendas`, `app.clientes` migrados para RHF+zod, `<Can>`, `AsyncState` e `ConfirmDialog`.

## [Sprint 02 · Bloco 1]

- Criados `usePermissions`, `<Can>`, `AsyncState`, `ErrorState`, `LoadingState`, validators centralizados em `src/lib/validators.ts`.
- `app.prebalanco`, `app.comissoes`, `catalogo`, `palestrante.$id`, `portal.index` conectados ao Supabase.

## [Sprint 01]

- 35 índices, políticas RLS revisadas, `src/lib/api/` centralizado, `src/components/shared/*`, `src/lib/format.ts`.
