import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ETAPAS } from "@/lib/crm/constants";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowDownRight, ArrowUpRight, Calendar, DollarSign, MapPin, Target, TrendingUp, Users, Trophy,
} from "lucide-react";

export const Route = createFileRoute("/app/")({ component: Dashboard });

const BRL = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function KpiCard({ label, value, delta, icon: Icon, accent }: any) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
          </div>
          <div className={`h-10 w-10 rounded-lg grid place-items-center ${accent}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        {delta != null && (
          <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta).toFixed(1)}% vs período anterior
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const { data: leads = [] } = useQuery({
    queryKey: ["dash-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("leads")
        .select("id,etapa,orcamento_est,created_at,consultor_id");
      return data ?? [];
    },
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ["dash-vendas"],
    queryFn: async () => {
      const { data } = await supabase.from("vendas")
        .select("id,valor_total,data_evento,status,consultor_id,created_at,titulo,cliente_id,clientes(razao_social),palestrantes(nome)")
        .order("data_evento", { ascending: true });
      return data ?? [];
    },
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ["dash-cr"],
    queryFn: async () => {
      const { data } = await supabase.from("contas_receber").select("valor,status,vencimento");
      return data ?? [];
    },
  });

  const kpis = (() => {
    const leadsMes = leads.filter((l: any) => l.created_at >= monthStart);
    const leadsMesAnt = leads.filter((l: any) => l.created_at >= prevMonthStart && l.created_at < monthStart);
    const ganhos = leads.filter((l: any) => l.etapa === "ganho");
    const perdidos = leads.filter((l: any) => l.etapa === "perdido");
    const conv = ganhos.length + perdidos.length > 0 ? (ganhos.length / (ganhos.length + perdidos.length)) * 100 : 0;
    const fatMes = vendas.filter((v: any) => v.data_evento && v.data_evento >= monthStart.slice(0,10))
      .reduce((s: number, v: any) => s + Number(v.valor_total ?? 0), 0);
    const fatMesAnt = vendas.filter((v: any) => v.data_evento && v.data_evento >= prevMonthStart.slice(0,10) && v.data_evento < monthStart.slice(0,10))
      .reduce((s: number, v: any) => s + Number(v.valor_total ?? 0), 0);
    const receberPend = contasReceber.filter((c: any) => c.status !== "recebido")
      .reduce((s: number, c: any) => s + Number(c.valor ?? 0), 0);
    const eventosFuturos = vendas.filter((v: any) => v.data_evento && v.data_evento >= now.toISOString().slice(0,10)).length;
    return {
      leadsMes: leadsMes.length,
      leadsDelta: leadsMesAnt.length ? ((leadsMes.length - leadsMesAnt.length) / leadsMesAnt.length) * 100 : null,
      fatMes,
      fatDelta: fatMesAnt ? ((fatMes - fatMesAnt) / fatMesAnt) * 100 : null,
      conv,
      vendasMes: vendas.filter((v: any) => v.created_at >= monthStart).length,
      receberPend,
      eventosFuturos,
    };
  })();

  // Receita últimos 8 meses (baseado em data_evento das vendas)
  const receitaSeries = (() => {
    const out: { mes: string; receita: number; meta: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = d.toISOString().slice(0, 10);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().slice(0, 10);
      const receita = vendas
        .filter((v: any) => v.data_evento && v.data_evento >= start && v.data_evento < end)
        .reduce((s: number, v: any) => s + Number(v.valor_total ?? 0), 0);
      out.push({
        mes: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        receita,
        meta: receita ? receita * 1.15 : 0,
      });
    }
    return out;
  })();

  // Distribuição do funil
  const funil = ETAPAS.map((e) => ({
    etapa: e.titulo,
    total: leads.filter((l: any) => l.etapa === e.id).length,
  }));

  const proximosEventos = vendas
    .filter((v: any) => v.data_evento && v.data_evento >= now.toISOString().slice(0, 10))
    .slice(0, 6);

  return (
    <>
      <AppTopbar title="Dashboard Executivo" breadcrumb={["Home", "Dashboard"]} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Faturamento mês" value={BRL(kpis.fatMes)} delta={kpis.fatDelta} icon={DollarSign} accent="bg-gradient-to-br from-emerald-500 to-emerald-600" />
          <KpiCard label="Leads no mês" value={kpis.leadsMes} delta={kpis.leadsDelta} icon={Users} accent="bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          <KpiCard label="Conversão funil" value={`${kpis.conv.toFixed(0)}%`} icon={Target} accent="bg-gradient-to-br from-primary to-rose-600" />
          <KpiCard label="Recebimentos pendentes" value={BRL(kpis.receberPend)} icon={TrendingUp} accent="bg-gradient-to-br from-amber-500 to-orange-500" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Vendas do mês</div><div className="text-lg font-bold mt-1">{kpis.vendasMes}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Eventos futuros</div><div className="text-lg font-bold mt-1">{kpis.eventosFuturos}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Ganhos</div><div className="text-lg font-bold mt-1 text-emerald-600">{leads.filter((l:any)=>l.etapa==="ganho").length}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-[11px] uppercase text-muted-foreground">Em negociação</div><div className="text-lg font-bold mt-1">{leads.filter((l:any)=>!["ganho","perdido"].includes(l.etapa)).length}</div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Crescimento de Receita</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Últimos 8 meses — dados reais</p>
              </div>
              <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" />Receita realizada</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer>
                  <AreaChart data={receitaSeries}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => BRL(v)} />
                    <Area type="monotone" dataKey="receita" stroke="var(--primary)" fill="url(#rev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funil Comercial</CardTitle>
              <p className="text-xs text-muted-foreground">Leads por etapa (real-time)</p>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={funil} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis type="category" dataKey="etapa" stroke="var(--muted-foreground)" fontSize={10} width={90} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Bar dataKey="total" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Próximos Eventos</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Vendas com data futura</p>
            </div>
            <Button size="sm" variant="outline" asChild><Link to="/app/agenda">Ver agenda</Link></Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-medium px-5 py-2.5">Data</th>
                  <th className="text-left font-medium px-2 py-2.5">Cliente</th>
                  <th className="text-left font-medium px-2 py-2.5">Palestrante</th>
                  <th className="text-right font-medium px-2 py-2.5">Valor</th>
                  <th className="text-left font-medium px-2 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {proximosEventos.map((e: any) => (
                  <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{new Date(e.data_evento).toLocaleDateString("pt-BR")}</td>
                    <td className="px-2 py-3">{e.clientes?.razao_social ?? "—"}</td>
                    <td className="px-2 py-3 text-muted-foreground">{e.palestrantes?.nome ?? "—"}</td>
                    <td className="px-2 py-3 text-right font-medium">{BRL(e.valor_total)}</td>
                    <td className="px-2 py-3">
                      <Badge variant="secondary">{e.status ?? "—"}</Badge>
                    </td>
                  </tr>
                ))}
                {!proximosEventos.length && (
                  <tr><td colSpan={5} className="text-center text-xs text-muted-foreground py-6">Nenhum evento futuro</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
