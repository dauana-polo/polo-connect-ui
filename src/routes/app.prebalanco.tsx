import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { preBalanco, formatBRL, receitaMensal, clientes, palestrantes } from "@/lib/mock-data";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Percent, Filter } from "lucide-react";

export const Route = createFileRoute("/app/prebalanco")({ component: PreBalancoPage });

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago"];

function PreBalancoPage() {
  const [mes, setMes] = useState("Ago");
  const [cliente, setCliente] = useState("Todos");
  const [palest, setPalest] = useState("Todos");
  const pb = preBalanco();

  const receitasPie = [
    { name: "Vendas fechadas", value: pb.receitas.vendas, color: "var(--chart-1)" },
    { name: "Comissões recebidas", value: pb.receitas.comissaoRecebida, color: "var(--chart-2)" },
    { name: "Recebimentos previstos", value: pb.receitas.previstos, color: "var(--chart-3)" },
  ];

  const despesasPie = [
    { name: "Cachês", value: pb.despesas.caches, color: "#8b5cf6" },
    { name: "Impostos", value: pb.despesas.impostos, color: "#ef4444" },
    { name: "Comissões internas", value: pb.despesas.comissoes, color: "#f59e0b" },
    { name: "Fornecedores", value: pb.despesas.fornecedores, color: "#06b6d4" },
    { name: "Logística", value: pb.despesas.logistica, color: "#10b981" },
    { name: "Gerais", value: pb.despesas.gerais, color: "#64748b" },
  ];

  return (
    <>
      <AppTopbar title="Pré-Balanço Financeiro" breadcrumb={["Financeiro", "Pré-Balanço"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Card className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium">Filtros:</div>
            <Select value={mes} onChange={setMes} options={["Todos", ...MESES]} label="Mês" />
            <Select value={cliente} onChange={setCliente} options={["Todos", ...clientes.map(c => c.nome)]} label="Cliente" />
            <Select value={palest} onChange={setPalest} options={["Todos", ...palestrantes.map(p => p.nome)]} label="Palestrante" />
            <Button variant="outline" size="sm" className="ml-auto">Exportar PDF</Button>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Receita total" value={formatBRL(pb.receitas.total)} delta="+12,4%" icon={TrendingUp} color="emerald" />
          <KpiCard label="Despesa total" value={formatBRL(pb.despesas.total)} delta="+8,1%" icon={TrendingDown} color="rose" />
          <KpiCard label="Lucro líquido" value={formatBRL(pb.lucroLiquido)} delta={`${pb.margem.toFixed(1)}%`} icon={TrendingUp} color="violet" />
          <KpiCard label="Margem operacional" value={`${pb.margem.toFixed(1)}%`} delta="sobre receita" icon={Percent} color="amber" />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="font-semibold mb-1">Receitas</h3>
            <div className="text-xs text-muted-foreground mb-4">Quebra por origem</div>
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={receitasPie} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {receitasPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2 text-sm">
              {receitasPie.map((r) => (
                <div key={r.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} /> {r.name}</span>
                  <span className="font-semibold text-emerald-600">+{formatBRL(r.value)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1">Despesas</h3>
            <div className="text-xs text-muted-foreground mb-4">Quebra por categoria</div>
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={despesasPie} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {despesasPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 text-sm">
              {despesasPie.map((r) => (
                <div key={r.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} /> {r.name}</span>
                  <span className="font-semibold text-rose-500">-{formatBRL(r.value)}</span>
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
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Margem média 24.8%</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={receitaMensal.map((m) => ({ mes: m.mes, receita: m.receita, despesa: m.receita * 0.55, lucro: m.receita * 0.28 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => formatBRL(v)} />
                <Bar dataKey="receita" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">DRE simplificado</h3>
          <div className="space-y-1 text-sm">
            <Row label="(+) Vendas fechadas" value={pb.receitas.vendas} positive />
            <Row label="(+) Comissões recebidas" value={pb.receitas.comissaoRecebida} positive />
            <Row label="(=) Receita bruta total" value={pb.receitas.total} bold />
            <div className="border-t my-2" />
            <Row label="(−) Cachês de palestrantes" value={-pb.despesas.caches} />
            <Row label="(−) Impostos sobre serviços" value={-pb.despesas.impostos} />
            <Row label="(−) Comissões internas" value={-pb.despesas.comissoes} />
            <Row label="(−) Fornecedores" value={-pb.despesas.fornecedores} />
            <Row label="(−) Logística" value={-pb.despesas.logistica} />
            <Row label="(−) Despesas gerais" value={-pb.despesas.gerais} />
            <Row label="(=) Despesa total" value={-pb.despesas.total} bold />
            <div className="border-t my-2" />
            <Row label="Lucro bruto" value={pb.lucroBruto} bold positive={pb.lucroBruto > 0} />
            <Row label="LUCRO LÍQUIDO" value={pb.lucroLiquido} bold big positive={pb.lucroLiquido > 0} />
            <div className="flex justify-between pt-2"><span className="text-muted-foreground">Margem operacional</span><span className="font-bold">{pb.margem.toFixed(2)}%</span></div>
          </div>
        </Card>
      </div>
    </>
  );
}

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

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="text-xs flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Row({ label, value, positive, bold, big }: { label: string; value: number; positive?: boolean; bold?: boolean; big?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 ${bold ? "border-b border-dashed" : ""}`}>
      <span className={`${bold ? "font-semibold" : "text-muted-foreground"} ${big ? "text-base" : ""}`}>{label}</span>
      <span className={`${bold ? "font-bold" : ""} ${big ? "text-lg" : ""} ${value < 0 ? "text-rose-500" : positive ? "text-emerald-600" : ""}`}>{formatBRL(value)}</span>
    </div>
  );
}
