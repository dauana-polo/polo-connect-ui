import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatBRL } from "@/lib/crm/constants";
import { CheckCircle2, Circle, QrCode, Star, Smile, Meh, Frown, TrendingUp, Calendar as CalIcon } from "lucide-react";

export const Route = createFileRoute("/app/eventos")({ component: EventosPage });

type Venda = {
  id: string;
  titulo: string;
  data_evento: string | null;
  cidade: string | null;
  status: string | null;
  cliente: { razao_social: string } | null;
  palestrante: { id: string; nome: string; foto_url: string | null } | null;
};

function EventosPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: vendas = [] } = useQuery({
    queryKey: ["eventos-vendas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id,titulo,data_evento,cidade,status,cliente:clientes(razao_social),palestrante:palestrantes(id,nome,foto_url)")
        .order("data_evento", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as Venda[];
    },
  });

  const evento = vendas.find((v) => v.id === selectedId) ?? vendas[0] ?? null;

  const { data: checklists = [] } = useQuery({
    queryKey: ["evento-checklists", evento?.id],
    enabled: !!evento,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select("id, tipo, checklist_itens(id, descricao, concluido, ordem)")
        .eq("venda_id", evento!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: nps } = useQuery({
    queryKey: ["eventos-nps-agg"],
    queryFn: async () => {
      const [{ data: respostas }, { data: eventos }] = await Promise.all([
        supabase.from("nps_respostas").select("nota_geral, nota_palestrante, comentario, created_at, evento_nps_id").order("created_at", { ascending: false }).limit(30),
        supabase.from("eventos_nps").select("id, venda_id, nps_medio, nota_palestrante, total_respostas"),
      ]);
      return { respostas: respostas ?? [], eventos: eventos ?? [] };
    },
  });

  const respostas = nps?.respostas ?? [];
  const promotores = respostas.filter((r: any) => (r.nota_geral ?? 0) >= 9).length;
  const detratores = respostas.filter((r: any) => (r.nota_geral ?? 0) <= 6).length;
  const npsScore = respostas.length > 0 ? Math.round(((promotores - detratores) / respostas.length) * 100) : 0;
  const mediaGeral = respostas.length > 0 ? (respostas.reduce((a: number, b: any) => a + (b.nota_geral ?? 0), 0) / respostas.length).toFixed(1) : "—";

  const npsPorPalestrante = useMemo(() => {
    if (!nps) return [] as { nome: string; foto: string | null; score: number }[];
    const byVenda = new Map(nps.eventos.map((e: any) => [e.venda_id, e]));
    const map = new Map<string, { nome: string; foto: string | null; notas: number[] }>();
    vendas.forEach((v) => {
      if (!v.palestrante) return;
      const e: any = byVenda.get(v.id);
      if (!e) return;
      const key = v.palestrante.id;
      const cur = map.get(key) ?? { nome: v.palestrante.nome, foto: v.palestrante.foto_url, notas: [] };
      if (e.nota_palestrante != null) cur.notas.push(Number(e.nota_palestrante));
      map.set(key, cur);
    });
    return Array.from(map.values())
      .filter((x) => x.notas.length > 0)
      .map((x) => ({ nome: x.nome, foto: x.foto, score: x.notas.reduce((a, b) => a + b, 0) / x.notas.length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [nps, vendas]);

  return (
    <>
      <AppTopbar title="Eventos · Checklists & NPS" breadcrumb={["Operação", "Eventos"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Tabs defaultValue="checklists">
          <TabsList>
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            <TabsTrigger value="qr">QR Code Avaliação</TabsTrigger>
            <TabsTrigger value="nps">Dashboard NPS</TabsTrigger>
          </TabsList>

          <TabsContent value="checklists" className="mt-5">
            {vendas.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground">
                <CalIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Nenhum evento (venda) cadastrado ainda.
              </Card>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <span className="text-sm text-muted-foreground">Evento:</span>
                  {vendas.slice(0, 8).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className={`px-3 py-1.5 rounded-md text-sm ${evento?.id === v.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}
                    >
                      {v.titulo}
                    </button>
                  ))}
                </div>
                {evento && (
                  <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
                    {evento.palestrante?.foto_url && <img src={evento.palestrante.foto_url} className="h-8 w-8 rounded-full object-cover" />}
                    <div>
                      <span className="font-medium text-foreground">{evento.palestrante?.nome ?? "—"}</span>
                      {" · "}{evento.cliente?.razao_social ?? "—"}
                      {" · "}{evento.data_evento ?? "—"}
                    </div>
                  </div>
                )}
                {checklists.length === 0 ? (
                  <Card className="p-10 text-center text-muted-foreground text-sm">
                    Nenhum checklist criado para este evento.
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {checklists.map((c: any) => {
                      const items = c.checklist_itens ?? [];
                      const done = items.filter((i: any) => i.concluido).length;
                      const pct = items.length ? Math.round((done / items.length) * 100) : 0;
                      const titles: Record<string, string> = { time: "Checklist do Time", palestrante: "Checklist do Palestrante", cliente: "Checklist do Cliente" };
                      return (
                        <Card key={c.id} className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="font-semibold text-sm">{titles[c.tipo] ?? c.tipo}</div>
                            <Badge variant={pct === 100 ? "default" : "secondary"}>{pct}%</Badge>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-4">
                            <div className={`h-full ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                          </div>
                          <ul className="space-y-2">
                            {items.sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)).map((it: any) => (
                              <li key={it.id} className="flex items-start gap-2 text-sm">
                                {it.concluido ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                                <span className={it.concluido ? "" : "text-muted-foreground"}>{it.descricao}</span>
                              </li>
                            ))}
                          </ul>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="qr" className="mt-5">
            <Card className="p-8 text-center">
              <QrCode className="h-16 w-16 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold">QR Code de avaliação</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Cada venda gera automaticamente um registro <code>eventos_nps</code> com token único. Utilize o link
                <code className="mx-1 px-1 py-0.5 bg-muted rounded text-xs">/nps/&lt;token&gt;</code> para coletar respostas.
              </p>
              <Button className="mt-4" variant="outline"><QrCode className="h-4 w-4 mr-1" /> Gerar impressão do crachá</Button>
            </Card>
          </TabsContent>

          <TabsContent value="nps" className="mt-5 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="text-xs text-muted-foreground">NPS Score</div>
                <div className={`text-3xl font-bold mt-1 ${npsScore >= 50 ? "text-emerald-500" : npsScore >= 0 ? "text-amber-500" : "text-rose-500"}`}>{npsScore >= 0 ? "+" : ""}{npsScore}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {respostas.length} respostas</div>
              </Card>
              <Card className="p-5">
                <div className="text-xs text-muted-foreground">Nota média</div>
                <div className="text-3xl font-bold mt-1">{mediaGeral}</div>
                <div className="flex gap-0.5 mt-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
              </Card>
              <Card className="p-5">
                <div className="text-xs text-muted-foreground">Promotores</div>
                <div className="text-3xl font-bold mt-1 text-emerald-500">{promotores}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Smile className="h-3 w-3 text-emerald-500" /> nota ≥ 9</div>
              </Card>
              <Card className="p-5">
                <div className="text-xs text-muted-foreground">Detratores</div>
                <div className="text-3xl font-bold mt-1 text-rose-500">{detratores}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Frown className="h-3 w-3" /> nota ≤ 6</div>
              </Card>
            </div>

            <Card className="p-5">
              <h3 className="font-semibold mb-4">Nota média por palestrante</h3>
              {npsPorPalestrante.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem avaliações consolidadas ainda.</div>
              ) : (
                <div className="space-y-3">
                  {npsPorPalestrante.map((p) => (
                    <div key={p.nome} className="flex items-center gap-3">
                      {p.foto ? <img src={p.foto} className="h-9 w-9 rounded-full object-cover" /> : <div className="h-9 w-9 rounded-full bg-muted grid place-items-center text-xs">{p.nome[0]}</div>}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{p.nome}</div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${(p.score / 5) * 100}%` }} />
                        </div>
                      </div>
                      <div className="text-sm font-semibold w-10 text-right">{p.score.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-4">Comentários recentes</h3>
              {respostas.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma resposta ainda.</div>
              ) : (
                <div className="space-y-4">
                  {respostas.filter((r: any) => r.comentario).slice(0, 10).map((n: any, i: number) => (
                    <div key={i} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className={`h-10 w-10 rounded-full grid place-items-center font-bold text-white shrink-0 ${(n.nota_geral ?? 0) >= 9 ? "bg-emerald-500" : (n.nota_geral ?? 0) >= 7 ? "bg-amber-500" : "bg-rose-500"}`}>{n.nota_geral}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString("pt-BR")}</div>
                        <p className="text-sm">"{n.comentario}"</p>
                      </div>
                    </div>
                  ))}
                  {respostas.filter((r: any) => r.comentario).length === 0 && (
                    <div className="text-sm text-muted-foreground">Nenhum comentário textual.</div>
                  )}
                </div>
              )}
            </Card>

            {/* silence formatBRL import in case of future extension */}
            <div className="hidden">{formatBRL(0)}<Meh /></div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
