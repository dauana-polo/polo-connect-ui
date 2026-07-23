# Sprint 01 — Consolidação da Base

Escopo: **auditoria + refatoração interna sem alterar UX, layout ou fluxo funcional**. Nenhuma nova feature.

## 1. Levantamento (leitura, sem mudanças)

- Mapear todas as 19 rotas `app.*.tsx` e catalogar padrões duplicados.
- Rodar `supabase--linter` para pegar RLS/policy/índice ausentes.
- Rodar `security--run_security_scan`.
- Verificar `routeTree`, guards de rota (`_authenticated`), middleware de auth em `start.ts`.
- Listar todas as queries diretas ao Supabase espalhadas nas rotas.

## 2. Refatorações estruturais (sem impacto visual)

### 2.1 Camada de dados centralizada
Criar `src/lib/api/` com módulos por domínio:
- `leads.ts`, `vendas.ts`, `palestrantes.ts`, `clientes.ts`, `financeiro.ts`, `agenda.ts`, `tarefas.ts`, `kanban.ts`, `comissoes.ts`, `notificacoes.ts`.
- Cada módulo expõe funções tipadas (`listLeads`, `updateLead`, etc.) usando o cliente Supabase existente.
- Substituir `supabase.from(...)` inline nas rotas por chamadas a essas funções.

### 2.2 Hooks reutilizáveis
`src/hooks/`:
- `useSupabaseQuery.ts` — wrapper padronizado (loading/error/refetch + toast).
- `useRealtimeTable.ts` — assinatura Realtime reutilizável (hoje repetida em CRM, Kanban, Notificações).
- `useRole.ts` — leitura de `user_roles` centralizada (hoje consultada em ≥3 rotas).
- `useEmpresaAtiva.ts` — preparar contexto multiempresa (leitura simples, sem quebrar nada).

### 2.3 Componentes compartilhados
Extrair para `src/components/shared/`:
- `PageHeader.tsx` (título + ações — padrão repetido em quase toda rota).
- `KpiCard.tsx` (usado em Dashboard, Financeiro, Comissões, Pré-Balanço, Eventos).
- `EmptyState.tsx`, `LoadingState.tsx`.
- `DataTable.tsx` fino sobre shadcn `Table` com paginação/ordenação.
- `MoneyInput.tsx` e helpers `formatCurrency`, `formatDate`, `formatCNPJ` em `src/lib/format.ts`.
- `ConfirmDialog.tsx` para confirmações destrutivas (hoje reimplementado várias vezes).

### 2.4 Contextos
- Consolidar `useAuth` já existente; adicionar `RoleContext` derivado (evita refetch de perfil por página).

### 2.5 Tipagens
- Reexportar tipos gerados de `integrations/supabase/types.ts` em `src/lib/types.ts` com aliases de domínio (`Lead`, `Venda`, `Palestrante`…) para não vazar `Database['public']['Tables']…` pelo código.

## 3. Banco de dados

Uma migration única de consolidação:
- **Índices** nas FKs mais consultadas: `leads.consultor_id`, `leads.cliente_id`, `vendas.lead_id`, `vendas.palestrante_id`, `vendas.cliente_id`, `kanban_cards.venda_id`, `kanban_cards(setor,coluna)`, `crm_atividades.lead_id`, `crm_historico.lead_id`, `contas_pagar.vencimento`, `contas_receber.vencimento`, `agenda_eventos.data_inicio`, `tarefas.responsavel_id`, `notificacoes(user_id, lida)`, `comissoes.venda_id`.
- **RLS**: rodar linter, corrigir policies faltantes, garantir `service_role` grant em todas as tabelas públicas, remover policies `USING (true)` de escrita se existirem.
- **Integridade**: conferir `ON DELETE` das FKs de palestrantes/vendas (manter `RESTRICT` conforme decisão anterior).
- **Multiempresa (preparação, não ativação)**: adicionar coluna `empresa_id uuid NULL` em tabelas de negócio (`leads`, `vendas`, `clientes`, `palestrantes`, `contas_*`) referenciando `empresas_polo`, sem tornar NOT NULL nem alterar policies ainda — só criar o campo e o índice, para migração futura sem breaking change.

Se linter apontar problemas, resolver na mesma migration.

## 4. Segurança

- Rodar `security--run_security_scan` e `supabase--linter` e corrigir o que aparecer.
- Confirmar que nenhuma rota `/app/*` está fora de `_authenticated`.
- Garantir que `handle_new_user` e demais funções `SECURITY DEFINER` têm `SET search_path = public` (já têm — validar).
- Revisar policies para não exporem dados via `anon` em tabelas sensíveis.

## 5. Performance

- Substituir `select('*')` por colunas específicas nas listagens grandes (Kanban, CRM, Financeiro).
- Adicionar `limit()` e paginação onde faltar em Auditoria e Notificações.
- Memoizar cálculos pesados em `app.comissoes.tsx`, `app.prebalanco.tsx`, `app.financeiro.tsx` (`useMemo` onde ainda não há).
- Verificar re-subscribes Realtime (garantir cleanup no `useEffect`).

## 6. Não faz parte desta sprint

- Nenhuma nova tela, rota, feature ou mudança de layout.
- Nenhuma ativação real de multiempresa (só schema preparatório).
- Nenhuma alteração em integrações externas.

## 7. Entregável final

Relatório em chat cobrindo os 6 tópicos pedidos (Arquitetura, Banco, Código, Segurança, Performance, Próximos passos) com o que foi de fato alterado e o que ficou como recomendação.

---

**Confirma este plano?** Posso executar tudo em sequência (é uma sprint de refactor extensa — múltiplos arquivos novos em `lib/api`, `hooks`, `components/shared`, substituições em cada rota, e 1 migration consolidada).
