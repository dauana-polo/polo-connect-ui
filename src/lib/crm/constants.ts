export type Etapa =
  | "contato_recebido"
  | "briefing_realizado"
  | "recomendacao_palestrante"
  | "consulta_palestrante"
  | "proposta_enviada"
  | "negociacao"
  | "contratacao_iniciada"
  | "ganho"
  | "perdido";

export const ETAPAS: { id: Etapa; titulo: string; cor: string }[] = [
  { id: "contato_recebido", titulo: "Contato Recebido", cor: "bg-slate-400" },
  { id: "briefing_realizado", titulo: "Briefing Realizado", cor: "bg-sky-400" },
  { id: "recomendacao_palestrante", titulo: "Recomendação", cor: "bg-indigo-400" },
  { id: "consulta_palestrante", titulo: "Consulta", cor: "bg-violet-400" },
  { id: "proposta_enviada", titulo: "Proposta Enviada", cor: "bg-amber-400" },
  { id: "negociacao", titulo: "Negociação", cor: "bg-orange-400" },
  { id: "contratacao_iniciada", titulo: "Contratação", cor: "bg-blue-500" },
  { id: "ganho", titulo: "Ganho", cor: "bg-emerald-500" },
  { id: "perdido", titulo: "Perdido", cor: "bg-rose-500" },
];

export const ETAPA_LABEL: Record<Etapa, string> = Object.fromEntries(
  ETAPAS.map((e) => [e.id, e.titulo]),
) as Record<Etapa, string>;

export const STATUS_RECOMENDACAO = [
  { id: "pendente", label: "Pendente", cor: "bg-slate-400" },
  { id: "consultado", label: "Consultado", cor: "bg-sky-400" },
  { id: "disponivel", label: "Disponível", cor: "bg-emerald-500" },
  { id: "indisponivel", label: "Indisponível", cor: "bg-rose-500" },
  { id: "recomendado", label: "Recomendado", cor: "bg-indigo-500" },
] as const;

export const TIPOS_ATIVIDADE = [
  { id: "ligacao", label: "Ligação" },
  { id: "email", label: "E-mail" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "reuniao", label: "Reunião" },
  { id: "tarefa", label: "Tarefa" },
  { id: "followup", label: "Follow-up" },
] as const;

export function formatBRL(v: number | null | undefined) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
