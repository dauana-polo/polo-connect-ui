import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Wallet, Users, TrendingUp, Filter, RotateCcw, CalendarDays, Inbox } from "lucide-react";

export const Route = createFileRoute("/app/comissoes")({ component: ComissoesPage });

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type ComRow = {
  id: string;
  venda_id: string | null;
  tipo: string | null;
  percentual: number | null;
  base_calculo: number | null;
  valor: number;
  pago: boolean | null;
  pago_em: string | null;
  created_at: string;
  vendas: {
    titulo: string | null;
    data_evento: string | null;
    clientes: { razao_social: string | null } | null;
    palestrantes: { nome: string | null } | null;
  } | null;
};

function monthKey(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${MESES[d.getMonth()]}/${d.getFullYear()}`;
}

function ComissoesPage() {
  const [mesFiltro, setMesFiltro] = useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rows, setRows] = useState<ComRow[]>([]);

  const load = () => {
    setLoading(true);
    setError(null);
    supabase
      .from("comissoes")
      .select("id,venda_id,tipo,percentual,base_calculo,valor,pago,pago_em,created_at,vendas(titulo,data_evento,clientes(razao_social),palestrantes(nome))")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message));
        else setRows((data ?? []) as unknown as ComRow[]);
      })
      .then(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const tipos = useMemo(() => Array.from(new Set(rows.map((r) => r.tipo).filter(Boolean) as string[])), [rows]);
  const meses = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      const k = monthKey(r.vendas?.data_evento ?? r.created_at);
      if (k) s.add(k);
    }
    return Array.from(s);
  }, [rows]);

  const filtradas = useMemo(() =>
    rows.filter((r) => {
      const k = monthKey(r.vendas?.data_evento ?? r.created_at);
      return (mesFiltro === "todos" || k === mesFiltro) &&
             (tipoFiltro === "todos" || r.tipo === tipoFiltro);
    }), [rows, mesFiltro, tipoFiltro]);

  const totalBruto = filtradas.reduce((a, r) => a + Number(r.valor ?? 0), 0);
  const totalPago = filtradas.filter((r) => r.pago).reduce((a, r) => a + Number(r.valor ?? 0), 0);
  const totalPendente = totalBruto - totalPago;
  const vendasUnicas = new Set(filtradas.map((r) => r.venda_id).filter(Boolean)).size;

  const chartData = useMemo(() => {
    const agg: Record<string, number> = {};
    for (const r of filtradas) {
      const t = r.tipo ?? "outros";
      agg[t] = (agg[t] ?? 0) + Number(r.valor ?? 0);
    }
    return Object.entries(agg).map(([tipo, valor]) => ({ tipo, valor }));
  }, [filtradas]);

  const mensal = useMemo(() => {
    const agg: Record<string, { total: number; pago: number; count: number }> = {};
    for (const r of filtradas) {
      const k = monthKey(r.vendas?.data_evento ?? r.created_at);
      if (!k) continue;
      if (!agg[k]) agg[k] = { total: 0, pago: 0, count: 0 };
      agg[k].total += Number(r.valor ?? 0);
      if (r.pago) agg[k].pago += Number(r.valor ?? 0);
      agg[k].count += 1;
    }
    return Object.entries(agg).map(([mes, v]) => ({ mes, ...v }));
  }, [filtradas]);

  const reset = () => { setMesFiltro("todos"); setTipoFiltro("todos"); };

  return (
    <>
      <AppTopbar title="Comissões internas" breadcrumb={["Financeiro", "Comissões"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" /> Filtros
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">Mês</label>
              <Select value={mesFiltro} onValueChange={setMesFiltro}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {meses.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">Tipo</label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  {tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={reset} className="gap-1">
              <RotateCcw className="h-3 w-3" /> Limpar
            </Button>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{filtradas.length} lançamentos</Badge>
              <Badge variant="outline">{vendasUnicas} vendas</Badge>
            </div>
          </div>
        </Card>

        {loading ? (
          <LoadingState label="Carregando comissões..." />
        ) : error ? (
          <ErrorState onRetry={load} message={error.message} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-8 w-8" />}
            title="Nenhuma comissão registrada"
            description="Comissões são geradas automaticamente quando um recebível é marcado como recebido, conforme as regras cadastradas."
          />
        ) : (
        <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Total do período</div><div className="text-2xl font-bold mt-1">{formatCurrency(totalBruto)}</div></Card>
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Já pago</div><div className="text-2xl font-bold mt-1 text-emerald-500">{formatCurrency(totalPago)}</div></Card>
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Pendente</div><div className="text-2xl font-bold mt-1 text-amber-500">{formatCurrency(totalPendente)}</div></Card>
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Vendas atreladas</div><div className="text-2xl font-bold mt-1">{vendasUnicas}</div></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 p-5">
            <h3 className="font-semibold mb-4">Comissões por tipo</h3>
            <div className="h-72">
              {chartData.length ? (
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="tipo" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="valor" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sem dados para os filtros aplicados</div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Total por mês</h3>
            <div className="space-y-2">
              {mensal.length === 0 && <p className="text-sm text-muted-foreground">Sem registros.</p>}
              {mensal.map((m) => (
                <div key={m.mes} className={`p-3 rounded-lg border flex items-center justify-between ${mesFiltro === m.mes ? "bg-primary/5 border-primary/40" : ""}`}>
                  <div>
                    <div className="text-xs text-muted-foreground">{m.count} lançamento(s)</div>
                    <div className="font-semibold">{m.mes}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Pago {formatCurrency(m.pago)}</div>
                    <div className="font-semibold">{formatCurrency(m.total)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Comissão por venda</h3>
              <p className="text-xs text-muted-foreground">Detalhamento de cada lançamento conforme filtros aplicados.</p>
            </div>
            <Badge variant="outline">Total do período: <span className="ml-1 font-semibold">{formatCurrency(totalBruto)}</span></Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Data</th>
                  <th className="text-left px-2 py-3">Cliente / Palestrante</th>
                  <th className="text-left px-2 py-3">Tipo</th>
                  <th className="text-right px-2 py-3">Base</th>
                  <th className="text-right px-2 py-3">%</th>
                  <th className="text-right px-2 py-3">Valor</th>
                  <th className="text-center px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-8">Nenhum lançamento para os filtros selecionados.</td></tr>
                )}
                {filtradas.map((r) => {
                  const mes = monthKey(r.vendas?.data_evento ?? r.created_at);
                  return (
                    <tr key={r.id} className="border-t hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <Badge variant="secondary">{mes ?? "—"}</Badge>
                      </td>
                      <td className="px-2 py-3">
                        <div className="font-medium">{r.vendas?.clientes?.razao_social ?? "—"}</div>
                        <div className="text-[11px] text-muted-foreground">{r.vendas?.palestrantes?.nome ?? "—"}</div>
                      </td>
                      <td className="px-2 py-3"><Badge variant="outline">{r.tipo ?? "—"}</Badge></td>
                      <td className="px-2 py-3 text-right text-muted-foreground">{formatCurrency(r.base_calculo ?? 0)}</td>
                      <td className="px-2 py-3 text-right">{r.percentual ?? 0}%</td>
                      <td className="px-2 py-3 text-right font-semibold">{formatCurrency(r.valor ?? 0)}</td>
                      <td className="px-5 py-3 text-center">
                        {r.pago ? <Badge className="bg-emerald-500">Pago</Badge> : <Badge variant="outline">Pendente</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {filtradas.length > 0 && (
                <tfoot className="bg-muted/30 text-sm font-semibold">
                  <tr>
                    <td colSpan={5} className="px-5 py-3 text-right">Totais do período</td>
                    <td className="px-2 py-3 text-right">{formatCurrency(totalBruto)}</td>
                    <td className="px-5 py-3 text-right text-emerald-500">{formatCurrency(totalPago)} pago</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
        </>
        )}
      </div>
    </>
  );
}
