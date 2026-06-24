import { Badge } from "@/components/ui/badge";
import { statusBorder } from "./constants";

export interface KanbanCardData {
  id: string;
  coluna: string;
  notas: string | null;
  vendas: {
    id: string;
    titulo: string;
    data_evento: string | null;
    valor_total: number | null;
    status: string | null;
    consultor_id: string | null;
    palestrante_id: string | null;
    cliente_id: string | null;
    clientes: { nome: string } | null;
    palestrantes: { nome: string } | null;
  } | null;
}

const fmtMoney = (v: number | null) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const fmtDate = (s: string | null) =>
  !s ? "—" : new Date(s + "T00:00").toLocaleDateString("pt-BR");

export function KanbanCard({
  card,
  onClick,
  draggable,
  onDragStart,
}: {
  card: KanbanCardData;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const v = card.vendas;
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-card rounded-lg p-3 border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer ${statusBorder(
        v?.status,
      )}`}
    >
      <div className="text-sm font-medium truncate">{v?.titulo ?? "Sem título"}</div>
      <div className="text-xs text-muted-foreground mt-0.5 truncate">{v?.clientes?.nome ?? "—"}</div>
      <div className="text-[11px] text-muted-foreground mt-2 truncate">{v?.palestrantes?.nome ?? "—"}</div>
      <div className="flex items-center justify-between mt-2 gap-2">
        <Badge variant="outline" className="text-[10px]">{fmtDate(v?.data_evento ?? null)}</Badge>
        <span className="text-[11px] font-medium">{fmtMoney(v?.valor_total ?? null)}</span>
      </div>
    </div>
  );
}
