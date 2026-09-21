# Arquitetura

## Visão geral

O Polo Connect usa TanStack Start, React 19, TanStack Router, TanStack Query, Tailwind CSS 4 e Lovable Cloud. As páginas públicas e privadas ficam em `src/routes`; o agrupamento `/app` exige sessão ativa.

## Organização

- `src/routes/`: páginas e rotas.
- `src/components/ui/`: controles visuais compartilhados.
- `src/components/shared/`: `AsyncState`, `LoadingState`, `ErrorState`, `PageHeader`, `ConfirmDialog` e `<Can />`.
- `src/components/crm`, `kanban` e `vendas`: experiências por domínio.
- `src/lib/api/`: acesso centralizado a clientes, leads, vendas, palestrantes e notificações.
- `src/lib/validators.ts`: validações Zod reutilizáveis.
- `src/hooks/`: autenticação, permissões e atualizações em tempo real.

## Padrões

- Formulários produtivos usam React Hook Form e Zod.
- Dados remotos usam TanStack Query; telas de consulta usam estados de carregamento, vazio e erro.
- Ações sensíveis usam `<Can />`; a proteção real permanece nas políticas do banco.
- Cores e estados visuais usam tokens semânticos definidos em `src/styles.css`.
- Os protótipos de Consulta/Negociação, fluxo comercial e dossiê pós-venda são visuais: não gravam novos campos ou documentos.

## Autenticação

`/app` valida a sessão e direciona visitantes para `/auth`. Papéis vêm de `user_roles`; `usuarios.perfil` permanece como dado cadastral, não como fonte de autorização.