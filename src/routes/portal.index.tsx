import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/format";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, FileText, MapPin, Star, Inbox } from "lucide-react";

export const Route = createFileRoute("/portal/")({
  component: PortalDashboard,
});

type Palestrante = {
  id: string;
  nome: string;
  avaliacao_media: number | null;
  total_eventos: number | null;
};

type Evento = {
  id: string;
  titulo: string | null;
  data_evento: string | null;
  cidade: string | null;
  estado: string | null;
  cache_palestr: number;
  status: string | null;
  clientes: { razao_social: string | null } | null;
};

type Recebimento = { data_evento: string | null; cache_palestr: number };
type Avaliacao = { nota: number | null; comentario: string | null; created_at: string };

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function PortalDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [palestrante, setPalestrante] = useState<Palestrante | null>(null);
  const [proximos, setProximos] = useState<Evento[]>([]);
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { data: pal, error: pErr } = await supabase
          .from("palestrantes")
          .select("id,nome,avaliacao_media,total_eventos")
          .eq("user_id", user.id)
          .maybeSingle();
        if (pErr) throw pErr;
        if (!pal) { setPalestrante(null); return; }
        setPalestrante(pal as Palestrante);

        const hoje = new Date().toISOString().slice(0, 10);
        const [ev, rec, av] = await Promise.all([
          supabase
            .from("vendas")
            .select("id,titulo,data_evento,cidade,estado,cache_palestr,status,clientes(razao_social)")
            .eq("palestrante_id", pal.id)
            .gte("data_evento", hoje)
            .order("data_evento", { ascending: true })
            .limit(6),
          supabase
            .from("vendas")
            .select("data_evento,cache_palestr")
            .eq("palestrante_id", pal.id)
            .not("data_evento", "is", null),
          supabase
            .from("nps_respostas")
            .select("nota,comentario,created_at,eventos_nps!inner(vendas!inner(palestrante_id))")
            .eq("eventos_nps.vendas.palestrante_id", pal.id)
            .order("created_at", { ascending: false })
            .limit(6),
        ]);
        if (ev.error) throw ev.error;
        if (rec.error) throw rec.error;
        if (av.error) throw av.error;
        setProximos((ev.data ?? []) as unknown as Evento[]);
        setRecebimentos((rec.data ?? []) as Recebimento[]);
        setAvaliacoes((av.data ?? []) as unknown as Avaliacao[]);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  if (authLoading || loading) return <LoadingState label="Carregando portal..." />;
  if (error) return <div className="p-6"><ErrorState message={error.message} /></div>;
  if (!user) return <div className="p-6"><EmptyState title="Faça login" description="Entre com sua conta para acessar o portal." /></div>;
  if (!palestrante) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Inbox className="h-8 w-8" />}
          title="Perfil de palestrante não vinculado"
          description="Sua conta ainda não está vinculada a um cadastro de palestrante. Fale com a equipe da Polo."
        />
      </div>
    );
  }

  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  const recebidoMes = recebimentos
    .filter((r) => {
      if (!r.data_evento) return false;
      const d = new Date(r.data_evento);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    })
    .reduce((a, r) => a + Number(r.cache_palestr ?? 0), 0);

  // Gráfico últimos 6 meses
  const agora = new Date();
  const seriesRaw: { mes: string; v: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const total = recebimentos
      .filter((r) => {
        if (!r.data_evento) return false;
        const dr = new Date(r.data_evento);
        return dr.getMonth() === d.getMonth() && dr.getFullYear() === d.getFullYear();
      })
      .reduce((a, r) => a + Number(r.cache_palestr ?? 0), 0);
    seriesRaw.push({ mes: MESES[d.getMonth()], v: total });
  }

  const notaMedia = avaliacoes.length
    ? avaliacoes.reduce((a, r) => a + Number(r.nota ?? 0), 0) / avaliacoes.length
    : (palestrante.avaliacao_media ?? 0);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Próximos eventos</div><div className="text-2xl font-semibold mt-1">{proximos.length}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Cachês (mês)</div><div className="text-2xl font-semibold mt-1 text-emerald-600">{formatCurrency(recebidoMes)}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Avaliação média</div><div className="text-2xl font-semibold mt-1 flex items-center gap-1.5">{notaMedia.toFixed(1)} <Star className="h-5 w-5 fill-amber-400 text-amber-400" /></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Eventos realizados</div><div className="text-2xl font-semibold mt-1">{palestrante.total_eventos ?? 0}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Cachês nos últimos meses</CardTitle></CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer>
              <AreaChart data={seriesRaw}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="v" stroke="var(--chart-2)" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="eventos">
        <TabsList>
          <TabsTrigger value="eventos"><Calendar className="h-3.5 w-3.5 mr-1.5" />Próximos eventos</TabsTrigger>
          <TabsTrigger value="avaliacoes"><Star className="h-3.5 w-3.5 mr-1.5" />Avaliações</TabsTrigger>
          <TabsTrigger value="briefings"><FileText className="h-3.5 w-3.5 mr-1.5" />Briefings</TabsTrigger>
        </TabsList>

        <TabsContent value="eventos">
          {proximos.length === 0 ? (
            <EmptyState title="Nenhum evento futuro" description="Assim que sua próxima venda for confirmada, aparecerá aqui." />
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {proximos.map((e) => (
                <Card key={e.id}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 grid place-items-center">
                        <span className="text-xs font-semibold">{formatDate(e.data_evento)}</span>
                      </div>
                      <Badge variant={e.status === "concluido" ? "default" : "secondary"} className={e.status === "ativo" ? "bg-emerald-500" : ""}>{e.status ?? "—"}</Badge>
                    </div>
                    <div className="font-semibold">{e.titulo ?? "Evento"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{e.clientes?.razao_social ?? "—"}</div>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="h-3 w-3" />{[e.cidade, e.estado].filter(Boolean).join(", ") || "—"}</div>
                    <div className="mt-3 pt-3 border-t font-semibold text-emerald-600">{formatCurrency(e.cache_palestr)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="avaliacoes">
          {avaliacoes.length === 0 ? (
            <EmptyState title="Sem avaliações ainda" description="As respostas de NPS aparecerão aqui após seus eventos." />
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {avaliacoes.map((a, i) => (
                <Card key={i}><CardContent className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < Math.round(Number(a.nota ?? 0) / 2) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                    ))}
                    <span className="ml-1 text-sm font-semibold">{a.nota ?? "—"}</span>
                  </div>
                  {a.comentario && <p className="text-sm italic text-muted-foreground">"{a.comentario}"</p>}
                  <div className="text-xs font-medium mt-3 text-muted-foreground">{formatDate(a.created_at)}</div>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="briefings">
          {proximos.length === 0 ? (
            <EmptyState title="Nenhum briefing disponível" />
          ) : (
            <Card><CardContent className="p-6 space-y-3">
              {proximos.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">{e.titulo ?? "Evento"}</div>
                    <div className="text-xs text-muted-foreground">{e.clientes?.razao_social ?? "—"} · {formatDate(e.data_evento)}</div>
                  </div>
                  <Button size="sm" variant="outline">Abrir briefing</Button>
                </div>
              ))}
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
