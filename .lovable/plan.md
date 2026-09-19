# Plano — Protótipo de Consulta e Negociação

## Objetivo
Criar somente uma demonstração visual dos novos fluxos, sem gravar dados, consultar o banco ou alterar o funcionamento atual. Os exemplos serão fictícios e as ações existirão para navegar e visualizar estados do protótipo.

## O que será criado

### 1. Nova área “Consulta/Negociação”
- Trocar no menu o acesso visível de “Processos” por “Consulta/Negociação”.
- Manter a página e a rota atual de Processos preservadas, apenas fora do menu principal.
- Criar um painel de consultas com filas: novas solicitações, em contato, disponível, indisponível e concluída.
- Exibir cliente, evento, data, comercial responsável, palestrantes consultados e andamento.
- Ao abrir uma consulta, mostrar campos demonstrativos para anotações, cachê, condições, disponibilidade e retorno do palestrante.
- Simular o aviso ao comercial quando a disponibilidade for informada.

### 2. Fluxo visual no CRM
- Acrescentar a ação “Enviar para consulta” aos palestrantes recomendados.
- Mostrar o encaminhamento visual para a nova área, sem salvar ou disparar notificações reais.
- Adicionar campo de comentário com marcação de pessoas e uma prévia da notificação gerada.
- Preservar o funil, o cadastro e todas as ações atuais.

### 3. Recomendações e propostas
- Criar uma visualização demonstrativa da recomendação de palestrantes.
- Mostrar o botão “Gerar PDF de recomendações” sem gerar arquivo nesta fase.
- Na proposta, permitir visualmente apenas palestrantes presentes na recomendação.
- Mostrar o botão “Gerar PDF da proposta” sem gerar arquivo nesta fase.

### 4. Cliente e contato simplificados
- Demonstrar cadastro de cliente com opção explícita “Salvar sem CNPJ”.
- Mostrar busca por nome/telefone com resultados fictícios antes de criar um cliente.
- Permitir, no protótipo, escolher cliente existente ou abrir o cadastro rápido de novo cliente.
- Incluir contato rápido com nome, e-mail, telefone e cargo.
- Na simulação de fechamento, bloquear visualmente a venda quando o cliente estiver sem CNPJ e indicar a ação para completar o cadastro.

### 5. Fechamento da negociação
- No fluxo visual de ganho, exigir a escolha do palestrante fechado.
- Exigir que todos os demais sejam marcados como perdidos, cada um com motivo digitado.
- Mostrar uma prévia de como esses motivos aparecerão no histórico do palestrante.
- Impedir visualmente a confirmação enquanto houver palestrante sem resultado ou sem motivo.

## Direção visual e responsividade
- Reutilizar o padrão visual atual do ERP, sem redesenhar módulos existentes.
- Usar estados claros, indicadores de fila e diálogos objetivos em desktop e celular.
- Identificar discretamente a nova área como “Protótipo”, evitando confusão com dados reais.

## Proteção do que já existe
- Nenhuma alteração de tabelas, políticas, autenticação, storage ou dados.
- Nenhuma ação do protótipo chamará operações de criação, edição ou exclusão no banco.
- A rota atual de Processos continuará disponível e seu código não será removido.
- O erro de carregamento observado na tela de acesso será corrigido sem mudar seu layout ou fluxo.

## Validação e documentação
- Testar navegação, abertura dos painéis, estados simulados, bloqueio por CNPJ e fechamento com motivos obrigatórios.
- Conferir o protótipo em desktop e celular.
- Completar e atualizar a documentação obrigatória em `/docs`, incluindo arquitetura, módulos, regras, decisões, API, banco, roadmap e histórico, deixando explícito o que é apenas protótipo.

## Resultado esperado
Um protótipo navegável que demonstra todo o fluxo comercial → consulta → retorno → proposta → ganho/perda, com dados fictícios e sem impacto nos dados ou funcionalidades atuais.
