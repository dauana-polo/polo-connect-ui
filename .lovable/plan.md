## Objetivo

1. Criar uma tela/modal "Venda" para visualizar e salvar dados de uma venda existente (tabela `vendas`).
2. Refatorar `/app/kanban` para ler dados reais de `kanban_cards` + `vendas` + `clientes` + `palestrantes`, com drag-and-drop, drawer de detalhes, filtros e responsividade mobile.

---

## 1. Modelo de Venda (formulário de edição)

Criar `src/components/vendas/VendaDrawer.tsx` — Drawer/Sheet lateral reutilizável que carrega uma venda por `id` e permite editar e salvar.

Campos editáveis (com base na tabela `vendas`):
- Título, data_evento, cidade, formato, publico_estimado
- Briefing (textarea), observacoes
- Valor_total, cache_palestr
- Status: select (`ativo` | `suspenso` | `concluido` | `cancelado`)
- Read-only: cliente (nome), palestrante (nome), consultor, proposta vinculada

Comportamento:
- Carrega via `supabase.from('vendas').select('*, clientes(nome), palestrantes(nome), usuarios(nome)').eq('id', id).single()`
- Botão **Salvar** faz `update` em `vendas` com os campos editáveis
- Toast de confirmação
- Botões de atalho: "Abrir no Jurídico", "Abrir no Financeiro", "Abrir Logística" (navegam para o setor correspondente do Kanban filtrado por essa venda)

---

## 2. Refatoração do Kanban (`src/routes/app.kanban.tsx`)

### Estrutura de dados

Constante `SETORES` definindo as 5 abas e suas colunas (alinhadas ao enunciado):

```text
pos_venda  → entrada | briefing_solicitado | briefing_recebido | concluido
juridico   → entrada | contrato_gerado | enviado_assinatura | assinado | concluido
financeiro → entrada | aguardando_pagamento | recebido_parcial | recebido_total | concluido
logistica  → entrada | passagens | hospedagem | transfer | checklist_ok
palestrante→ entrada | contrato_enviado | confirmado | briefing_lido | ok
```

Cada coluna tem `key` (valor salvo em `kanban_cards.coluna`) e `label` (exibido).

### Query principal

```ts
supabase
  .from('kanban_cards')
  .select(`
    id, setor, coluna, posicao, notas,
    vendas (
      id, titulo, data_evento, valor_total, status,
      clientes (nome),
      palestrantes (nome),
      consultor_id
    )
  `)
  .eq('setor', setorAtivo)
```

Aplica filtros client-side (período/consultor/palestrante/cliente). Reagrupa por `coluna`.

### Abas (desktop) / Dropdown (mobile)

- `< md`: `<Select>` shadcn para escolher setor
- `>= md`: `<Tabs>` com 5 triggers

### Cards

Cada card mostra:
- Título do evento (`vendas.titulo`)
- Cliente (`clientes.nome`)
- Palestrante (`palestrantes.nome`)
- Data (formatada pt-BR) + valor (R$)
- Borda colorida por `vendas.status`:
  - `ativo` → `border-l-4 border-blue-500`
  - `suspenso` → `border-l-4 border-yellow-500`
  - `concluido` → `border-l-4 border-green-500`

### Drag-and-drop

Implementação nativa HTML5 (sem libs):
- `draggable`, `onDragStart` (guarda `cardId`), `onDragOver` (preventDefault), `onDrop` na coluna
- Ao soltar: `update kanban_cards set coluna = X where id = cardId`
- Optimistic update local + `toast.success("Card movido para {coluna}")`
- Em caso de erro: reverte e `toast.error`

### Layout responsivo das colunas

- Desktop (`>= lg`): grid horizontal com todas as colunas visíveis (`grid-cols-N`)
- Tablet (`md`): scroll horizontal
- Mobile (`< md`): exibe uma coluna por vez, com header `< Coluna X / Y >` e botões prev/next para navegar; drag desabilitado (substituído por botão "Mover para..." dentro de cada card)

### Drawer de detalhes

Clique no card abre `<VendaDrawer vendaId={...}/>` (componente criado na seção 1) + um campo extra **Notas do card** (textarea ligado a `kanban_cards.notas`) com botão "Salvar nota" → `update kanban_cards set notas = ...`.

### Filtros

Barra acima do board:
- Período (select: 7/30/90 dias / todos) → filtra por `vendas.data_evento`
- Consultor (select alimentado por `usuarios` perfil=comercial)
- Palestrante (select alimentado por `palestrantes`)
- Cliente (select alimentado por `clientes`)

Filtros aplicados client-side sobre os dados carregados.

---

## Detalhes técnicos

- Toast: usar `sonner` (`import { toast } from "sonner"`)
- Drawer: `<Sheet>` de `@/components/ui/sheet`
- Select: `@/components/ui/select`
- Sem novas dependências
- Sem mudanças de schema (tabelas e colunas já existem: `kanban_cards.coluna`, `kanban_cards.notas`, `vendas.status`, etc.)
- Real-time opcional: subscription em `kanban_cards` filtrada por setor para sincronizar movimentos entre usuários (incluir como `useEffect` com `supabase.channel`)

## Arquivos afetados

- **Criar** `src/components/vendas/VendaDrawer.tsx`
- **Criar** `src/components/kanban/KanbanCard.tsx`
- **Criar** `src/components/kanban/KanbanFilters.tsx`
- **Criar** `src/components/kanban/constants.ts` (SETORES)
- **Reescrever** `src/routes/app.kanban.tsx`
