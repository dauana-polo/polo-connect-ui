# API e acesso a dados

## Camada `src/lib/api`

- `clientes.ts`: `listClientes`, `searchClientes`, `getCliente`, `upsertCliente`.
- `leads.ts`: listar, consultar, criar, atualizar, mover etapa e excluir leads.
- `vendas.ts`: listar, consultar, criar, atualizar e verificar conflito de agenda.
- `palestrantes.ts`: listar, consultar, atualizar e excluir palestrantes.
- `notificacoes.ts`: listar notificações do usuário e marcar como lidas.
- `index.ts`: exporta os módulos por domínio.

Algumas telas legadas ainda acessam o cliente do banco diretamente; novas refatorações devem preferir essa camada central.

## RPCs financeiras

- `comissoes_lista`: lista paginada e detalhada.
- `comissoes_meses_disponiveis`: períodos disponíveis.
- `comissoes_por_mes`: totais mensais.
- `comissoes_por_tipo`: distribuição por tipo.
- `comissoes_resumo`: bruto, pago, pendente e vendas únicas.
- `atualizar_status_contas`: atualização operacional de status.

## Serviços externos

A consulta de CNPJ usa BrasilAPI no cadastro de clientes. Não há integração ativa com Pipedrive: o protótipo usa apenas sua organização visual como referência. Não há endpoints novos nem operações externas nesta entrega.