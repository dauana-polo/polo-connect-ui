import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { colaboradores, comissoesVenda, formatBRL, vendas } from "@/lib/mock-data";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Wallet, Users, TrendingUp, Filter, RotateCcw, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/app/comissoes")({ component: ComissoesPage });

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type LinhaComissao = {
  vendaId: string;
  numero: string;
  cliente: string;
  palestrante: string;
  data: string;
  mes: string;
  ano: string;
  bruto: number;
  colaboradorId: string;
  colaborador: string;
  papel: string;
  pct: number;
  comissaoBruta: number;
  comissaoLiquida: number;
};

function ComissoesPage() {
  const [mesFiltro, setMesFiltro] = useState<string>("todos");
  const [colabFiltro, setColabFiltro] = useState<string>("todos");

  const linhas: LinhaComissao[] = useMemo(() => {
    const out: LinhaComissao[] = [];
    for (const v of vendas) {
      const [, mm, yyyy] = v.data.split("/");
      const mesLabel = MESES[Number(mm) - 1];
      for (const p of comissoesVenda[v.id] ?? []) {
        const col = colaboradores.find((c) => c.id === p.colaboradorId)!;
        const bruta = (v.bruto * p.pct) / 100;
        out.push({
          vendaId: v.id, numero: v.numero, cliente: v.cliente, palestrante: v.palestrante,
          data: v.data, mes: mesLabel, ano: yyyy, bruto: v.bruto,
          colaboradorId: col.id, colaborador: col.nome, papel: p.papel, pct: p.pct,
          comissaoBruta: bruta, comissaoLiquida: bruta * 0.875,
        });
      }
    }
    return out;
  }, []);

  const mesesDisponiveis = useMemo(
    () => Array.from(new Set(linhas.map((l) => `${l.mes}/${l.ano}`))),
    [linhas],
  );

  const filtradas = useMemo(
    () => linhas.filter((l) =>
      (mesFiltro === "todos" || `${l.mes}/${l.ano}` === mesFiltro) &&
      (colabFiltro === "todos" || l.colaboradorId === colabFiltro),
    ),
    [linhas, mesFiltro, colabFiltro],
  );

  const totalBruto = filtradas.reduce((a, l) => a + l.comissaoBruta, 0);
  const totalLiq = filtradas.reduce((a, l) => a + l.comissaoLiquida, 0);
  const vendasUnicas = new Set(filtradas.map((l) => l.vendaId)).size;
  const colabsAtivos = new Set(filtradas.map((l) => l.colaboradorId)).size;

  // chart por colaborador (respeitando filtros)
  const chartData = colaboradores
    .map((c) => {
      const ls = filtradas.filter((l) => l.colaboradorId === c.id);
      return {
        nome: c.nome.split(" ")[0],
        bruto: ls.reduce((a, l) => a + l.comissaoBruta, 0),
        liquido: ls.reduce((a, l) => a + l.comissaoLiquida, 0),
      };
    })
    .filter((x) => x.bruto > 0);

  // total mensal (agrupado por mês/ano, respeitando filtro de colaborador)
  const totalMensal = useMemo(() => {
    const baseColab = linhas.filter((l) => colabFiltro === "todos" || l.colaboradorId === colabFiltro);
    const agg: Record<string, { bruto: number; liquido: number; vendas: Set<string> }> = {};
    for (const l of baseColab) {
      const k = `${l.mes}/${l.ano}`;
      if (!agg[k]) agg[k] = { bruto: 0, liquido: 0, vendas: new Set() };
      agg[k].bruto += l.comissaoBruta;
      agg[k].liquido += l.comissaoLiquida;
      agg[k].vendas.add(l.vendaId);
    }
    return Object.entries(agg).map(([mes, v]) => ({ mes, bruto: v.bruto, liquido: v.liquido, vendas: v.vendas.size }));
  }, [linhas, colabFiltro]);

  const resetFiltros = () => { setMesFiltro("todos"); setColabFiltro("todos"); };

  return (
    <>
      <AppTopbar title="Comissões internas" breadcrumb={["Financeiro", "Comissões"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Filtros */}
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" /> Filtros
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">Mês de referência</label>
              <Select value={mesFiltro} onValueChange={setMesFiltro}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {mesesDisponiveis.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">Colaborador</label>
              <Select value={colabFiltro} onValueChange={setColabFiltro}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os colaboradores</SelectItem>
                  {colaboradores.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome} · {c.cargo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={resetFiltros} className="gap-1">
              <RotateCcw className="h-3 w-3" /> Limpar
            </Button>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{filtradas.length} lançamentos</Badge>
              <Badge variant="outline">{vendasUnicas} vendas</Badge>
            </div>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Total bruto</div><div className="text-2xl font-bold mt-1">{formatBRL(totalBruto)}</div></Card>
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Total líquido</div><div className="text-2xl font-bold mt-1 text-emerald-500">{formatBRL(totalLiq)}</div></Card>
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Colaboradores</div><div className="text-2xl font-bold mt-1">{colabsAtivos}</div></Card>
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Retenção média</div><div className="text-2xl font-bold mt-1">12.5%</div><div className="text-[11px] text-muted-foreground">IRRF + INSS estimado</div></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 p-5">
            <h3 className="font-semibold mb-4">Comissões por colaborador</h3>
            <div className="h-72">
              {chartData.length ? (
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="nome" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => formatBRL(v)} />
                    <Bar dataKey="bruto" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="liquido" fill="var(--primary)" radius={[4, 4, 0, 0]} />
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
              {totalMensal.length === 0 && <p className="text-sm text-muted-foreground">Sem registros.</p>}
              {totalMensal.map((m) => (
                <div key={m.mes} className={`p-3 rounded-lg border flex items-center justify-between ${mesFiltro === m.mes ? "bg-primary/5 border-primary/40" : ""}`}>
                  <div>
                    <div className="text-xs text-muted-foreground">{m.vendas} venda(s)</div>
                    <div className="font-semibold">{m.mes}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Bruto {formatBRL(m.bruto)}</div>
                    <div className="font-semibold text-emerald-500">{formatBRL(m.liquido)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tabela: comissão por venda */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Comissão por venda</h3>
              <p className="text-xs text-muted-foreground">Detalhamento de cada lançamento conforme filtros aplicados.</p>
            </div>
            <Badge variant="outline">Total líquido do período: <span className="ml-1 font-semibold text-emerald-500">{formatBRL(totalLiq)}</span></Badge>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Venda</th>
                <th className="text-left px-2 py-3">Cliente / Palestrante</th>
                <th className="text-left px-2 py-3">Mês</th>
                <th className="text-left px-2 py-3">Colaborador</th>
                <th className="text-left px-2 py-3">Papel</th>
                <th className="text-right px-2 py-3">Bruto venda</th>
                <th className="text-right px-2 py-3">%</th>
                <th className="text-right px-2 py-3">Comissão bruta</th>
                <th className="text-right px-5 py-3">Líquida</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 && (
                <tr><td colSpan={9} className="text-center text-sm text-muted-foreground py-8">Nenhum lançamento para os filtros selecionados.</td></tr>
              )}
              {filtradas.map((l, i) => {
                const col = colaboradores.find((c) => c.id === l.colaboradorId)!;
                return (
                  <tr key={`${l.vendaId}-${i}`} className="border-t hover:bg-muted/30">
                    <td className="px-5 py-3"><div className="font-mono text-xs">{l.numero}</div><div className="text-[11px] text-muted-foreground">{l.data}</div></td>
                    <td className="px-2 py-3"><div className="font-medium">{l.cliente}</div><div className="text-[11px] text-muted-foreground">{l.palestrante}</div></td>
                    <td className="px-2 py-3"><Badge variant="secondary">{l.mes}/{l.ano}</Badge></td>
                    <td className="px-2 py-3"><div className="flex items-center gap-2"><img src={col.foto} className="h-6 w-6 rounded-full" alt="" /><span className="text-xs font-medium">{l.colaborador}</span></div></td>
                    <td className="px-2 py-3"><Badge variant="outline">{l.papel}</Badge></td>
                    <td className="px-2 py-3 text-right text-muted-foreground">{formatBRL(l.bruto)}</td>
                    <td className="px-2 py-3 text-right">{l.pct}%</td>
                    <td className="px-2 py-3 text-right font-semibold">{formatBRL(l.comissaoBruta)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-500">{formatBRL(l.comissaoLiquida)}</td>
                  </tr>
                );
              })}
            </tbody>
            {filtradas.length > 0 && (
              <tfoot className="bg-muted/30 text-sm font-semibold">
                <tr>
                  <td colSpan={7} className="px-5 py-3 text-right">Totais do período</td>
                  <td className="px-2 py-3 text-right">{formatBRL(totalBruto)}</td>
                  <td className="px-5 py-3 text-right text-emerald-500">{formatBRL(totalLiq)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </Card>
      </div>
    </>
  );
}
