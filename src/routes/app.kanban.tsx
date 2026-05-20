import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/kanban")({
  component: KanbanMulti,
});

const setores: Record<string, { titulo: string; colunas: string[]; cards: { evento: string; cliente: string; palestrante: string; col: number; meta?: string }[] }> = {
  posvenda: {
    titulo: "Pós-venda",
    colunas: ["NPS pendente", "Coleta feedback", "Caso de sucesso", "Concluído"],
    cards: [
      { evento: "Convenção Itaú", cliente: "Itaú", palestrante: "Dr. Ricardo", col: 0, meta: "NPS em 3 dias" },
      { evento: "Diversidade Natura", cliente: "Natura", palestrante: "Juliana Rocha", col: 1 },
      { evento: "Workshop Vale", cliente: "Vale", palestrante: "Carlos Mendes", col: 2 },
      { evento: "Sales Day Stone", cliente: "Stone", palestrante: "Felipe Toledo", col: 3 },
    ],
  },
  juridico: {
    titulo: "Jurídico",
    colunas: ["Aguardando análise", "Em revisão", "Aguardando assinatura", "Assinado"],
    cards: [
      { evento: "Workshop Vale", cliente: "Vale", palestrante: "Carlos Mendes", col: 0, meta: "Modelo exclusivo" },
      { evento: "Microsoft Brasil", cliente: "Microsoft", palestrante: "Carlos Mendes", col: 1, meta: "Internacional" },
      { evento: "Convenção Itaú", cliente: "Itaú", palestrante: "Dr. Ricardo", col: 2 },
      { evento: "Diversidade Natura", cliente: "Natura", palestrante: "Juliana Rocha", col: 3 },
    ],
  },
  financeiro: {
    titulo: "Financeiro",
    colunas: ["NF a emitir", "Aguardando pagamento", "Recebido", "Conciliado"],
    cards: [
      { evento: "Convenção Itaú", cliente: "Itaú", palestrante: "Dr. Ricardo", col: 0, meta: "R$ 35.000" },
      { evento: "Workshop Vale", cliente: "Vale", palestrante: "Carlos Mendes", col: 1, meta: "1/3 parcelas" },
      { evento: "Diversidade Natura", cliente: "Natura", palestrante: "Juliana Rocha", col: 2 },
      { evento: "Kickoff Ambev", cliente: "Ambev", palestrante: "Felipe Toledo", col: 3 },
    ],
  },
  logistica: {
    titulo: "Logística",
    colunas: ["Passagens", "Hospedagem", "Transfer", "Confirmado"],
    cards: [
      { evento: "Workshop Vale", cliente: "Vale", palestrante: "Carlos Mendes", col: 0, meta: "BH 10/06" },
      { evento: "Convenção Itaú", cliente: "Itaú", palestrante: "Dr. Ricardo", col: 1, meta: "Tivoli SP" },
      { evento: "Sales Day Stone", cliente: "Stone", palestrante: "Felipe Toledo", col: 2 },
      { evento: "Diversidade Natura", cliente: "Natura", palestrante: "Juliana Rocha", col: 3 },
    ],
  },
  palestrante: {
    titulo: "Área do palestrante",
    colunas: ["Briefing pendente", "Material a entregar", "Pronto", "Realizado"],
    cards: [
      { evento: "Workshop Vale", cliente: "Vale", palestrante: "Carlos Mendes", col: 0, meta: "Form. 70%" },
      { evento: "Microsoft Brasil", cliente: "Microsoft", palestrante: "Carlos Mendes", col: 1 },
      { evento: "Convenção Itaú", cliente: "Itaú", palestrante: "Dr. Ricardo", col: 2 },
      { evento: "Sales Day Stone", cliente: "Stone", palestrante: "Felipe Toledo", col: 3 },
    ],
  },
};

function KanbanMulti() {
  const [active, setActive] = useState("posvenda");
  const cfg = setores[active];

  return (
    <>
      <AppTopbar title="Kanban Multissetorial" breadcrumb={["Home", "Operação", "Kanban"]} />
      <div className="p-6 space-y-5">
        <Tabs value={active} onValueChange={setActive}>
          <TabsList>
            {Object.entries(setores).map(([k, v]) => (
              <TabsTrigger key={k} value={k}>{v.titulo}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cfg.colunas.map((col, ci) => {
            const cards = cfg.cards.filter((c) => c.col === ci);
            return (
              <div key={col} className="bg-muted/40 rounded-xl p-3 min-h-[480px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider">{col}</h3>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{cards.length}</Badge>
                </div>
                <div className="space-y-2">
                  {cards.map((c, i) => (
                    <div key={i} className="bg-card rounded-lg p-3 border hover:border-primary/40 hover:shadow-sm transition-all">
                      <div className="text-sm font-medium">{c.evento}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.cliente}</div>
                      <div className="text-[11px] text-muted-foreground mt-2">{c.palestrante}</div>
                      {c.meta && <Badge variant="outline" className="mt-2 text-[10px]">{c.meta}</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
