// Domain type aliases derived from the generated Supabase types.
// Prefer these over `Database["public"]["Tables"]["…"]["Row"]` in app code.
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

export type Lead = Tables["leads"]["Row"];
export type LeadInsert = Tables["leads"]["Insert"];
export type LeadUpdate = Tables["leads"]["Update"];

export type Venda = Tables["vendas"]["Row"];
export type VendaInsert = Tables["vendas"]["Insert"];
export type VendaUpdate = Tables["vendas"]["Update"];

export type Cliente = Tables["clientes"]["Row"];
export type Palestrante = Tables["palestrantes"]["Row"];
export type Proposta = Tables["propostas"]["Row"];
export type PropostaPalestrante = Tables["proposta_palestrantes"]["Row"];
export type LeadRecomendacao = Tables["lead_palestrante_recomendacoes"]["Row"];
export type CrmAtividade = Tables["crm_atividades"]["Row"];
export type CrmHistorico = Tables["crm_historico"]["Row"];
export type KanbanCard = Tables["kanban_cards"]["Row"];
export type ContaPagar = Tables["contas_pagar"]["Row"];
export type ContaReceber = Tables["contas_receber"]["Row"];
export type Comissao = Tables["comissoes"]["Row"];
export type AgendaEvento = Tables["agenda_eventos"]["Row"];
export type Tarefa = Tables["tarefas"]["Row"];
export type Processo = Tables["processos"]["Row"];
export type Usuario = Tables["usuarios"]["Row"];
export type UserRole = Tables["user_roles"]["Row"];
export type Notificacao = Tables["notificacoes"]["Row"];
export type EmpresaPolo = Tables["empresas_polo"]["Row"];
export type Logistica = Tables["logistica"]["Row"];
export type EventoNps = Tables["eventos_nps"]["Row"];
export type NpsResposta = Tables["nps_respostas"]["Row"];
export type Contrato = Tables["contratos"]["Row"];
export type Documento = Tables["documentos"]["Row"];

export type AppRole = Database["public"]["Enums"] extends { app_role: infer R }
  ? R
  : "admin" | "gestor" | "comercial" | "pos_venda" | "juridico" | "financeiro" | "logistica" | "palestrante";
