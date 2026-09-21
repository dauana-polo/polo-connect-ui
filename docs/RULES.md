# Regras de negócio e permissões

## Comercial

- Propostas só podem conter palestrantes previamente recomendados.
- Para marcar ganho é necessário proposta, cliente vinculado, data, palestrante selecionado, cachê válido e ausência de conflito de agenda.
- A implementação atual cria uma venda por palestrante escolhido e inicia os registros operacionais automáticos.
- No protótipo, o CNPJ é opcional no cadastro do cliente, mas obrigatório no fechamento; os não escolhidos exigem resultado perdido e motivo.
- Os motivos de perda por palestrante e o fluxo Pipedrive são somente demonstrações visuais nesta fase.
- Busca, vínculo e cadastro rápido de cliente, contatos, recomendação, proposta e validações de fechamento ficam dentro da negociação aberta no CRM.

## Operação

- O palestrante não pode ocupar dois eventos ativos na mesma data.
- Venda, logística, checklist, NPS e cards operacionais permanecem ligados por FKs e automações.
- O protótipo do Pós-venda consolida o andamento de Jurídico, Logística, Financeiro e Faturamento.
- Anexos de NF, contrato, arquivos variados, QR Code, envolvidos, faturador e atividades com prazos são visuais e ainda não persistem.

## Permissões na interface

- `admin` e `gestor`: acesso amplo.
- `comercial`: CRM, clientes, propostas e vendas; agenda e tarefas conforme a matriz atual.
- `financeiro`: financeiro completo e leitura de clientes/vendas.
- `pos_venda`, `logistica` e `juridico`: seu fluxo operacional, vendas em leitura e tarefas próprias.
- `palestrante`: portal próprio, fora de `/app`.

`<Can />` esconde ou desabilita ações na interface, mas não substitui RLS. Papéis nunca são validados por armazenamento local.

## Financeiro futuro

O Modelo A/B de recebimento ainda precisa ser modelado. Emissão fiscal/faturamento e integração de contrato do Portal do Palestrante não devem ser implementados sem confirmação explícita.