import { useAuth, type AppRole } from "./useAuth";

/**
 * Matriz de permissões da UI. Espelha o RLS do banco:
 * - admin / gestor: acesso total
 * - comercial: CRM, clientes, propostas, vendas, agenda, tarefas próprias
 * - financeiro: financeiro completo + leitura de vendas/clientes
 * - pos_venda / logistica / juridico: seu kanban + venda em modo leitura + tarefas próprias
 * - palestrante: portal próprio (fora do /app)
 */
export const RESOURCES = [
  "dashboard",
  "crm",
  "clientes",
  "propostas",
  "vendas",
  "agenda",
  "tarefas",
  "kanban",
  "palestrantes",
  "eventos",
  "logistica",
  "juridico",
  "financeiro",
  "comissoes",
  "prebalanco",
  "admin",
  "auditoria",
  "notificacoes",
  "processos",
] as const;

export type Resource = (typeof RESOURCES)[number];
export type Action = "view" | "edit";

const OPS: AppRole[] = ["admin", "gestor"];

const MATRIX: Record<Resource, { view: AppRole[]; edit: AppRole[] }> = {
  dashboard:    { view: [...OPS, "comercial", "financeiro", "pos_venda", "juridico", "logistica"], edit: [] },
  crm:          { view: [...OPS, "comercial"], edit: [...OPS, "comercial"] },
  clientes:     { view: [...OPS, "comercial", "financeiro"], edit: [...OPS, "comercial"] },
  propostas:    { view: [...OPS, "comercial"], edit: [...OPS, "comercial"] },
  vendas:       { view: [...OPS, "comercial", "financeiro", "pos_venda", "juridico", "logistica"], edit: [...OPS, "comercial"] },
  agenda:       { view: [...OPS, "comercial", "pos_venda", "logistica"], edit: [...OPS, "comercial", "pos_venda", "logistica"] },
  tarefas:      { view: [...OPS, "comercial", "pos_venda", "juridico", "financeiro", "logistica"], edit: [...OPS, "comercial", "pos_venda", "juridico", "financeiro", "logistica"] },
  kanban:       { view: [...OPS, "pos_venda", "juridico", "financeiro", "logistica"], edit: [...OPS, "pos_venda", "juridico", "financeiro", "logistica"] },
  palestrantes: { view: [...OPS, "comercial", "pos_venda", "logistica"], edit: OPS },
  eventos:      { view: [...OPS, "comercial", "pos_venda", "logistica"], edit: [...OPS, "pos_venda"] },
  logistica:    { view: [...OPS, "logistica", "pos_venda"], edit: [...OPS, "logistica"] },
  juridico:     { view: [...OPS, "juridico"], edit: [...OPS, "juridico"] },
  financeiro:   { view: [...OPS, "financeiro"], edit: [...OPS, "financeiro"] },
  comissoes:    { view: [...OPS, "financeiro"], edit: [...OPS, "financeiro"] },
  prebalanco:   { view: [...OPS, "financeiro"], edit: [] },
  processos:    { view: [...OPS], edit: OPS },
  admin:        { view: ["admin"], edit: ["admin"] },
  auditoria:    { view: OPS, edit: [] },
  notificacoes: { view: [...OPS, "comercial", "pos_venda", "juridico", "financeiro", "logistica", "palestrante"], edit: [] },
};

export function usePermissions() {
  const { roles, loading, isAdmin, isGestor } = useAuth();

  const can = (resource: Resource, action: Action = "view"): boolean => {
    if (isAdmin || isGestor) return true;
    const allowed = MATRIX[resource]?.[action] ?? [];
    return allowed.some((r) => roles.includes(r));
  };

  const canAny = (list: Array<[Resource, Action?]>) =>
    list.some(([r, a = "view"]) => can(r, a));

  return { can, canAny, loading, roles, isAdmin, isGestor };
}
