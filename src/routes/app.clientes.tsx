import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clientes, formatBRL, leads, propostas, contratos, contasReceber, agendaEventos } from "@/lib/mock-data";
import { Building2, Mail, Phone, FileText, Receipt, DollarSign, Calendar, MessageSquare, TrendingUp, Star } from "lucide-react";

export const Route = createFileRoute("/app/clientes")({ component: ClientesPage });

function ClientesPage() {
  const [selectedId, setSelectedId] = useState(clientes[0].id);
  const c = clientes.find((x) => x.id === selectedId)!;
  const cleads = leads.filter((l) => l.empresa === c.nome.split(" ")[0]);
  const cpropostas = propostas.filter((p) => p.cliente === c.nome.split(" ")[0] || c.nome.toLowerCase().includes(p.cliente.toLowerCase().split(" ")[0]));
  const ccontratos = contratos.filter((p) => c.nome.toLowerCase().includes(p.cliente.toLowerCase().split(" ")[0]));
  const cnfs = contasReceber.filter((p) => c.nome.toLowerCase().includes(p.cliente.toLowerCase().split(" ")[0]));
  const cevents = agendaEventos.filter((p) => c.nome.toLowerCase().includes(p.cliente.toLowerCase().split(" ")[0]));

  return (
    <>
      <AppTopbar title="Clientes — Visão 360°" breadcrumb={["Operação", "Clientes"]} />
      <div className="flex-1 overflow-auto p-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 space-y-2">
          <div className="text-xs uppercase font-semibold text-muted-foreground px-2 mb-2">Base de Clientes</div>
          {clientes.map((x) => (
            <button
              key={x.id}
              onClick={() => setSelectedId(x.id)}
              className={`w-full text-left p-3 rounded-lg border transition ${selectedId === x.id ? "bg-primary/5 border-primary" : "bg-card hover:bg-muted"}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-white font-bold">{x.nome[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{x.nome}</div>
                  <div className="text-xs text-muted-foreground truncate">{x.segmento} · {formatBRL(x.ltv)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-5">
          <Card className="p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-white text-2xl font-bold">{c.nome[0]}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{c.nome}</h2>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{c.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{c.segmento} · CNPJ {c.cnpj}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.telefone}</span>
                  </div>
                  <div className="text-xs mt-1"><span className="text-muted-foreground">Contato: </span><span className="font-medium">{c.contato}</span> · {c.cargo}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Mail className="h-4 w-4" /> E-mail</Button>
                <Button size="sm"><FileText className="h-4 w-4" /> Nova proposta</Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> LTV total</div>
              <div className="text-2xl font-bold mt-1">{formatBRL(c.ltv)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Eventos</div>
              <div className="text-2xl font-bold mt-1">{c.eventos}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Propostas</div>
              <div className="text-2xl font-bold mt-1">{c.propostas}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> NPS</div>
              <div className="text-2xl font-bold mt-1 text-emerald-500">{c.nps}</div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Histórico de eventos</h3>
                <Badge variant="outline">{cevents.length || 1}</Badge>
              </div>
              <div className="space-y-2">
                {(cevents.length ? cevents : [{ id: "x", data: "21/05", palestrante: "Dr. Ricardo Almeida", local: "São Paulo, SP", valor: 35000, status: "confirmado", cliente: c.nome }]).map((e) => (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40">
                    <div className="text-center w-12 shrink-0">
                      <div className="text-[10px] text-muted-foreground uppercase">{e.data.split(" ")[1]}</div>
                      <div className="font-bold">{e.data.split(" ")[0]}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{e.palestrante}</div>
                      <div className="text-xs text-muted-foreground">{e.local}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatBRL(e.valor)}</div>
                      <Badge variant="outline" className="text-[10px]">{e.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Timeline de relacionamento</h3>
              <ol className="relative border-l border-border ml-2 space-y-4 pl-5">
                {c.timeline.map((t, i) => {
                  const colors: Record<string, string> = {
                    evento: "bg-emerald-500", pagamento: "bg-blue-500", contrato: "bg-violet-500",
                    proposta: "bg-amber-500", reuniao: "bg-fuchsia-500", lead: "bg-slate-400",
                  };
                  return (
                    <li key={i}>
                      <span className={`absolute -left-1.5 h-3 w-3 rounded-full ring-4 ring-card ${colors[t.tipo] ?? "bg-muted"}`} />
                      <div className="text-[11px] text-muted-foreground">{t.data}</div>
                      <div className="text-sm font-medium">{t.titulo}</div>
                      <div className="text-xs text-muted-foreground">por {t.autor}</div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Propostas & Contratos</h3>
              <div className="space-y-2">
                {(cpropostas.length ? cpropostas : propostas.slice(0, 2)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <div className="text-sm font-mono">{p.numero}</div>
                      <div className="text-xs text-muted-foreground">{p.palestrante}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatBRL(p.valor)}</div>
                      <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                    </div>
                  </div>
                ))}
                {ccontratos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded border bg-muted/30">
                    <div>
                      <div className="text-sm font-mono">{p.numero}</div>
                      <div className="text-xs text-muted-foreground">{p.modelo}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatBRL(p.valor)}</div>
                      <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Receipt className="h-4 w-4" /> Histórico financeiro & NFs</h3>
              <div className="space-y-2">
                {(cnfs.length ? cnfs : contasReceber.slice(0, 2)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="min-w-0">
                      <div className="text-sm truncate">{p.evento}</div>
                      <div className="text-xs text-muted-foreground">Parc. {p.parcela} · vence {p.vencimento}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatBRL(p.valor)}</div>
                      <Badge className={`text-[10px] ${p.status === "pago" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : p.status === "atrasado" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"}`}>{p.status}</Badge>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-2 rounded border bg-muted/30">
                  <div className="text-xs text-muted-foreground">NF-e 002417 · emitida</div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Baixar XML</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
