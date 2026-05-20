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

export const logistica = [
  {
    id: "lg1", evento: "Convenção Itaú", cliente: "Itaú", palestrante: "Dr. Ricardo Almeida",
    data: "22/05/2025", cidade: "São Paulo, SP", status: "concluido",
    voo: { cia: "LATAM", numero: "LA3287", origem: "GRU", destino: "CGH", partida: "22/05 07:30", chegada: "22/05 08:25", localizador: "X7K9P2" },
    transferIda: "Motorista Carlos - 06:00 (Toyota Corolla ABC1D23)",
    transferVolta: "Uber Black - 14:00",
    hotel: { nome: "Tivoli Mofarrej", checkin: "21/05 18:00", checkout: "22/05 12:00", reserva: "TVL-88421", quarto: "Executive Suite 1208" },
    checklist: [
      { item: "Passagem aérea emitida", ok: true },
      { item: "Hotel reservado", ok: true },
      { item: "Transfer aeroporto contratado", ok: true },
      { item: "Briefing enviado ao palestrante", ok: true },
      { item: "Confirmação 24h antes", ok: true },
    ],
  },
  {
    id: "lg2", evento: "Workshop Vale", cliente: "Vale S.A.", palestrante: "Carlos Mendes",
    data: "24/05/2025", cidade: "Belo Horizonte, MG", status: "confirmado",
    voo: { cia: "GOL", numero: "G31482", origem: "GRU", destino: "CNF", partida: "24/05 06:15", chegada: "24/05 07:35", localizador: "M3P8Q1" },
    transferIda: "Localiza Premium - 05:00 (BMW 320i XYZ4E56)",
    transferVolta: "Motorista Vale - 17:30",
    hotel: { nome: "Ouro Minas Palace", checkin: "23/05 20:00", checkout: "24/05 12:00", reserva: "OM-77231", quarto: "Suite Master 1502" },
    checklist: [
      { item: "Passagem aérea emitida", ok: true },
      { item: "Hotel reservado", ok: true },
      { item: "Transfer aeroporto contratado", ok: true },
      { item: "Briefing enviado ao palestrante", ok: true },
      { item: "Confirmação 24h antes", ok: false },
    ],
  },
  {
    id: "lg3", evento: "Treinamento Magalu", cliente: "Magazine Luiza", palestrante: "Mariana Costa",
    data: "27/05/2025", cidade: "Franca, SP", status: "comprado",
    voo: { cia: "Azul", numero: "AD4521", origem: "VCP", destino: "RAO", partida: "27/05 08:00", chegada: "27/05 09:10", localizador: "K2L5N9" },
    transferIda: "A definir",
    transferVolta: "A definir",
    hotel: { nome: "IBIS Franca", checkin: "26/05 19:00", checkout: "27/05 14:00", reserva: "IBS-44128", quarto: "Standard 412" },
    checklist: [
      { item: "Passagem aérea emitida", ok: true },
      { item: "Hotel reservado", ok: true },
      { item: "Transfer aeroporto contratado", ok: false },
      { item: "Briefing enviado ao palestrante", ok: false },
      { item: "Confirmação 24h antes", ok: false },
    ],
  },
  {
    id: "lg4", evento: "Diversidade Natura", cliente: "Natura", palestrante: "Juliana Rocha",
    data: "30/05/2025", cidade: "Cajamar, SP", status: "aguardando",
    voo: { cia: "—", numero: "Evento local (sem voo)", origem: "—", destino: "—", partida: "—", chegada: "—", localizador: "—" },
    transferIda: "Carro Polo - 07:00",
    transferVolta: "Carro Polo - 13:00",
    hotel: { nome: "Sem hospedagem (bate-volta)", checkin: "—", checkout: "—", reserva: "—", quarto: "—" },
    checklist: [
      { item: "Roteiro confirmado", ok: false },
      { item: "Transfer contratado", ok: true },
      { item: "Briefing enviado", ok: false },
      { item: "Confirmação 24h antes", ok: false },
    ],
  },
  {
    id: "lg5", evento: "Sales Day Stone", cliente: "Stone", palestrante: "Felipe Toledo",
    data: "02/06/2025", cidade: "Rio de Janeiro, RJ", status: "aguardando",
    voo: { cia: "—", numero: "Pendente compra", origem: "GRU", destino: "SDU", partida: "—", chegada: "—", localizador: "—" },
    transferIda: "Pendente", transferVolta: "Pendente",
    hotel: { nome: "Belmond Copacabana Palace", checkin: "01/06 18:00", checkout: "02/06 13:00", reserva: "Pendente", quarto: "Deluxe Ocean View" },
    checklist: [
      { item: "Passagem aérea emitida", ok: false },
      { item: "Hotel reservado", ok: false },
      { item: "Transfer contratado", ok: false },
      { item: "Briefing enviado", ok: false },
    ],
  },
];

export const npsRespostas = [
  { id: "n1", palestrante: "Dr. Ricardo Almeida", cliente: "Itaú", evento: "Convenção Top Performers", nota: 10, comentario: "Palestra excepcional, conteúdo aplicável e altíssima energia. Já estamos planejando o próximo!", data: "21/05/2025" },
  { id: "n2", palestrante: "Juliana Rocha", cliente: "Natura", evento: "Diversidade & Cultura", nota: 9, comentario: "Conteúdo profundo e provocador. Time saiu inspirado.", data: "19/05/2025" },
  { id: "n3", palestrante: "Mariana Costa", cliente: "Magazine Luiza", evento: "Treinamento Liderança", nota: 10, comentario: "Marina foi cirúrgica. Cases reais que dialogam com a operação.", data: "18/05/2025" },
  { id: "n4", palestrante: "Felipe Toledo", cliente: "Ambev", evento: "Kickoff Comercial", nota: 8, comentario: "Muito bom, faltou pouco tempo para QA.", data: "15/05/2025" },
  { id: "n5", palestrante: "Carlos Mendes", cliente: "Vale", evento: "Workshop Inovação", nota: 10, comentario: "Conexão imediata com a liderança técnica.", data: "12/05/2025" },
  { id: "n6", palestrante: "Beatriz Lima", cliente: "B3", evento: "Encontro Investidores", nota: 9, comentario: "Leitura de cenário precisa e didática.", data: "08/05/2025" },
];

export const clientes = [
  {
    id: "cl1", nome: "Itaú Unibanco", segmento: "Financeiro", cnpj: "60.701.190/0001-04",
    contato: "Renata Mello", cargo: "Head de RH", email: "renata.mello@itau.com", telefone: "(11) 98123-4521",
    ltv: 285000, eventos: 6, propostas: 9, nps: 9.7, status: "ativo",
    timeline: [
      { data: "21/05/2025", tipo: "evento", titulo: "Convenção Top Performers realizada", autor: "Sistema" },
      { data: "15/05/2025", tipo: "pagamento", titulo: "Recebimento R$ 17.500 (1/2)", autor: "Camila Ferreira" },
      { data: "10/05/2025", tipo: "contrato", titulo: "Contrato CT-2025-098 assinado", autor: "Jurídico" },
      { data: "02/05/2025", tipo: "proposta", titulo: "Proposta PROP-2025-0131 aprovada", autor: "Lucas Martins" },
      { data: "28/04/2025", tipo: "reuniao", titulo: "Reunião briefing realizada", autor: "Ana Silva" },
      { data: "20/04/2025", tipo: "lead", titulo: "Lead criado no CRM", autor: "Ana Silva" },
    ],
  },
  {
    id: "cl2", nome: "Natura &Co", segmento: "Cosméticos", cnpj: "71.673.990/0001-77",
    contato: "Bruno Tavares", cargo: "Diretor de Pessoas", email: "bruno.tavares@natura.com", telefone: "(11) 99432-1180",
    ltv: 142000, eventos: 4, propostas: 5, nps: 9.4, status: "ativo",
    timeline: [
      { data: "19/05/2025", tipo: "evento", titulo: "Evento Diversidade & Cultura realizado", autor: "Sistema" },
      { data: "12/05/2025", tipo: "contrato", titulo: "Contrato CT-2025-097 assinado", autor: "Jurídico" },
      { data: "05/05/2025", tipo: "proposta", titulo: "Proposta aprovada", autor: "Ana Silva" },
    ],
  },
  {
    id: "cl3", nome: "Vale S.A.", segmento: "Mineração", cnpj: "33.592.510/0001-54",
    contato: "Eduardo Pacheco", cargo: "VP de Operações", email: "eduardo.pacheco@vale.com", telefone: "(31) 98821-7755",
    ltv: 198000, eventos: 3, propostas: 6, nps: 9.8, status: "ativo",
    timeline: [
      { data: "15/05/2025", tipo: "contrato", titulo: "Contrato CT-2025-096 enviado", autor: "Jurídico" },
      { data: "08/05/2025", tipo: "proposta", titulo: "Proposta PROP-2025-0140 em rascunho", autor: "Pedro Souza" },
    ],
  },
  {
    id: "cl4", nome: "Magazine Luiza", segmento: "Varejo", cnpj: "47.960.950/0001-21",
    contato: "Patrícia Lemos", cargo: "Gerente de Treinamento", email: "patricia@magalu.com", telefone: "(11) 97712-3399",
    ltv: 96000, eventos: 3, propostas: 4, nps: 9.5, status: "ativo",
    timeline: [
      { data: "10/05/2025", tipo: "proposta", titulo: "Proposta PROP-2025-0141 aprovada", autor: "Lucas Martins" },
    ],
  },
];

export const empresas = [
  { id: "polo", nome: "Polo Palestrantes", regime: "Lucro Presumido", iss: 5, irrf: 1.5, pis: 0.65, cofins: 3.0, csll: 1.0 },
  { id: "penna", nome: "Penna Talks", regime: "Simples Nacional", iss: 2, irrf: 0, pis: 0, cofins: 0, csll: 0, das: 6.0 },
  { id: "talks", nome: "Talks Eventos", regime: "Simples Nacional", iss: 2, irrf: 0, pis: 0, cofins: 0, csll: 0, das: 6.0 },
];

export const vendas = [
  { id: "v1", numero: "VND-2025-098", cliente: "Itaú", palestrante: "Dr. Ricardo Almeida", empresa: "polo", bruto: 35000, cache: 24500, data: "20/05/2025", consultor: "Lucas Martins" },
  { id: "v2", numero: "VND-2025-097", cliente: "Natura", palestrante: "Juliana Rocha", empresa: "penna", bruto: 22000, cache: 15400, data: "18/05/2025", consultor: "Ana Silva" },
  { id: "v3", numero: "VND-2025-096", cliente: "Vale", palestrante: "Carlos Mendes", empresa: "polo", bruto: 45000, cache: 31500, data: "15/05/2025", consultor: "Pedro Souza" },
  { id: "v4", numero: "VND-2025-095", cliente: "Magazine Luiza", palestrante: "Mariana Costa", empresa: "talks", bruto: 28000, cache: 19600, data: "10/05/2025", consultor: "Lucas Martins" },
  { id: "v5", numero: "VND-2025-094", cliente: "B3", palestrante: "Beatriz Lima", empresa: "polo", bruto: 32000, cache: 22400, data: "08/05/2025", consultor: "Pedro Souza" },
  { id: "v6", numero: "VND-2025-093", cliente: "Ambev", palestrante: "Felipe Toledo", empresa: "penna", bruto: 18000, cache: 12600, data: "05/05/2025", consultor: "Ana Silva" },
];

export function calcularVenda(bruto: number, cache: number, empresaId: string) {
  const e = empresas.find((x) => x.id === empresaId)!;
  let impostos = 0;
  const detalhes: { label: string; valor: number; pct: number }[] = [];
  if (e.regime === "Simples Nacional") {
    const das = (bruto * (e.das ?? 6)) / 100;
    impostos += das;
    detalhes.push({ label: "DAS Simples", valor: das, pct: e.das ?? 6 });
    const iss = (bruto * e.iss) / 100;
    impostos += iss;
    detalhes.push({ label: "ISS", valor: iss, pct: e.iss });
  } else {
    const iss = (bruto * e.iss) / 100;
    const pis = (bruto * e.pis) / 100;
    const cofins = (bruto * e.cofins) / 100;
    const irrf = (bruto * e.irrf) / 100;
    const csll = (bruto * e.csll) / 100;
    impostos = iss + pis + cofins + irrf + csll;
    detalhes.push(
      { label: "ISS", valor: iss, pct: e.iss },
      { label: "PIS", valor: pis, pct: e.pis },
      { label: "COFINS", valor: cofins, pct: e.cofins },
      { label: "IRRF", valor: irrf, pct: e.irrf },
      { label: "CSLL", valor: csll, pct: e.csll },
    );
  }
  const liquido = bruto - impostos;
  const comissao = bruto * 0.05;
  const margem = liquido - cache - comissao;
  return { impostos, detalhes, liquido, comissao, margem, cache };
}
