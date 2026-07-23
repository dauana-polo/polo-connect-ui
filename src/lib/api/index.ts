// Central data-access layer. Prefer these helpers over inline supabase.from(...) calls.
// Each function returns typed data or throws — callers wrap in try/catch + toast.
export * as leadsApi from "./leads";
export * as vendasApi from "./vendas";
export * as palestrantesApi from "./palestrantes";
export * as clientesApi from "./clientes";
export * as notificacoesApi from "./notificacoes";
