import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBRL, palestrantes, propostas } from "@/lib/mock-data";
import { Check, Download, FileText, Play, Plus, Send, Star } from "lucide-react";

export const Route = createFileRoute("/app/propostas")({
  component: Propostas,
});

const statusColor: Record<string, string> = {
  rascunho: "bg-slate-500",
  enviado: "bg-blue-500",
  aprovado: "bg-emerald-500",
  recusado: "bg-rose-500",
};

function Propostas() {
  const [selected, setSelected] = useState<string[]>(["1", "3"]);

  return (
    <>
      <AppTopbar title="Propostas" breadcrumb={["Home", "Comercial", "Propostas"]} />
      <div className="p-6">
        <Tabs defaultValue="lista" className="space-y-5">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="lista">Lista</TabsTrigger>
              <TabsTrigger value="montar">Montar Proposta</TabsTrigger>
              <TabsTrigger value="preview">Preview PDF</TabsTrigger>
            </TabsList>
            <Button><Plus className="h-4 w-4 mr-1.5" />Nova Proposta</Button>
          </div>

          <TabsContent value="lista">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-5 py-3">Número</th>
                      <th className="text-left font-medium px-2 py-3">Cliente</th>
                      <th className="text-left font-medium px-2 py-3">Palestrante</th>
                      <th className="text-right font-medium px-2 py-3">Valor</th>
                      <th className="text-left font-medium px-2 py-3">Data</th>
                      <th className="text-left font-medium px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propostas.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-muted/30">
                        <td className="px-5 py-3 font-mono text-xs">{p.numero}</td>
                        <td className="px-2 py-3 font-medium">{p.cliente}</td>
                        <td className="px-2 py-3 text-muted-foreground">{p.palestrante}</td>
                        <td className="px-2 py-3 text-right font-semibold">{formatBRL(p.valor)}</td>
                        <td className="px-2 py-3 text-muted-foreground">{p.data}</td>
                        <td className="px-5 py-3">
                          <Badge className={`${statusColor[p.status]} text-white hover:${statusColor[p.status]}`}>{p.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="montar">
            <div className="grid lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Selecione os palestrantes</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-3">
                  {palestrantes.map((p) => {
                    const isSel = selected.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelected((s) => s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id])}
                        className={`text-left rounded-xl border-2 overflow-hidden transition-all ${isSel ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}
                      >
                        <div className="relative aspect-video bg-muted">
                          <img src={p.videoThumb} className="h-full w-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent grid place-items-center">
                            <div className="h-10 w-10 rounded-full bg-white/90 grid place-items-center"><Play className="h-4 w-4 text-black ml-0.5" /></div>
                          </div>
                          {isSel && <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary grid place-items-center"><Check className="h-3.5 w-3.5 text-white" /></div>}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img src={p.foto} alt="" className="h-9 w-9 rounded-full" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{p.nome}</div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{p.avaliacao} · {p.eventos} eventos</div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.bio}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {p.temas.slice(0, 2).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                          </div>
                          <div className="mt-2 text-sm font-bold text-emerald-600">{formatBRL(p.valor)}</div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="h-fit lg:sticky lg:top-6">
                <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Cliente</label>
                    <Input defaultValue="XP Inc" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Evento</label>
                    <Input defaultValue="Expert Conference 2025" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Palestrantes selecionados</div>
                    {selected.length === 0 && <div className="text-xs text-muted-foreground italic">Nenhum selecionado</div>}
                    {selected.map((id) => {
                      const p = palestrantes.find((x) => x.id === id)!;
                      return (
                        <div key={id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={p.foto} className="h-7 w-7 rounded-full" alt="" />
                            <div className="text-xs font-medium truncate">{p.nome}</div>
                          </div>
                          <div className="text-xs font-semibold">{formatBRL(p.valor)}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-3 border-t flex items-center justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatBRL(selected.reduce((s, id) => s + (palestrantes.find((p) => p.id === id)?.valor || 0), 0))}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">Salvar rascunho</Button>
                    <Button className="flex-1"><Send className="h-4 w-4 mr-1.5" />Enviar</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="flex justify-center">
              <Card className="max-w-2xl w-full shadow-xl">
                <CardContent className="p-12 space-y-8">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Proposta Comercial</div>
                      <div className="font-mono text-sm mt-1">PROP-2025-0142</div>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">XP Inc</h2>
                    <p className="text-muted-foreground">Expert Conference 2025</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Palestrantes</h3>
                    {palestrantes.slice(0, 2).map((p) => (
                      <div key={p.id} className="flex gap-4 p-4 rounded-lg border">
                        <img src={p.foto} className="h-16 w-16 rounded-full" alt="" />
                        <div className="flex-1">
                          <div className="font-semibold">{p.nome}</div>
                          <p className="text-sm text-muted-foreground mt-1">{p.bio}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {p.temas.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                          </div>
                        </div>
                        <div className="font-bold text-emerald-600">{formatBRL(p.valor)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm font-medium">Valor total</span>
                    <span className="text-2xl font-bold">{formatBRL(63000)}</span>
                  </div>
                  <Button className="w-full" size="lg"><Download className="h-4 w-4 mr-2" />Baixar PDF</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
