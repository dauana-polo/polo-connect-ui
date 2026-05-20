export const palestrantes = [
  { id: "1", nome: "Dr. Ricardo Almeida", foto: "https://i.pravatar.cc/300?img=12", temas: ["Liderança", "Inovação", "Gestão"], valor: 35000, bio: "Especialista em transformação cultural com 20 anos de mercado.", avaliacao: 4.9, eventos: 142, videoThumb: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400" },
  { id: "2", nome: "Mariana Costa", foto: "https://i.pravatar.cc/300?img=47", temas: ["Marketing Digital", "Vendas", "Branding"], valor: 28000, bio: "Ex-CMO de unicórnios brasileiros e autora best-seller.", avaliacao: 4.8, eventos: 98, videoThumb: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400" },
  { id: "3", nome: "Carlos Mendes", foto: "https://i.pravatar.cc/300?img=33", temas: ["Tecnologia", "IA", "Futuro do Trabalho"], valor: 45000, bio: "Pesquisador em IA pela Stanford e palestrante TED.", avaliacao: 5.0, eventos: 76, videoThumb: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400" },
  { id: "4", nome: "Juliana Rocha", foto: "https://i.pravatar.cc/300?img=44", temas: ["Diversidade", "ESG", "Cultura"], valor: 22000, bio: "Consultora de diversidade para Fortune 500.", avaliacao: 4.7, eventos: 110, videoThumb: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400" },
  { id: "5", nome: "Felipe Toledo", foto: "https://i.pravatar.cc/300?img=15", temas: ["Alta Performance", "Mentalidade", "Esporte"], valor: 18000, bio: "Atleta olímpico e mentor executivo.", avaliacao: 4.9, eventos: 205, videoThumb: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=400" },
  { id: "6", nome: "Beatriz Lima", foto: "https://i.pravatar.cc/300?img=49", temas: ["Finanças", "Investimentos", "Economia"], valor: 32000, bio: "Economista-chefe e comentarista de TV.", avaliacao: 4.8, eventos: 87, videoThumb: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400" },
];

export const kpis = {
  receita: 1284500,
  receitaDelta: 12.4,
  eventos: 47,
  eventosDelta: 8.2,
  leads: 213,
  leadsDelta: 23.1,
  vendas: 19,
  vendasDelta: -3.5,
};

export const receitaMensal = [
  { mes: "Jan", receita: 620000, meta: 700000 },
  { mes: "Fev", receita: 780000, meta: 750000 },
  { mes: "Mar", receita: 820000, meta: 800000 },
  { mes: "Abr", receita: 910000, meta: 850000 },
  { mes: "Mai", receita: 1050000, meta: 950000 },
  { mes: "Jun", receita: 980000, meta: 1000000 },
  { mes: "Jul", receita: 1180000, meta: 1050000 },
  { mes: "Ago", receita: 1284500, meta: 1100000 },
];

export const agendaEventos = [
  { id: "e1", data: "22 Mai", cliente: "Banco Itaú", palestrante: "Dr. Ricardo Almeida", local: "São Paulo, SP", valor: 35000, status: "confirmado" },
  { id: "e2", data: "24 Mai", cliente: "Vale S.A.", palestrante: "Carlos Mendes", local: "Belo Horizonte, MG", valor: 45000, status: "confirmado" },
  { id: "e3", data: "27 Mai", cliente: "Magazine Luiza", palestrante: "Mariana Costa", local: "Franca, SP", valor: 28000, status: "pendente" },
  { id: "e4", data: "30 Mai", cliente: "Natura", palestrante: "Juliana Rocha", local: "Cajamar, SP", valor: 22000, status: "confirmado" },
  { id: "e5", data: "02 Jun", cliente: "Ambev", palestrante: "Felipe Toledo", local: "São Paulo, SP", valor: 18000, status: "confirmado" },
];

export const pipelineStages = [
  { id: "novo", titulo: "Novo Lead", cor: "bg-slate-500" },
  { id: "contato", titulo: "Contato realizado", cor: "bg-blue-500" },
  { id: "proposta", titulo: "Proposta enviada", cor: "bg-violet-500" },
  { id: "negociacao", titulo: "Negociação", cor: "bg-amber-500" },
  { id: "fechado", titulo: "Fechado", cor: "bg-emerald-500" },
  { id: "perdido", titulo: "Perdido", cor: "bg-rose-500" },
];

export const leads = [
  { id: "l1", empresa: "Petrobras", evento: "Convenção Anual de Líderes", valor: 45000, consultor: "Ana Silva", data: "15/06", palestrante: "Carlos Mendes", stage: "novo" },
  { id: "l2", empresa: "Bradesco", evento: "Summit de Inovação", valor: 38000, consultor: "Pedro Souza", data: "12/06", palestrante: "Dr. Ricardo Almeida", stage: "novo" },
  { id: "l3", empresa: "Ambev", evento: "Kickoff Comercial", valor: 22000, consultor: "Ana Silva", data: "20/06", palestrante: "Felipe Toledo", stage: "contato" },
  { id: "l4", empresa: "JBS", evento: "Conferência ESG", valor: 25000, consultor: "Lucas Martins", data: "18/06", palestrante: "Juliana Rocha", stage: "contato" },
  { id: "l5", empresa: "B3", evento: "Encontro de Investidores", valor: 32000, consultor: "Pedro Souza", data: "25/06", palestrante: "Beatriz Lima", stage: "proposta" },
  { id: "l6", empresa: "XP Inc", evento: "Expert Conference", valor: 55000, consultor: "Ana Silva", data: "28/06", palestrante: "Dr. Ricardo Almeida", stage: "proposta" },
  { id: "l7", empresa: "Magazine Luiza", evento: "Treinamento Liderança", valor: 28000, consultor: "Lucas Martins", data: "10/07", palestrante: "Mariana Costa", stage: "negociacao" },
  { id: "l8", empresa: "Vale", evento: "Workshop Inovação", valor: 45000, consultor: "Pedro Souza", data: "05/07", palestrante: "Carlos Mendes", stage: "negociacao" },
  { id: "l9", empresa: "Natura", evento: "Diversidade & Cultura", valor: 22000, consultor: "Ana Silva", data: "30/05", palestrante: "Juliana Rocha", stage: "fechado" },
  { id: "l10", empresa: "Itaú", evento: "Convenção Top Performers", valor: 35000, consultor: "Lucas Martins", data: "22/05", palestrante: "Dr. Ricardo Almeida", stage: "fechado" },
  { id: "l11", empresa: "Stone", evento: "Sales Day", valor: 18000, consultor: "Pedro Souza", data: "20/05", palestrante: "Felipe Toledo", stage: "perdido" },
];

export const propostas = [
  { id: "p1", numero: "PROP-2025-0142", cliente: "XP Inc", palestrante: "Dr. Ricardo Almeida", valor: 55000, status: "enviado", data: "12/05/2025" },
  { id: "p2", numero: "PROP-2025-0141", cliente: "Magazine Luiza", palestrante: "Mariana Costa", valor: 28000, status: "aprovado", data: "10/05/2025" },
  { id: "p3", numero: "PROP-2025-0140", cliente: "Vale", palestrante: "Carlos Mendes", valor: 45000, status: "rascunho", data: "08/05/2025" },
  { id: "p4", numero: "PROP-2025-0139", cliente: "B3", palestrante: "Beatriz Lima", valor: 32000, status: "enviado", data: "05/05/2025" },
  { id: "p5", numero: "PROP-2025-0138", cliente: "Stone", palestrante: "Felipe Toledo", valor: 18000, status: "recusado", data: "02/05/2025" },
];

export const contratos = [
  { id: "c1", numero: "CT-2025-098", cliente: "Itaú", modelo: "corporativo", valor: 35000, status: "assinado", data: "20/05/2025" },
  { id: "c2", numero: "CT-2025-097", cliente: "Natura", modelo: "padrão", valor: 22000, status: "assinado", data: "18/05/2025" },
  { id: "c3", numero: "CT-2025-096", cliente: "Vale", modelo: "exclusivo", valor: 45000, status: "enviado", data: "15/05/2025" },
  { id: "c4", numero: "CT-2025-095", cliente: "Microsoft Brasil", modelo: "internacional", valor: 85000, status: "rascunho", data: "12/05/2025" },
  { id: "c5", numero: "CT-2025-094", cliente: "Magazine Luiza", modelo: "corporativo", valor: 28000, status: "arquivado", data: "01/04/2025" },
];

export const contasReceber = [
  { id: "cr1", cliente: "Itaú", evento: "Convenção Top Performers", parcela: "1/2", valor: 17500, vencimento: "30/05/2025", status: "em aberto" },
  { id: "cr2", cliente: "Natura", evento: "Diversidade & Cultura", parcela: "Único", valor: 22000, vencimento: "05/06/2025", status: "pago" },
  { id: "cr3", cliente: "Vale", evento: "Workshop Inovação", parcela: "1/3", valor: 15000, vencimento: "10/06/2025", status: "em aberto" },
  { id: "cr4", cliente: "Ambev", evento: "Kickoff Comercial", parcela: "2/2", valor: 11000, vencimento: "15/06/2025", status: "em aberto" },
  { id: "cr5", cliente: "Magazine Luiza", evento: "Treinamento", parcela: "Único", valor: 28000, vencimento: "20/05/2025", status: "atrasado" },
];

export const contasPagar = [
  { id: "cp1", fornecedor: "Dr. Ricardo Almeida", descricao: "Cachê palestra Itaú", valor: 24500, vencimento: "10/06/2025", status: "em aberto" },
  { id: "cp2", fornecedor: "Mariana Costa", descricao: "Cachê Magazine Luiza", valor: 19600, vencimento: "12/06/2025", status: "em aberto" },
  { id: "cp3", fornecedor: "Hotel Tivoli", descricao: "Hospedagem evento Vale", valor: 4200, vencimento: "08/06/2025", status: "pago" },
  { id: "cp4", fornecedor: "Azul Linhas Aéreas", descricao: "Passagens equipe", valor: 6800, vencimento: "05/06/2025", status: "pago" },
];

export const usuarios = [
  { id: "u1", nome: "Ana Silva", email: "ana@polopalestrantes.com", perfil: "Consultor Comercial", status: "ativo", ultimoLogin: "Hoje, 09:42" },
  { id: "u2", nome: "Pedro Souza", email: "pedro@polopalestrantes.com", perfil: "Consultor Comercial", status: "ativo", ultimoLogin: "Hoje, 08:15" },
  { id: "u3", nome: "Lucas Martins", email: "lucas@polopalestrantes.com", perfil: "Gerente Comercial", status: "ativo", ultimoLogin: "Ontem, 18:30" },
  { id: "u4", nome: "Camila Ferreira", email: "camila@polopalestrantes.com", perfil: "Financeiro", status: "ativo", ultimoLogin: "Hoje, 10:05" },
  { id: "u5", nome: "Roberto Dias", email: "roberto@polopalestrantes.com", perfil: "Administrador", status: "ativo", ultimoLogin: "Hoje, 07:30" },
  { id: "u6", nome: "Marina Alves", email: "marina@polopalestrantes.com", perfil: "Jurídico", status: "inativo", ultimoLogin: "12/05/2025" },
];

export const interacoes = [
  { id: "i1", tipo: "email", titulo: "E-mail enviado com proposta inicial", autor: "Ana Silva", data: "Hoje, 14:32" },
  { id: "i2", tipo: "ligacao", titulo: "Ligação - cliente pediu ajuste no escopo", autor: "Ana Silva", data: "Hoje, 11:15" },
  { id: "i3", tipo: "reuniao", titulo: "Reunião de alinhamento agendada", autor: "Pedro Souza", data: "Ontem, 16:00" },
  { id: "i4", tipo: "nota", titulo: "Cliente prefere palestrante com perfil mais técnico", autor: "Ana Silva", data: "Ontem, 10:20" },
];

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
