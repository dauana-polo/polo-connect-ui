# Decisões

## Arquitetura e segurança

- `user_roles` é separado de `usuarios` para evitar escalada de privilégio e permitir RLS segura.
- `vendas` concentra os vínculos operacionais; financeiro e operação referenciam a venda em vez de duplicar cliente e evento.
- React Hook Form + Zod é o padrão de formulários; TanStack Query gerencia dados remotos.
- `<Can />` melhora a experiência por papel, enquanto RLS permanece a autoridade.

## Escopo confirmado em 2026-07-25

- O Polo Connect deve substituir completamente o Sistema ADM; é obrigatório levantar o que esse sistema cobre.
- O Modelo A (empresa recebe e paga palestrante) e o Modelo B (palestrante recebe e paga comissão) precisam ser modelados antes do Financeiro avançado.
- Emissão de Nota Fiscal/faturamento ainda não foi aprovada como módulo funcional.
- Upload/assinatura ClickSign pelo Portal do Palestrante ainda não foi aprovado.

## Protótipo de 2026-09-21

- Consulta/Negociação foi delimitada ao setor que consulta e negocia com palestrantes.
- Cliente, contato, recomendação, proposta e fechamento ficam no CRM comercial, com referência organizacional do Pipedrive sem integração externa.
- Pós-venda será o ponto de controle geral do andamento de Jurídico, Logística, Financeiro e Faturamento.
- Novos campos, anexos, atividades, obrigatoriedades e notificações são apenas protótipo visual. Essa escolha preserva banco, dados e comportamento existentes até validação da cliente.
- Cliente e contato são partes da criação do negócio no CRM. Recomendação e fechamento não são etapas do funil: são regras obrigatórias aplicadas às ações de proposta e ganho.
- O cadastro de palestrantes será a fonte interna consolidada para conteúdos enviados pelo palestrante, fotos, documentos, logística e rider técnico.
- Valor e agenda terão permissões de visualização para clientes separadas. Na fase atual, esses controles são somente demonstrativos e não modificam banco, portal público ou políticas de acesso.