
## Objetivo

Criar todo o banco de dados do ERP Polo Palestrantes no Lovable Cloud, exatamente como definido no SQL enviado: 22 tabelas, triggers automáticos, RLS por perfil, índices e regras de comissão padrão. Banco fica **vazio** — sem dados mock migrados. As telas continuam usando mock por enquanto.

## O que será criado

**22 tabelas** organizadas em 16 blocos:
1. `usuarios` — perfis internos (admin, gestor, comercial, pós-venda, jurídico, financeiro, logística, palestrante)
2. `empresas_polo` — 3 CNPJs (Polo Eventos, Polo Internacional, Polo Talents) com alíquotas
3. `clientes` + `cliente_contatos`
4. `palestrantes` (com índice de busca textual via `pg_trgm`)
5. `leads` + `lead_interacoes` (CRM)
6. `propostas` + `proposta_palestrantes`
7. `vendas` (com colunas calculadas automaticamente: ISS, PIS, COFINS, IRRF, CSLL, líquido)
8. `kanban_cards` (multisetorial)
9. `contas_receber`, `contas_pagar`, `comissoes`, `regras_comissao` (com 4 regras padrão)
10. `contratos` (com numeração automática CT-ANO-NNN)
11. `logistica` (passagens, hotel, transfer)
12. `eventos_nps` + `nps_respostas`
13. `documentos`
14. `checklists` + `checklist_itens`
15. `palestrante_indicacoes`
16. `site_config`

**3 triggers automáticos:**
- Ao criar venda → cria 5 cards no kanban + linha de logística + NPS com QR token
- Ao marcar conta como recebida → calcula comissões automaticamente conforme `regras_comissao`
- Ao criar contrato → gera número sequencial (CT-2025-001)

**RLS por perfil** usando função `meu_perfil()` (security definer): time interno vê vendas, palestrante só vê os próprios dados, financeiro vê comissões e contas.

**Seeds mínimos da estrutura:**
- 3 empresas Polo (CNPJs)
- 4 regras de comissão (consultor 10%, curador 5%, CS 3%, gestão 2%)

## Adaptações necessárias para o Lovable Cloud

O SQL enviado precisa de pequenos ajustes obrigatórios para funcionar no Cloud (regras de infra do Supabase gerenciado):

1. **Adicionar `GRANT` em todas as tabelas públicas** — o Cloud não concede privilégios padrão a `authenticated`/`service_role`. Sem isso, o PostgREST retorna erro de permissão mesmo com RLS aberto.
2. **Adicionar políticas RLS faltantes** — várias tabelas têm `ENABLE ROW LEVEL SECURITY` no SQL mas só algumas têm `CREATE POLICY` (vendas, palestrantes, comissões, contas_receber). Tabelas com RLS sem política ficam **totalmente bloqueadas**. Vou completar com políticas equivalentes baseadas em `meu_perfil()` para: usuarios, clientes, leads, propostas, kanban_cards, contas_pagar, contratos, documentos, logistica, eventos_nps.
3. **Manter `search_path` nas funções** — adicionar `set search_path = public` em `criar_kanban_venda`, `calcular_comissoes`, `gerar_numero_contrato` e `meu_perfil` para passar nos checks de segurança.
4. **`extension uuid-ossp`** — já vem habilitada no Cloud; mantenho o `if not exists`.

Nenhuma tabela, coluna, trigger ou regra de negócio do seu SQL será alterada — só adicionados GRANTs/políticas e o `search_path`.

## O que NÃO será feito neste passo

- Telas do ERP continuam usando `mock-data` (não vou conectar nada).
- Não vou migrar dados mock — banco fica limpo.
- Não vou criar buckets de Storage (palestrante fotos, contratos PDF) — fica para um próximo passo quando você quiser.
- Não vou mexer em auth/Google OAuth.

## Próximo passo (depois deste)

Quando quiser, escolhemos um módulo (Clientes, Vendas ou CRM) para começar a conectar as telas ao banco real, módulo a módulo.

## Aprovação

Ao aprovar este plano, executo uma única migration com todo o schema (22 tabelas + triggers + RLS + grants + seeds das empresas e regras de comissão).
