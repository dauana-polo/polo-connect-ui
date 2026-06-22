
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- 1. USUÁRIOS
create table public.usuarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  nome text not null, email text unique not null,
  perfil text not null check (perfil in ('admin','gestor','comercial','pos_venda','juridico','financeiro','logistica','palestrante')),
  ativo boolean default true, avatar_url text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
grant select, insert, update, delete on public.usuarios to authenticated;
grant all on public.usuarios to service_role;
alter table public.usuarios enable row level security;

create or replace function public.meu_perfil()
returns text language sql stable security definer set search_path = public as $$
  select perfil from public.usuarios where user_id = auth.uid()
$$;

create policy "usuarios_select_self_or_admin" on public.usuarios for select to authenticated
  using (user_id = auth.uid() or public.meu_perfil() in ('admin','gestor'));
create policy "usuarios_update_self_or_admin" on public.usuarios for update to authenticated
  using (user_id = auth.uid() or public.meu_perfil() in ('admin','gestor'));
create policy "usuarios_insert_admin" on public.usuarios for insert to authenticated
  with check (public.meu_perfil() in ('admin','gestor'));
create policy "usuarios_delete_admin" on public.usuarios for delete to authenticated
  using (public.meu_perfil() = 'admin');

-- 2. EMPRESAS
create table public.empresas_polo (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null, nome_fantasia text, cnpj text unique not null,
  regime text check (regime in ('simples','lucro_presumido','lucro_real')),
  aliq_iss numeric(5,2) default 5.00, aliq_pis numeric(5,2) default 0.65,
  aliq_cofins numeric(5,2) default 3.00, aliq_irrf numeric(5,2) default 1.50,
  aliq_csll numeric(5,2) default 1.00, ativo boolean default true,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.empresas_polo to authenticated;
grant all on public.empresas_polo to service_role;
alter table public.empresas_polo enable row level security;
create policy "empresas_interno_all" on public.empresas_polo for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','financeiro','juridico'))
  with check (public.meu_perfil() in ('admin','gestor','financeiro'));
insert into public.empresas_polo (razao_social, cnpj, regime) values
  ('Polo Eventos LTDA','12.345.678/0001-90','lucro_presumido'),
  ('Polo Internacional SA','98.765.432/0001-10','lucro_presumido'),
  ('Polo Talents ME','11.222.333/0001-44','simples');

-- 3. CLIENTES
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null, nome_fantasia text, cnpj text, segmento text,
  contato_nome text, contato_email text, contato_tel text, contato_cargo text,
  cep text, logradouro text, numero text, bairro text, cidade text, estado text,
  total_eventos int default 0, total_gasto numeric default 0, ultimo_evento date,
  ativo boolean default true,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
grant select, insert, update, delete on public.clientes to authenticated;
grant all on public.clientes to service_role;
alter table public.clientes enable row level security;
create policy "clientes_interno_all" on public.clientes for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','financeiro','juridico','logistica'))
  with check (public.meu_perfil() in ('admin','gestor','comercial','pos_venda'));

create table public.cliente_contatos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete cascade,
  nome text not null, cargo text, email text, telefone text,
  principal boolean default false, created_at timestamptz default now()
);
grant select, insert, update, delete on public.cliente_contatos to authenticated;
grant all on public.cliente_contatos to service_role;
alter table public.cliente_contatos enable row level security;
create policy "cliente_contatos_interno_all" on public.cliente_contatos for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','financeiro','juridico','logistica'))
  with check (public.meu_perfil() in ('admin','gestor','comercial','pos_venda'));

-- 4. PALESTRANTES
create table public.palestrantes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  nome text not null, nome_artistico text,
  email text unique not null, telefone text,
  bio text, mini_bio text, foto_url text, video_url text,
  tipo_pessoa text check (tipo_pessoa in ('PF','PJ')) default 'PJ',
  cpf text, cnpj text, razao_social text, nome_fantasia text, insc_municipal text,
  regime text check (regime in ('simples','lucro_presumido','lucro_real','mei','pf')),
  cep text, logradouro text, numero text, bairro text, cidade text, estado text,
  banco text, agencia text, conta text,
  tipo_conta text check (tipo_conta in ('corrente','poupança')),
  pix text,
  cache_min numeric, cache_max numeric, cache_padrao numeric,
  exclusivo boolean default false, temas text[], formatos text[],
  status text check (status in ('ativo','inativo','pendente','validacao')) default 'pendente',
  publicar_site boolean default false,
  total_eventos int default 0, avaliacao_media numeric(3,1) default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
-- Índices de busca trigram (immutable)
create index idx_palestrantes_nome_trgm on public.palestrantes using gin (nome gin_trgm_ops);
create index idx_palestrantes_bio_trgm on public.palestrantes using gin (bio gin_trgm_ops);
grant select, insert, update, delete on public.palestrantes to authenticated;
grant select on public.palestrantes to anon;
grant all on public.palestrantes to service_role;
alter table public.palestrantes enable row level security;
create policy "palestrantes_public_site" on public.palestrantes for select to anon
  using (publicar_site = true and status = 'ativo');
create policy "palestrantes_select" on public.palestrantes for select to authenticated
  using (user_id = auth.uid() or public.meu_perfil() in ('admin','gestor','comercial','pos_venda','juridico','financeiro','logistica'));
create policy "palestrantes_update" on public.palestrantes for update to authenticated
  using (user_id = auth.uid() or public.meu_perfil() in ('admin','gestor','comercial'));
create policy "palestrantes_insert" on public.palestrantes for insert to authenticated
  with check (public.meu_perfil() in ('admin','gestor','comercial'));
create policy "palestrantes_delete" on public.palestrantes for delete to authenticated
  using (public.meu_perfil() in ('admin','gestor'));

-- 5. LEADS
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  contato_nome text, contato_email text, contato_tel text,
  tema_evento text, data_pretendida date, cidade_evento text,
  formato text check (formato in ('presencial','online','hibrido')),
  publico_estimado int, orcamento_est numeric, descricao text,
  etapa text check (etapa in ('novo','contato_realizado','proposta_enviada','negociacao','fechado','perdido')) default 'novo',
  motivo_perda text,
  consultor_id uuid references public.usuarios(id),
  cliente_id uuid references public.clientes(id),
  origem text check (origem in ('site','indicacao','ativo','email','linkedin','outro')),
  convertido boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
grant select, insert, update, delete on public.leads to authenticated;
grant insert on public.leads to anon;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "leads_public_form_insert" on public.leads for insert to anon
  with check (origem = 'site');
create policy "leads_interno_all" on public.leads for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda'))
  with check (public.meu_perfil() in ('admin','gestor','comercial','pos_venda'));

create table public.lead_interacoes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  usuario_id uuid references public.usuarios(id),
  tipo text check (tipo in ('ligacao','email','whatsapp','reuniao','nota')),
  descricao text not null, created_at timestamptz default now()
);
grant select, insert, update, delete on public.lead_interacoes to authenticated;
grant all on public.lead_interacoes to service_role;
alter table public.lead_interacoes enable row level security;
create policy "lead_interacoes_interno" on public.lead_interacoes for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda'))
  with check (public.meu_perfil() in ('admin','gestor','comercial','pos_venda'));

-- 6. PROPOSTAS
create table public.propostas (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id),
  cliente_id uuid references public.clientes(id),
  consultor_id uuid references public.usuarios(id),
  titulo text not null, descricao text, validade date,
  status text check (status in ('rascunho','enviada','visualizada','aprovada','recusada')) default 'rascunho',
  pdf_sugestao_url text, pdf_proposta_url text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
grant select, insert, update, delete on public.propostas to authenticated;
grant all on public.propostas to service_role;
alter table public.propostas enable row level security;
create policy "propostas_interno" on public.propostas for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','juridico'))
  with check (public.meu_perfil() in ('admin','gestor','comercial'));

create table public.proposta_palestrantes (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid references public.propostas(id) on delete cascade,
  palestrante_id uuid references public.palestrantes(id),
  justificativa text, cache_proposto numeric,
  ordem int default 0, selecionado boolean default false
);
grant select, insert, update, delete on public.proposta_palestrantes to authenticated;
grant all on public.proposta_palestrantes to service_role;
alter table public.proposta_palestrantes enable row level security;
create policy "proposta_palestrantes_interno" on public.proposta_palestrantes for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','juridico'))
  with check (public.meu_perfil() in ('admin','gestor','comercial'));

-- 7. VENDAS
create table public.vendas (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid references public.propostas(id),
  lead_id uuid references public.leads(id),
  cliente_id uuid references public.clientes(id) not null,
  palestrante_id uuid references public.palestrantes(id) not null,
  consultor_id uuid references public.usuarios(id),
  empresa_polo_id uuid references public.empresas_polo(id),
  titulo text not null,
  data_evento date, horario_inicio time, horario_fim time,
  cidade text, estado text, local_evento text,
  formato text check (formato in ('presencial','online','hibrido')),
  publico_estimado int, briefing text,
  valor_total numeric not null,
  cache_palestr numeric not null,
  valor_iss numeric generated always as (valor_total * 0.05) stored,
  valor_pis numeric generated always as (valor_total * 0.0065) stored,
  valor_cofins numeric generated always as (valor_total * 0.03) stored,
  valor_irrf numeric generated always as (valor_total * 0.015) stored,
  valor_csll numeric generated always as (valor_total * 0.01) stored,
  total_impostos numeric generated always as (valor_total * 0.1015) stored,
  valor_liquido numeric generated always as (valor_total - (valor_total * 0.1015)) stored,
  status text check (status in ('ativo','suspenso','cancelado','concluido')) default 'ativo',
  created_at timestamptz default now(), updated_at timestamptz default now()
);
grant select, insert, update, delete on public.vendas to authenticated;
grant all on public.vendas to service_role;
alter table public.vendas enable row level security;
create policy "vendas_select" on public.vendas for select to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','juridico','financeiro','logistica'));
create policy "vendas_insert" on public.vendas for insert to authenticated
  with check (public.meu_perfil() in ('admin','gestor','comercial'));
create policy "vendas_update" on public.vendas for update to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda'));
create policy "vendas_delete" on public.vendas for delete to authenticated
  using (public.meu_perfil() in ('admin','gestor'));

-- 8. KANBAN
create table public.kanban_cards (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references public.vendas(id) on delete cascade,
  setor text not null check (setor in ('pos_venda','juridico','financeiro','logistica','palestrante')),
  coluna text not null, posicao int default 0, notas text,
  responsavel_id uuid references public.usuarios(id),
  updated_at timestamptz default now()
);
create index idx_kanban_venda_setor on public.kanban_cards(venda_id, setor);
create index idx_kanban_setor on public.kanban_cards(setor, coluna);
grant select, insert, update, delete on public.kanban_cards to authenticated;
grant all on public.kanban_cards to service_role;
alter table public.kanban_cards enable row level security;
create policy "kanban_interno" on public.kanban_cards for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','juridico','financeiro','logistica'))
  with check (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','juridico','financeiro','logistica'));

-- 9. FINANCEIRO
create table public.contas_receber (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references public.vendas(id) on delete cascade,
  empresa_id uuid references public.empresas_polo(id),
  parcela int not null default 1, total_parcelas int not null default 1,
  valor numeric not null, vencimento date not null,
  recebido_em date, valor_recebido numeric,
  status text check (status in ('pendente','recebido','atrasado','cancelado')) default 'pendente',
  forma_pgto text check (forma_pgto in ('pix','ted','boleto','cartao','cheque')),
  observacao text, created_at timestamptz default now()
);
grant select, insert, update, delete on public.contas_receber to authenticated;
grant all on public.contas_receber to service_role;
alter table public.contas_receber enable row level security;
create policy "contas_receber_fin" on public.contas_receber for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','financeiro'))
  with check (public.meu_perfil() in ('admin','gestor','financeiro'));

create table public.contas_pagar (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references public.vendas(id),
  empresa_id uuid references public.empresas_polo(id),
  tipo text check (tipo in ('cache','fornecedor','despesa','imposto','salario','outro')),
  descricao text not null, beneficiario text,
  palestrante_id uuid references public.palestrantes(id),
  valor numeric not null, vencimento date, pago_em date,
  status text check (status in ('pendente','pago','cancelado')) default 'pendente',
  forma_pgto text, observacao text,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.contas_pagar to authenticated;
grant all on public.contas_pagar to service_role;
alter table public.contas_pagar enable row level security;
create policy "contas_pagar_fin" on public.contas_pagar for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','financeiro'))
  with check (public.meu_perfil() in ('admin','gestor','financeiro'));

create table public.comissoes (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid references public.contas_receber(id) on delete cascade,
  venda_id uuid references public.vendas(id),
  usuario_id uuid references public.usuarios(id),
  tipo text check (tipo in ('consultor','curador','cs','gestao','indicacao')),
  percentual numeric(5,2) not null, base_calculo numeric not null, valor numeric not null,
  pago boolean default false, pago_em date,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.comissoes to authenticated;
grant all on public.comissoes to service_role;
alter table public.comissoes enable row level security;
create policy "comissoes_select" on public.comissoes for select to authenticated
  using (public.meu_perfil() in ('admin','gestor','financeiro')
         or usuario_id in (select id from public.usuarios where user_id = auth.uid()));
create policy "comissoes_write" on public.comissoes for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','financeiro'))
  with check (public.meu_perfil() in ('admin','gestor','financeiro'));

create table public.regras_comissao (
  id uuid primary key default gen_random_uuid(),
  tipo text not null, percentual numeric(5,2) not null,
  ativo boolean default true, created_at timestamptz default now()
);
grant select, insert, update, delete on public.regras_comissao to authenticated;
grant all on public.regras_comissao to service_role;
alter table public.regras_comissao enable row level security;
create policy "regras_select" on public.regras_comissao for select to authenticated using (true);
create policy "regras_write" on public.regras_comissao for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','financeiro'))
  with check (public.meu_perfil() in ('admin','gestor','financeiro'));
insert into public.regras_comissao (tipo, percentual) values
  ('consultor',10.00),('curador',5.00),('cs',3.00),('gestao',2.00);

-- 10. CONTRATOS
create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  numero text unique,
  venda_id uuid references public.vendas(id),
  empresa_polo_id uuid references public.empresas_polo(id),
  modelo text check (modelo in ('padrao','corporativo','exclusivo','internacional')),
  conteudo text,
  status text check (status in ('rascunho','enviado','assinado','arquivado')) default 'rascunho',
  pdf_url text, clicksign_key text,
  assinado_cliente_em timestamptz, assinado_polo_em timestamptz,
  data_geracao timestamptz default now(),
  data_envio timestamptz, data_assinatura timestamptz,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.contratos to authenticated;
grant all on public.contratos to service_role;
alter table public.contratos enable row level security;
create policy "contratos_interno" on public.contratos for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','juridico','financeiro'))
  with check (public.meu_perfil() in ('admin','gestor','juridico'));

-- 11. LOGÍSTICA
create table public.logistica (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references public.vendas(id) on delete cascade,
  passagem_ida_cia text, passagem_ida_voo text, passagem_ida_data date, passagem_ida_hora time,
  passagem_ida_origem text, passagem_ida_destino text, passagem_ida_url text,
  passagem_volta_cia text, passagem_volta_voo text, passagem_volta_data date, passagem_volta_hora time,
  hotel_nome text, hotel_checkin date, hotel_checkout date, hotel_endereco text, hotel_reserva text, hotel_url text,
  transfer_ida_empresa text, transfer_ida_data timestamptz, transfer_ida_obs text,
  transfer_volta_empresa text, transfer_volta_data timestamptz, transfer_volta_obs text,
  status text check (status in ('pendente','em_andamento','concluido')) default 'pendente',
  observacoes text, updated_at timestamptz default now()
);
grant select, insert, update, delete on public.logistica to authenticated;
grant all on public.logistica to service_role;
alter table public.logistica enable row level security;
create policy "logistica_interno" on public.logistica for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','logistica','financeiro'))
  with check (public.meu_perfil() in ('admin','gestor','logistica','pos_venda'));

-- 12. NPS
create table public.eventos_nps (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references public.vendas(id) on delete cascade,
  qr_code_url text, qr_code_token text unique default gen_random_uuid()::text,
  total_respostas int default 0,
  nps_medio numeric(4,1), nota_palestrante numeric(4,1), nota_organizacao numeric(4,1),
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.eventos_nps to authenticated;
grant select on public.eventos_nps to anon;
grant all on public.eventos_nps to service_role;
alter table public.eventos_nps enable row level security;
create policy "eventos_nps_public" on public.eventos_nps for select to anon using (true);
create policy "eventos_nps_interno" on public.eventos_nps for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','logistica'))
  with check (public.meu_perfil() in ('admin','gestor','pos_venda'));

create table public.nps_respostas (
  id uuid primary key default gen_random_uuid(),
  evento_nps_id uuid references public.eventos_nps(id) on delete cascade,
  nota_geral int check (nota_geral between 0 and 10),
  nota_palestrante int check (nota_palestrante between 1 and 5),
  nota_organizacao int check (nota_organizacao between 1 and 5),
  comentario text, created_at timestamptz default now()
);
grant select, insert, update, delete on public.nps_respostas to authenticated;
grant insert on public.nps_respostas to anon;
grant all on public.nps_respostas to service_role;
alter table public.nps_respostas enable row level security;
create policy "nps_resp_public_insert" on public.nps_respostas for insert to anon with check (true);
create policy "nps_resp_interno_select" on public.nps_respostas for select to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda'));

-- 13. DOCUMENTOS
create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references public.vendas(id),
  cliente_id uuid references public.clientes(id),
  palestrante_id uuid references public.palestrantes(id),
  tipo text check (tipo in ('contrato','nf','af','oes','comprovante','proposta','briefing','passagem','outro')),
  nome text not null, url text not null, tamanho_kb int,
  enviado_por uuid references public.usuarios(id),
  created_at timestamptz default now()
);
create index idx_documentos_venda on public.documentos(venda_id);
grant select, insert, update, delete on public.documentos to authenticated;
grant all on public.documentos to service_role;
alter table public.documentos enable row level security;
create policy "documentos_interno" on public.documentos for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','juridico','financeiro','logistica'))
  with check (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','juridico','financeiro','logistica'));

-- 14. CHECKLISTS
create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references public.vendas(id) on delete cascade,
  tipo text check (tipo in ('time','palestrante','cliente')),
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.checklists to authenticated;
grant all on public.checklists to service_role;
alter table public.checklists enable row level security;
create policy "checklists_interno" on public.checklists for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','logistica'))
  with check (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','logistica'));

create table public.checklist_itens (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid references public.checklists(id) on delete cascade,
  descricao text not null, concluido boolean default false,
  concluido_em timestamptz, concluido_por uuid references public.usuarios(id),
  ordem int default 0
);
grant select, insert, update, delete on public.checklist_itens to authenticated;
grant all on public.checklist_itens to service_role;
alter table public.checklist_itens enable row level security;
create policy "checklist_itens_interno" on public.checklist_itens for all to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','logistica'))
  with check (public.meu_perfil() in ('admin','gestor','comercial','pos_venda','logistica'));

-- 15. PORTAL PALESTRANTE
create table public.palestrante_indicacoes (
  id uuid primary key default gen_random_uuid(),
  palestrante_id uuid references public.palestrantes(id) on delete cascade,
  total_cotacoes int default 0, total_vendas int default 0, total_recebido numeric default 0,
  updated_at timestamptz default now()
);
grant select, insert, update, delete on public.palestrante_indicacoes to authenticated;
grant all on public.palestrante_indicacoes to service_role;
alter table public.palestrante_indicacoes enable row level security;
create policy "pal_ind_select" on public.palestrante_indicacoes for select to authenticated
  using (public.meu_perfil() in ('admin','gestor','comercial','financeiro')
         or palestrante_id in (select id from public.palestrantes where user_id = auth.uid()));
create policy "pal_ind_write" on public.palestrante_indicacoes for all to authenticated
  using (public.meu_perfil() in ('admin','gestor'))
  with check (public.meu_perfil() in ('admin','gestor'));

-- 16. SITE CONFIG
create table public.site_config (
  id uuid primary key default gen_random_uuid(),
  chave text unique not null, valor text,
  updated_at timestamptz default now()
);
grant select on public.site_config to anon, authenticated;
grant insert, update, delete on public.site_config to authenticated;
grant all on public.site_config to service_role;
alter table public.site_config enable row level security;
create policy "site_config_read" on public.site_config for select using (true);
create policy "site_config_admin" on public.site_config for all to authenticated
  using (public.meu_perfil() in ('admin','gestor'))
  with check (public.meu_perfil() in ('admin','gestor'));

-- TRIGGERS
create or replace function public.criar_kanban_venda()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.kanban_cards (venda_id, setor, coluna, posicao) values
    (new.id,'pos_venda','entrada',0),(new.id,'juridico','entrada',0),
    (new.id,'financeiro','entrada',0),(new.id,'logistica','entrada',0),
    (new.id,'palestrante','entrada',0);
  insert into public.logistica (venda_id) values (new.id);
  insert into public.eventos_nps (venda_id) values (new.id);
  return new;
end;
$$;
create trigger trigger_criar_kanban after insert on public.vendas
  for each row execute function public.criar_kanban_venda();

create or replace function public.calcular_comissoes()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_regra record;
begin
  if new.status = 'recebido' and (old.status is distinct from 'recebido') then
    for v_regra in select * from public.regras_comissao where ativo = true loop
      insert into public.comissoes (conta_id, venda_id, tipo, percentual, base_calculo, valor)
      values (new.id, new.venda_id, v_regra.tipo, v_regra.percentual,
              coalesce(new.valor_recebido, new.valor),
              coalesce(new.valor_recebido, new.valor) * (v_regra.percentual / 100));
    end loop;
  end if;
  return new;
end;
$$;
create trigger trigger_calcular_comissoes after update on public.contas_receber
  for each row execute function public.calcular_comissoes();

create or replace function public.gerar_numero_contrato()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_ano text; v_seq int;
begin
  v_ano := to_char(now(),'YYYY');
  select coalesce(max(cast(split_part(numero,'-',3) as int)),0)+1
    into v_seq from public.contratos where numero like 'CT-'||v_ano||'-%';
  new.numero := 'CT-'||v_ano||'-'||lpad(v_seq::text,3,'0');
  return new;
end;
$$;
create trigger trigger_numero_contrato before insert on public.contratos
  for each row execute function public.gerar_numero_contrato();

-- ÍNDICES
create index idx_vendas_cliente on public.vendas(cliente_id);
create index idx_vendas_palestrante on public.vendas(palestrante_id);
create index idx_vendas_data on public.vendas(data_evento);
create index idx_vendas_status on public.vendas(status);
create index idx_leads_etapa on public.leads(etapa);
create index idx_leads_consultor on public.leads(consultor_id);
create index idx_contas_vencimento on public.contas_receber(vencimento);
create index idx_contas_status on public.contas_receber(status);
create index idx_contratos_status on public.contratos(status);
