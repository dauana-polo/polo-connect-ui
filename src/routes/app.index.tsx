import { createFileRoute, Link } from "@tanstack/react-router";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { agendaEventos, formatBRL, kpis, palestrantes, receitaMensal } from "@/lib/mock-data";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowDownRight, ArrowUpRight, Calendar, DollarSign, MapPin, Star, Target, TrendingUp, Users,
} from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function KpiCard({ label, value, delta, icon: Icon, accent }: any) {
  const up = delta >= 0;
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
        <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(delta)}% vs mês anterior
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  return (
    <>
      <AppTopbar title="Dashboard Executivo" breadcrumb={["Home", "Dashboard"]} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Receita Mensal" value={formatBRL(kpis.receita)} delta={kpis.receitaDelta} icon={DollarSign} accent="bg-gradient-to-br from-emerald-500 to-emerald-600" />
          <KpiCard label="Eventos do mês" value={kpis.eventos} delta={kpis.eventosDelta} icon={Calendar} accent="bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          <KpiCard label="Leads ativos" value={kpis.leads} delta={kpis.leadsDelta} icon={Target} accent="bg-gradient-to-br from-blue-500 to-cyan-500" />
          <KpiCard label="Vendas fechadas" value={kpis.vendas} delta={kpis.vendasDelta} icon={TrendingUp} accent="bg-gradient-to-br from-amber-500 to-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Crescimento de Receita</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Realizado vs meta — últimos 8 meses</p>
              </div>
              <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" />+18.4%</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer>
                  <AreaChart data={receitaMensal}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => formatBRL(v)} />
                    <Area type="monotone" dataKey="receita" stroke="var(--primary)" fill="url(#rev)" strokeWidth={2} />
                    <Area type="monotone" dataKey="meta" stroke="var(--muted-foreground)" fill="transparent" strokeDasharray="4 4" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Palestrantes</CardTitle>
              <p className="text-xs text-muted-foreground">Ranking por receita no trimestre</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {palestrantes.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="text-sm font-semibold w-5 text-muted-foreground">{i + 1}</div>
                  <img src={p.foto} alt="" className="h-9 w-9 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.nome}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.avaliacao} · {p.eventos} eventos
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{formatBRL(p.valor)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Próximos Eventos</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Agenda dos próximos 14 dias</p>
              </div>
              <Button size="sm" variant="outline" asChild><Link to="/app/crm">Ver agenda</Link></Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-5 py-2.5">Data</th>
                    <th className="text-left font-medium px-2 py-2.5">Cliente</th>
                    <th className="text-left font-medium px-2 py-2.5">Palestrante</th>
                    <th className="text-left font-medium px-2 py-2.5">Local</th>
                    <th className="text-right font-medium px-2 py-2.5">Valor</th>
                    <th className="text-left font-medium px-2 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agendaEventos.map((e) => (
                    <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-5 py-3 font-medium">{e.data}</td>
                      <td className="px-2 py-3">{e.cliente}</td>
                      <td className="px-2 py-3 text-muted-foreground">{e.palestrante}</td>
                      <td className="px-2 py-3 text-muted-foreground"><MapPin className="h-3 w-3 inline mr-1" />{e.local}</td>
                      <td className="px-2 py-3 text-right font-medium">{formatBRL(e.valor)}</td>
                      <td className="px-2 py-3">
                        <Badge variant={e.status === "confirmado" ? "default" : "secondary"} className={e.status === "confirmado" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                          {e.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendas por consultor</CardTitle>
              <p className="text-xs text-muted-foreground">Volume fechado em maio</p>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer>
                  <BarChart data={[
                    { nome: "Ana", v: 12 },
                    { nome: "Pedro", v: 9 },
                    { nome: "Lucas", v: 7 },
                    { nome: "Marina", v: 4 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="nome" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Bar dataKey="v" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
