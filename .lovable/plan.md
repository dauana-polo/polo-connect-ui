# Plano — CRM Comercial Polo Palestrantes

Transformar o módulo `/app/crm` em um CRM profissional (estilo Pipedrive/HubSpot) adaptado para venda de palestras, com pipeline kanban, atividades automáticas, recomendações, propostas vinculadas, histórico auditável e disparo automático dos Kanbans operacionais ao fechar a venda.

---

## 1. Banco de Dados (migration)

### Ajustes em tabelas existentes
- `leads`: adicionar coluna `etapa` (enum `lead_etapa`) com as 9 fases do pipeline; `responsavel_id`, `data_evento`, `cidade_evento`, `publico_estimado`, `tema`, `objetivo`, `orcamento_min`, `orcamento_max`, `motivo_perda`.
- `palestrante_indicacoes` (já existe): expandir com `cache_proposto`, `status` (`pendente|consultado|disponivel|indisponivel|recomendado`), `observacoes`, `ordem`, `disponibilidade_verificada_em`.
- `propostas`: adicionar `versao`, `lead_id` (FK), `condicoes_comerciais`, `taxas`, `observacoes`.
- `proposta_palestrantes`: garantir FK obrigatória para `palestrante_indicacoes` (proposta só usa palestrantes recomendados).

### Tabelas novas
- `crm_atividades` — tipo (`ligacao|email|whatsapp|reuniao|tarefa|followup`), título, descrição, prazo, concluída, concluída_em, responsável, lead_id.
- `crm_historico` — timeline imutável: lead_id, usuario_id, tipo_evento, descricao, payload jsonb, created_at.
- `crm_comentarios` — lead_id, usuario_id, texto, created_at.
- `projetos_operacionais` — criado ao ganhar a venda; agrega referências dos 4 kanbans operacionais.

### Triggers automáticos
- **`trg_lead_etapa_atividades`**: ao inserir lead OU alterar `etapa`, cria as atividades pré-definidas da etapa correspondente (Contato Recebido, Briefing, Consulta, Negociação com 3 follow-ups, Contratação).
- **`trg_lead_historico`**: log automático em `crm_historico` para qualquer mudança em `etapa`, `responsavel_id`, `orcamento`, inclusão/remoção de palestrantes recomendados, alteração/criação de proposta.
- **`trg_lead_ganho_kanbans`**: ao mover para `ganho`, cria registro em `projetos_operacionais` + 4 cards de kanban (CS, Financeiro, Suporte Palestrante, Operação Evento) já populados com cliente, evento, palestrante contratado, cachê.

### RLS
- Consultor: CRUD nos próprios leads (`responsavel_id = auth.uid()`).
- Líder e Admin: acesso total via `has_role()`.

---

## 2. Frontend — `/app/crm`

### Layout
```text
┌─ Header: filtros (responsável, período) + botão "Novo Lead" + toggle Kanban/Lista
├─ Dashboard (cards de KPIs no topo, colapsável)
└─ Pipeline Kanban (9 colunas, drag-and-drop)
```

### Componentes principais
- `CrmPipeline.tsx` — board com 9 colunas; drag-and-drop muda `etapa` (dispara triggers).
- `LeadCard.tsx` — card resumo (cliente, valor, palestrante destaque, atividades pendentes, dias na etapa).
- `LeadDrawer.tsx` — drawer lateral ao clicar no card, com abas:
  - **Detalhes** — campos editáveis conforme etapa (briefing exige campos obrigatórios).
  - **Recomendações** — adicionar/remover palestrantes (busca em `palestrantes`), cachê, status, obs.
  - **Consultas** — para cada recomendado: botões "Consultar agenda/cachê/disponibilidade", muda status.
  - **Propostas** — lista de propostas com versões; criar nova só permite selecionar palestrantes que estão na aba Recomendações.
  - **Atividades** — pendentes/concluídas, criar manualmente (ligação, email, WhatsApp, reunião).
  - **Comentários** — chat interno.
  - **Timeline** — `crm_historico` em ordem cronológica.
- `CrmDashboard.tsx` — KPIs: leads recebidos, briefings, propostas, taxa de conversão, ganhos/perdidos, valor em negociação, valor ganho, ticket médio, conversão por consultor/palestrante, tempo médio por etapa.

### Regras de UI
- Botão "Criar Proposta" desabilitado se não houver palestrantes recomendados.
- Modal de proposta lista apenas palestrantes presentes em `palestrante_indicacoes` do lead.
- Mover card para "Ganho" abre confirmação que mostra o que será criado nos kanbans operacionais.
- Mover para "Perdido" exige `motivo_perda`.
- Campos obrigatórios da etapa 2 são validados antes de avançar para etapa 3+.

### Permissões (UI + RLS)
- Consultor: cria/edita seus cards e propostas.
- Líder: tudo do consultor + reatribuir responsável + aprovar exceções (override de regras).
- Admin: tudo.

---

## 3. Detalhes técnicos

- **Stack**: TanStack Start + Query + Supabase client browser (RLS escopa por perfil).
- **Drag-and-drop**: `@dnd-kit/core` (já no projeto, senão adiciono).
- **Loaders**: `ensureQueryData` para leads + `useSuspenseQuery` no componente.
- **Mutations**: `useMutation` com `queryClient.invalidateQueries` para o pipeline e timeline.
- **Realtime opcional**: deixar fora desta entrega; recarrega ao focar.
- **Triggers SQL** garantem atividades, histórico e kanbans automáticos — frontend só dispara update de `etapa`/insert de lead; consistência fica no banco.

---

## 4. Entrega em fases

1. **Migration** (tabelas, colunas, triggers, RLS, grants) — aprovação primeiro.
2. **Pipeline Kanban + LeadDrawer (abas Detalhes, Recomendações, Atividades, Timeline, Comentários)**.
3. **Aba Consultas + Aba Propostas (com regra de palestrantes recomendados)**.
4. **Dashboard de KPIs**.
5. **Confirmação visual da etapa "Ganho" + verificação dos kanbans operacionais criados**.

Cada fase é validada antes de seguir para a próxima. Posso começar pela migration assim que você aprovar este plano.
