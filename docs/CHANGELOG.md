# Changelog

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
