# Fase 1 — Fundação (Auth, Usuários, Empresas, Permissões, Notificações, Auditoria)

## Contexto

O projeto já tem Lovable Cloud (Supabase) conectado, com 22 tabelas do ERP (leads, vendas, kanban, etc.), a tabela `usuarios` com campo `perfil` (enum textual), função `meu_perfil()`, trigger `handle_new_user()` que cria linha em `usuarios` no signup, e RLS ativo. **Não existe tela de login** — o app assume usuário autenticado.

Esta fase entrega a camada de identidade e administração que faltava, sem quebrar o CRM/Kanban já funcionais.

## Entregas

### 1. Autenticação real (Supabase Auth)
- Rota pública `/auth` com abas **Entrar / Cadastrar / Esqueci minha senha** (design dark premium + vermelho).
- Rota `/auth/reset-password` para definir nova senha após clique no e-mail.
- `emailRedirectTo` e `redirectTo` apontando para o origin correto.
- **Auto-confirm de e-mail ativado** (para acelerar testes; documentar como desativar em produção).
- Gate de rotas: mover `/app/*` para `src/routes/_authenticated/app.*` sob layout gerenciado `_authenticated/route.tsx` (ssr:false, redireciona para `/auth`).
- `attachSupabaseAuth` já registrado no `start.ts` (verificar).
- Header do `/app` mostra usuário logado + botão **Sair** (com teardown de cache).
- Listener `onAuthStateChange` no `__root.tsx` invalidando router/queries.

### 2. Sistema de roles/permissões (RLS seguro)
Migrar do campo textual `usuarios.perfil` (vulnerável a escalada) para o padrão canônico:
- Enum `app_role` (admin, gestor, comercial, pos_venda, juridico, financeiro, logistica, palestrante).
- Tabela `user_roles (user_id, role)` com RLS, GRANTs.
- Função `has_role(_user_id, _role)` SECURITY DEFINER.
- Função `is_admin_or_gestor()` para reutilizar.
- Manter `meu_perfil()` funcionando (retorna o role primário) para não quebrar policies existentes.
- Trigger `handle_new_user`: primeiro usuário do sistema recebe `admin`; demais recebem `comercial` por padrão.
- Backfill: migrar valores existentes de `usuarios.perfil` para `user_roles`.

### 3. Módulo Usuários (`/app/admin` — aba Usuários)
- Listagem de usuários com nome, e-mail, roles (badges), status ativo.
- Criar novo usuário (via convite — server function usando `supabaseAdmin.auth.admin.inviteUserByEmail`).
- Editar nome, ativar/desativar, gerenciar roles (multi-select).
- Server functions protegidas com `requireSupabaseAuth` + verificação de role admin.
- Acesso restrito a admin/gestor.

### 4. Empresas / Contas
Nota: já existe `empresas_polo` (nossos CNPJs internos) e `clientes` (contas dos clientes). Interpretar "Empresas" como **fortalecer o CRUD de `empresas_polo`** (dados fiscais internos usados no cálculo de impostos), já que multi-tenant real exigiria refactor de todas as 22 tabelas — fora de escopo da Fase 1.
- Nova aba em `/app/admin` — **Empresas** — CRUD completo de `empresas_polo` (razão social, CNPJ, regime tributário, alíquotas).
- Se o usuário quiser multi-tenant de verdade (cada workspace = agência isolada), levantar como escopo separado no fim.

### 5. Notificações in-app
- Tabela `notificacoes (user_id, titulo, mensagem, tipo, link, lida, created_at)` + RLS por dono.
- Componente **sino** no topo do `/app` com contador e dropdown das últimas 10.
- Realtime via `supabase.channel` para push instantâneo.
- Helper `criarNotificacao()` (server fn) para outros módulos dispararem.
- Triggers de exemplo: novo lead atribuído ao consultor, venda criada, atividade CRM vencendo.

### 6. Logs / Auditoria
- Tabela `audit_logs (user_id, acao, entidade, entidade_id, dados_antes, dados_depois, ip, user_agent, created_at)` + RLS (só admin lê).
- Trigger genérico `log_change()` aplicado nas tabelas críticas: `leads`, `vendas`, `contratos`, `user_roles`, `empresas_polo`.
- Nova aba em `/app/admin` — **Auditoria** — com filtros por usuário, entidade, data.

### 7. Configurações do sistema
- Já existe `site_config`. Adicionar aba **Configurações** em `/app/admin` para editar chave/valor (nome da empresa, logo, cores, e-mail de contato).
- Restrito a admin.

## Fora de escopo (fases seguintes)
- Multi-tenancy real por workspace/organização.
- Integrações externas (Stripe, WhatsApp, Google Calendar, etc.) — Fase 3/4.
- BI, automações — Fase 4.
- Dashboards com dados 100% reais — a maior parte já lê do Supabase; refinar na Fase 2.

## Detalhes técnicos

- **Migrations**: uma única migration cobrindo `user_roles`, `has_role`, `notificacoes`, `audit_logs`, trigger de auditoria, GRANTs, RLS policies, backfill.
- **Server functions**: `src/lib/admin/users.functions.ts`, `src/lib/admin/empresas.functions.ts`, `src/lib/notifications/notifications.functions.ts` — todas com `requireSupabaseAuth` + checagem `has_role(userId, 'admin')` quando privilegiadas; `supabaseAdmin` importado dinamicamente dentro dos handlers para operações que exijam service role (convite de usuário).
- **RLS policies existentes**: mantidas. Novas policies usam `has_role()` em vez de comparar `usuarios.perfil` diretamente para evitar recursão.
- **Design**: reutilizar tokens do design system (dark premium + accent vermelho); componentes shadcn já disponíveis.
- **Auth config**: `supabase--configure_auth` com `auto_confirm_email: true`, `disable_signup: false`, `external_anonymous_users_enabled: false`, `password_hibp_enabled: true`.
- **Providers sociais**: Google via `supabase--configure_social_auth` — pedir confirmação antes de habilitar (não incluído por padrão, só se você quiser).

## Ao terminar, direi

- O que ficou funcional.
- Warnings de segurança remanescentes (se houver).
- O que precisa de ação manual sua (ex: primeiro usuário admin — criar conta no `/auth` e o sistema promove automaticamente).
- Confirmação para seguir para a Fase 2.
