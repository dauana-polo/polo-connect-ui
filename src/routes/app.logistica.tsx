import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { logistica } from "@/lib/mock-data";
import { Plane, Hotel, Car, CheckCircle2, Circle, MapPin, Clock, Ticket, User2 } from "lucide-react";

export const Route = createFileRoute("/app/logistica")({ component: LogisticaPage });

const statusMap: Record<string, { label: string; cls: string }> = {
  aguardando: { label: "Aguardando", cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
  comprado: { label: "Comprado", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  confirmado: { label: "Confirmado", cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  concluido: { label: "Concluído", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
};

const kanbanCols = ["aguardando", "comprado", "confirmado", "concluido"] as const;

function LogisticaPage() {
  const [view, setView] = useState<"cards" | "kanban">("cards");
  const [selected, setSelected] = useState(logistica[0]);

  return (
    <>
      <AppTopbar title="Logística de Viagens" breadcrumb={["Operação", "Logística"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {Object.entries(statusMap).map(([k, v]) => {
              const count = logistica.filter((l) => l.status === k).length;
              return (
                <Card key={k} className="px-4 py-3 min-w-[140px]">
                  <div className="text-xs text-muted-foreground">{v.label}</div>
                  <div className="text-2xl font-bold">{count}</div>
                </Card>
              );
            })}
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {view === "cards" ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {logistica.map((l) => (
                <Card
                  key={l.id}
                  onClick={() => setSelected(l)}
                  className={`p-5 cursor-pointer transition hover:shadow-md ${selected.id === l.id ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">{l.data} · {l.cidade}</div>
                      <div className="font-semibold mt-0.5">{l.evento}</div>
                      <div className="text-xs text-muted-foreground">{l.cliente}</div>
                    </div>
                    <Badge className={statusMap[l.status].cls}>{statusMap[l.status].label}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                    <span>{l.palestrante}</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><Plane className="h-3.5 w-3.5" /> {l.voo.cia} {l.voo.numero} · {l.voo.partida}</div>
                    <div className="flex items-center gap-2"><Hotel className="h-3.5 w-3.5" /> {l.hotel.nome}</div>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {l.checklist.map((c, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded ${c.ok ? "bg-emerald-500" : "bg-muted"}`} />
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-5 h-fit sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">{selected.data}</div>
                  <div className="font-semibold">{selected.evento}</div>
                </div>
                <Badge className={statusMap[selected.status].cls}>{statusMap[selected.status].label}</Badge>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><Plane className="h-3 w-3" /> Voo</div>
                  <div className="rounded-lg border p-3 space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Cia/Voo</span><span className="font-medium">{selected.voo.cia} · {selected.voo.numero}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Trecho</span><span className="font-mono">{selected.voo.origem} → {selected.voo.destino}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Partida</span><span>{selected.voo.partida}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Chegada</span><span>{selected.voo.chegada}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Localizador</span><Badge variant="outline" className="font-mono">{selected.voo.localizador}</Badge></div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><Car className="h-3 w-3" /> Transfer</div>
                  <div className="rounded-lg border p-3 space-y-1.5">
                    <div><span className="text-muted-foreground">Ida: </span>{selected.transferIda}</div>
                    <div><span className="text-muted-foreground">Volta: </span>{selected.transferVolta}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><Hotel className="h-3 w-3" /> Hospedagem</div>
                  <div className="rounded-lg border p-3 space-y-1">
                    <div className="font-medium">{selected.hotel.nome}</div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Check-in</span><span>{selected.hotel.checkin}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Check-out</span><span>{selected.hotel.checkout}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Reserva</span><span className="font-mono">{selected.hotel.reserva}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Quarto</span><span>{selected.hotel.quarto}</span></div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground mb-2">Timeline da viagem</div>
                  <ol className="relative border-l border-border ml-2 space-y-3 pl-4">
                    <li><Clock className="absolute -left-2 h-4 w-4 bg-card rounded text-primary" /><div className="text-xs text-muted-foreground">D-1 · 18:00</div><div>Check-in no hotel</div></li>
                    <li><Clock className="absolute -left-2 h-4 w-4 bg-card rounded text-primary" /><div className="text-xs text-muted-foreground">D · 06:00</div><div>Transfer p/ aeroporto</div></li>
                    <li><Clock className="absolute -left-2 h-4 w-4 bg-card rounded text-primary" /><div className="text-xs text-muted-foreground">D · {selected.voo.partida.split(" ")[1] ?? "—"}</div><div>Embarque {selected.voo.numero}</div></li>
                    <li><Clock className="absolute -left-2 h-4 w-4 bg-card rounded text-primary" /><div className="text-xs text-muted-foreground">D · 12:00</div><div>Palestra no evento</div></li>
                  </ol>
                </div>

                <div>
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground mb-2">Checklist logístico</div>
                  <ul className="space-y-1.5">
                    {selected.checklist.map((c, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                        <span className={c.ok ? "" : "text-muted-foreground"}>{c.item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full"><Ticket className="h-4 w-4" /> Emitir voucher de embarque</Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {kanbanCols.map((col) => (
              <div key={col} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col === "concluido" ? "bg-emerald-500" : col === "confirmado" ? "bg-violet-500" : col === "comprado" ? "bg-blue-500" : "bg-slate-400"}`} />
                    <span className="text-sm font-semibold">{statusMap[col].label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{logistica.filter((l) => l.status === col).length}</span>
                </div>
                {logistica.filter((l) => l.status === col).map((l) => (
                  <Card key={l.id} className="p-3 cursor-grab hover:shadow-md transition">
                    <div className="text-[11px] text-muted-foreground">{l.data}</div>
                    <div className="font-medium text-sm">{l.evento}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{l.cidade}</div>
                    <div className="text-xs mt-2 flex items-center gap-1"><Plane className="h-3 w-3 text-muted-foreground" />{l.voo.numero}</div>
                    <div className="mt-2 flex gap-0.5">
                      {l.checklist.map((c, i) => (
                        <div key={i} className={`h-1 flex-1 rounded ${c.ok ? "bg-emerald-500" : "bg-muted"}`} />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
