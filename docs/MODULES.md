# Módulos

| Módulo | Rotas | Estado | Dependências |
|---|---|---|---|
| Site institucional e catálogo | `/`, `/catalogo`, `/palestrante/$id`, `/solucoes`, `/institucional`, `/orcamento` | Produção | palestrantes, palestras, site_config |
| Acesso e portal | `/auth`, `/portal` | Produção | autenticação, palestrantes |
| Dashboard executivo | `/app` | Produção | leads, vendas, contas a receber |
| CRM comercial | `/app/crm` | Produção + protótipo visual complementar | clientes, contatos, recomendações, propostas, vendas |
| Consulta/Negociação | `/app/consultas` | Protótipo visual | encaminhamentos do CRM; dados fictícios |
| Clientes | `/app/clientes` | Produção | contatos, leads e vendas |
| Propostas e vendas | `/app/propostas`, `/app/vendas` | Produção | CRM, clientes e palestrantes |
| Agenda e tarefas | `/app/agenda`, `/app/tarefas` | Produção | responsáveis, leads, clientes e vendas |
| Processos | `/app/processos` | Produção, preservado fora do menu | templates e vínculos operacionais |
| Kanban multissetorial | `/app/kanban` | Produção + protótipo pós-venda | vendas, jurídico, logística e financeiro |
| Eventos e logística | `/app/eventos`, `/app/logistica` | Produção | vendas, checklists e NPS |
| Jurídico | `/app/juridico` | Em validação | contratos e vendas |
| Financeiro | `/app/financeiro`, `/app/comissoes`, `/app/prebalanco` | Operacional; produtização avançada pendente | vendas, clientes e empresas |
| Administração | `/app/admin` | Produção | usuários, papéis e auditoria |

## Protótipos de 2026-09-21

- Consulta/Negociação cuida somente do retorno e das condições negociadas com palestrantes.
- Cliente, contatos, recomendação, proposta e fechamento obrigatório permanecem no CRM comercial.
- O Pós-venda ganha uma visão demonstrativa consolidada de Jurídico, Logística, Financeiro e Faturamento.
- Nenhuma ação dessas demonstrações persiste dados.
- A criação do negócio no CRM oferece cliente existente ou novo e contatos existentes ou novo contato.
- Recomendação e fechamento são regras aplicadas às ações comerciais existentes, não abas ou etapas adicionais do funil.