export type SetorKey = "pos_venda" | "juridico" | "financeiro" | "logistica" | "palestrante";

export type ColunaDef = { key: string; label: string };

export type SetorDef = {
  key: SetorKey;
  titulo: string;
  colunas: ColunaDef[];
};

export const SETORES: SetorDef[] = [
  {
    key: "pos_venda",
    titulo: "Pós-venda",
    colunas: [
      { key: "entrada", label: "Entrada" },
      { key: "briefing_solicitado", label: "Briefing solicitado" },
      { key: "briefing_recebido", label: "Briefing recebido" },
      { key: "concluido", label: "Concluído" },
    ],
  },
  {
    key: "juridico",
    titulo: "Jurídico",
    colunas: [
      { key: "entrada", label: "Entrada" },
      { key: "contrato_gerado", label: "Contrato gerado" },
      { key: "enviado_assinatura", label: "Enviado p/ assinatura" },
      { key: "assinado", label: "Assinado" },
      { key: "concluido", label: "Concluído" },
    ],
  },
  {
    key: "financeiro",
    titulo: "Financeiro",
    colunas: [
      { key: "entrada", label: "Entrada" },
      { key: "aguardando_pagamento", label: "Aguardando pagamento" },
      { key: "recebido_parcial", label: "Recebido parcial" },
      { key: "recebido_total", label: "Recebido total" },
      { key: "concluido", label: "Concluído" },
    ],
  },
  {
    key: "logistica",
    titulo: "Logística",
    colunas: [
      { key: "entrada", label: "Entrada" },
      { key: "passagens", label: "Passagens" },
      { key: "hospedagem", label: "Hospedagem" },
      { key: "transfer", label: "Transfer" },
      { key: "checklist_ok", label: "Checklist OK" },
    ],
  },
  {
    key: "palestrante",
    titulo: "Palestrante",
    colunas: [
      { key: "entrada", label: "Entrada" },
      { key: "contrato_enviado", label: "Contrato enviado" },
      { key: "confirmado", label: "Confirmado" },
      { key: "briefing_lido", label: "Briefing lido" },
      { key: "ok", label: "OK" },
    ],
  },
];

export const getSetor = (key: string) => SETORES.find((s) => s.key === key) ?? SETORES[0];

export const statusBorder = (status: string | null | undefined) => {
  switch (status) {
    case "ativo":
      return "border-l-4 border-blue-500";
    case "suspenso":
      return "border-l-4 border-yellow-500";
    case "concluido":
      return "border-l-4 border-green-500";
    case "cancelado":
      return "border-l-4 border-red-500";
    default:
      return "border-l-4 border-muted";
  }
};
