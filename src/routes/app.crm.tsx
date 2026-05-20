import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatBRL, interacoes, leads, pipelineStages } from "@/lib/mock-data";
import { Calendar, Filter, Mail, MessageSquare, Mic, Phone, Plus, Search, User } from "lucide-react";

export const Route = createFileRoute("/app/crm")({
  component: CRM,
});

function CRM() {
  const [openLead, setOpenLead] = useState<any>(null);

  return (
    <>
      <AppTopbar title="CRM Comercial" breadcrumb={["Home", "CRM", "Pipeline"]} />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-lg border bg-card">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Buscar empresa, evento, consultor..." />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
          <Button><Plus className="h-4 w-4 mr-1.5" /> Novo Lead</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {pipelineStages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);
            const total = stageLeads.reduce((s, l) => s + l.valor, 0);
            return (
              <div key={stage.id} className="bg-muted/40 rounded-xl p-3 min-h-[500px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${stage.cor}`} />
                    <h3 className="text-xs font-semibold uppercase tracking-wider">{stage.titulo}</h3>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{stageLeads.length}</Badge>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground px-1 mb-2 font-medium">
                  {formatBRL(total)}
                </div>
                <div className="space-y-2">
                  {stageLeads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setOpenLead(l)}
                      className="w-full text-left bg-card rounded-lg p-3 border border-border hover:border-primary/40 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm">{l.empresa}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{l.evento}</div>
                      <div className="mt-2.5 text-sm font-semibold text-emerald-600">{formatBRL(l.valor)}</div>
                      <div className="mt-2.5 pt-2.5 border-t border-border space-y-1">
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Mic className="h-3 w-3" />{l.palestrante}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5"><User className="h-3 w-3" />{l.consultor}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3 w-3" />{l.data}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!openLead} onOpenChange={(o) => !o && setOpenLead(null)}>
        <DialogContent className="max-w-3xl">
          {openLead && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{openLead.empresa}</DialogTitle>
                <p className="text-sm text-muted-foreground">{openLead.evento}</p>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Valor</div><div className="font-semibold mt-0.5">{formatBRL(openLead.valor)}</div></CardContent></Card>
                    <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Data</div><div className="font-semibold mt-0.5">{openLead.data}</div></CardContent></Card>
                    <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Consultor</div><div className="font-semibold mt-0.5 text-sm">{openLead.consultor}</div></CardContent></Card>
                    <Card><CardContent className="p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Palestrante</div><div className="font-semibold mt-0.5 text-sm">{openLead.palestrante}</div></CardContent></Card>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Mail className="h-3.5 w-3.5 mr-1.5" />E-mail</Button>
                    <Button size="sm" variant="outline"><Phone className="h-3.5 w-3.5 mr-1.5" />Ligar</Button>
                    <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Proposta</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Histórico de interações</h3>
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {interacoes.map((i) => {
                      const Icon = i.tipo === "email" ? Mail : i.tipo === "ligacao" ? Phone : i.tipo === "reuniao" ? Calendar : MessageSquare;
                      return (
                        <div key={i.id} className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted grid place-items-center shrink-0">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">{i.titulo}</div>
                            <div className="text-xs text-muted-foreground">{i.autor} · {i.data}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input placeholder="Adicionar nota..." className="text-sm" />
                    <Button size="sm">Salvar</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
