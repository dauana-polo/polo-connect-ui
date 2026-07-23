import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Percent, Filter } from "lucide-react";

export const Route = createFileRoute("/app/prebalanco")({ component: PreBalancoPage });

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type CRRow = { valor: number; valor_recebido: number | null; status: string | null; vencimento: string | null; recebido_em: string | null };
type CPRow = { valor: number; categoria: string | null; tipo: string | null; status: string | null; vencimento: string | null };

function monthKey(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${MESES[d.getMonth()]}/${d.getFullYear()}`;
}

function PreBalancoPage() {
  const [mes, setMes] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cr, setCR] = useState<CRRow[]>([]);
  const [cp, setCP] = useState<CPRow[]>([]);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      supabase.from("contas_receber").select("valor,valor_recebido,status,vencimento,recebido_em"),
      supabase.from("contas_pagar").select("valor,categoria,tipo,status,vencimento"),
    ])
      .then(([a, b]) => {
        if (a.error) throw a.error;
        if (b.error) throw b.error;
        setCR((a.data ?? []) as CRRow[]);
        setCP((b.data ?? []) as CPRow[]);
      })
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const mesesDisponiveis = useMemo(() => {
    const s = new Set<string>();
    for (const r of cr) { const k = monthKey(r.recebido_em ?? r.vencimento); if (k) s.add(k); }
    for (const r of cp) { const k = monthKey(r.vencimento); if (k) s.add(k); }
    return Array.from(s);
  }, [cr, cp]);

  const inMes = (iso: string | null | undefined) => mes === "Todos" || monthKey(iso) === mes;

  const receitas = useMemo(() => {
    const recebido = cr.filter((r) => r.status === "recebido" && inMes(r.recebido_em ?? r.vencimento));
    const previstos = cr.filter((r) => r.status !== "recebido" && inMes(r.vencimento));
    const recebidoTotal = recebido.reduce((a, r) => a + Number(r.valor_recebido ?? r.valor ?? 0), 0);
    const previstoTotal = previstos.reduce((a, r) => a + Number(r.valor ?? 0), 0);
    return { recebido: recebidoTotal, previstos: previstoTotal, total: recebidoTotal + previstoTotal };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cr, mes]);

  const despesas = useMemo(() => {
    const bucket = { caches: 0, impostos: 0, comissoes: 0, fornecedores: 0, logistica: 0, gerais: 0 };
    for (const r of cp) {
      if (!inMes(r.vencimento)) continue;
      const v = Number(r.valor ?? 0);
      const cat = (r.categoria ?? "").toLowerCase();
      const tipo = (r.tipo ?? "").toLowerCase();
      if (tipo === "cache" || cat === "cache" || cat === "cachê") bucket.caches += v;
      else if (cat.startsWith("imposto")) bucket.impostos += v;
      else if (tipo === "comissao" || cat === "comissao" || cat === "comissão") bucket.comissoes += v;
      else if (cat === "fornecedor" || cat === "fornecedores") bucket.fornecedores += v;
      else if (cat === "logistica" || cat === "logística") bucket.logistica += v;
      else bucket.gerais += v;
    }
    const total = Object.values(bucket).reduce((a, b) => a + b, 0);
    return { ...bucket, total };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cp, mes]);

  const lucroLiquido = receitas.total - despesas.total;
  const margem = receitas.total > 0 ? (lucroLiquido / receitas.total) * 100 : 0;

  const receitasPie = [
    { name: "Recebido", value: receitas.recebido, color: "var(--chart-1)" },
    { name: "Previsto", value: receitas.previstos, color: "var(--chart-3)" },
  ];
  const despesasPie = [
    { name: "Cachês", value: despesas.caches, color: "#8b5cf6" },
    { name: "Impostos", value: despesas.impostos, color: "#ef4444" },
    { name: "Comissões", value: despesas.comissoes, color: "#f59e0b" },
    { name: "Fornecedores", value: despesas.fornecedores, color: "#06b6d4" },
    { name: "Logística", value: despesas.logistica, color: "#10b981" },
    { name: "Gerais", value: despesas.gerais, color: "#64748b" },
  ].filter((s) => s.value > 0);

  // Barras mensais (receita/despesa/lucro por mês existente)
  const mensal = useMemo(() => {
    const rec: Record<string, number> = {};
    const des: Record<string, number> = {};
    for (const r of cr) {
      const k = monthKey(r.recebido_em ?? r.vencimento);
      if (!k) continue;
      rec[k] = (rec[k] ?? 0) + Number(r.valor_recebido ?? r.valor ?? 0);
    }
    for (const r of cp) {
      const k = monthKey(r.vencimento);
      if (!k) continue;
      des[k] = (des[k] ?? 0) + Number(r.valor ?? 0);
    }
    const keys = Array.from(new Set([...Object.keys(rec), ...Object.keys(des)]));
    return keys.map((k) => ({ mes: k, receita: rec[k] ?? 0, despesa: des[k] ?? 0, lucro: (rec[k] ?? 0) - (des[k] ?? 0) }));
  }, [cr, cp]);

  return (
    <>
      <AppTopbar title="Pré-Balanço Financeiro" breadcrumb={["Financeiro", "Pré-Balanço"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Card className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium">Filtros:</div>
            <label className="text-xs flex items-center gap-1.5">
              <span className="text-muted-foreground">Mês:</span>
              <select value={mes} onChange={(e) => setMes(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
                <option>Todos</option>
                {mesesDisponiveis.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <Button variant="outline" size="sm" className="ml-auto" onClick={load}>Recarregar</Button>
          </div>
        </Card>

        {loading ? (
          <LoadingState label="Consolidando pré-balanço..." />
        ) : error ? (
          <ErrorState onRetry={load} message={error.message} />
        ) : (
        <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Receita total" value={formatCurrency(receitas.total)} delta={`Recebido ${formatCurrency(receitas.recebido)}`} icon={TrendingUp} color="emerald" />
          <KpiCard label="Despesa total" value={formatCurrency(despesas.total)} delta="Contas a pagar do período" icon={TrendingDown} color="rose" />
          <KpiCard label="Lucro líquido" value={formatCurrency(lucroLiquido)} delta={`${margem.toFixed(1)}% de margem`} icon={TrendingUp} color="violet" />
          <KpiCard label="Margem operacional" value={`${margem.toFixed(1)}%`} delta="sobre receita" icon={Percent} color="amber" />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="font-semibold mb-1">Receitas</h3>
            <div className="text-xs text-muted-foreground mb-4">Recebido × previsto</div>
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={receitasPie} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {receitasPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2 text-sm">
              {receitasPie.map((r) => (
                <div key={r.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} /> {r.name}</span>
                  <span className="font-semibold text-emerald-600">+{formatCurrency(r.value)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1">Despesas</h3>
            <div className="text-xs text-muted-foreground mb-4">Quebra por categoria</div>
            <div className="h-56">
              {despesasPie.length ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={despesasPie} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {despesasPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full grid place-items-center text-sm text-muted-foreground">Nenhuma despesa no período</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 text-sm">
              {despesasPie.map((r) => (
                <div key={r.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} /> {r.name}</span>
                  <span className="font-semibold text-rose-500">-{formatCurrency(r.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Resultados mensais</h3>
              <p className="text-xs text-muted-foreground">Receita × despesa × lucro</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Margem {margem.toFixed(1)}%</Badge>
          </div>
          <div className="h-72">
            {mensal.length ? (
              <ResponsiveContainer>
                <BarChart data={mensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="receita" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Sem dados financeiros para exibir</div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">DRE simplificado</h3>
          <div className="space-y-1 text-sm">
            <Row label="(+) Recebimentos" value={receitas.recebido} positive />
            <Row label="(+) Previstos" value={receitas.previstos} positive />
            <Row label="(=) Receita bruta total" value={receitas.total} bold />
            <div className="border-t my-2" />
            <Row label="(−) Cachês de palestrantes" value={-despesas.caches} />
            <Row label="(−) Impostos" value={-despesas.impostos} />
            <Row label="(−) Comissões" value={-despesas.comissoes} />
            <Row label="(−) Fornecedores" value={-despesas.fornecedores} />
            <Row label="(−) Logística" value={-despesas.logistica} />
            <Row label="(−) Despesas gerais" value={-despesas.gerais} />
            <Row label="(=) Despesa total" value={-despesas.total} bold />
            <div className="border-t my-2" />
            <Row label="LUCRO LÍQUIDO" value={lucroLiquido} bold big positive={lucroLiquido > 0} />
            <div className="flex justify-between pt-2"><span className="text-muted-foreground">Margem operacional</span><span className="font-bold">{margem.toFixed(2)}%</span></div>
          </div>
        </Card>
        </>
        )}
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function KpiCard({ label, value, delta, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    emerald: "from-emerald-500 to-emerald-600",
    rose: "from-rose-500 to-rose-600",
    violet: "from-violet-500 to-fuchsia-500",
    amber: "from-amber-500 to-orange-500",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{delta}</div>
        </div>
        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${colors[color]} grid place-items-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </Card>
  );
}

function Row({ label, value, positive, bold, big }: { label: string; value: number; positive?: boolean; bold?: boolean; big?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 ${bold ? "border-b border-dashed" : ""}`}>
      <span className={`${bold ? "font-semibold" : "text-muted-foreground"} ${big ? "text-base" : ""}`}>{label}</span>
      <span className={`${bold ? "font-bold" : ""} ${big ? "text-lg" : ""} ${value < 0 ? "text-rose-500" : positive ? "text-emerald-600" : ""}`}>{formatCurrency(value)}</span>
    </div>
  );
}
