import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { colaboradores, comissoesPorColaborador, comissoesVenda, formatBRL, vendas } from "@/lib/mock-data";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Wallet, Users, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/comissoes")({ component: ComissoesPage });

function ComissoesPage() {
  const map = comissoesPorColaborador();
  const totalBruto = Object.values(map).reduce((a, c) => a + c.bruto, 0);
  const totalLiq = Object.values(map).reduce((a, c) => a + c.liquido, 0);

  const chartData = colaboradores
    .map((c) => ({ nome: c.nome.split(" ")[0], bruto: map[c.id].bruto, liquido: map[c.id].liquido }))
    .filter((x) => x.bruto > 0);

  return (
    <>
      <AppTopbar title="Comissões internas" breadcrumb={["Financeiro", "Comissões"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Total bruto</div><div className="text-2xl font-bold mt-1">{formatBRL(totalBruto)}</div></Card>
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Total líquido</div><div className="text-2xl font-bold mt-1 text-emerald-500">{formatBRL(totalLiq)}</div></Card>
          <Card className="p-5"><div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Colaboradores ativos</div><div className="text-2xl font-bold mt-1">{chartData.length}</div></Card>
          <Card className="p-5"><div className="text-xs text-muted-foreground">Retenção média</div><div className="text-2xl font-bold mt-1">12.5%</div><div className="text-[11px] text-muted-foreground">IRRF + INSS estimado</div></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 p-5">
            <h3 className="font-semibold mb-4">Comissões por colaborador (mês)</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="nome" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => formatBRL(v)} />
                  <Bar dataKey="bruto" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="liquido" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Configuração de percentuais</h3>
            <div className="space-y-2 text-sm">
              {colaboradores.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <img src={c.foto} className="h-7 w-7 rounded-full" alt="" />
                    <div>
                      <div className="font-medium text-xs">{c.nome}</div>
                      <div className="text-[10px] text-muted-foreground">{c.cargo}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{c.pctVenda}%</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b"><h3 className="font-semibold">Painel detalhado por colaborador</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Colaborador</th>
                <th className="text-left px-2 py-3">Cargo / Área</th>
                <th className="text-right px-2 py-3">Vendas</th>
                <th className="text-right px-2 py-3">% médio</th>
                <th className="text-right px-2 py-3">Bruto</th>
                <th className="text-right px-5 py-3">Líquido</th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.map((c) => {
                const r = map[c.id];
                return (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-5 py-3 flex items-center gap-2"><img src={c.foto} className="h-7 w-7 rounded-full" alt="" /><span className="font-medium">{c.nome}</span></td>
                    <td className="px-2 py-3 text-muted-foreground">{c.cargo} · <span className="text-xs">{c.area}</span></td>
                    <td className="px-2 py-3 text-right">{r.vendas}</td>
                    <td className="px-2 py-3 text-right">{c.pctVenda}%</td>
                    <td className="px-2 py-3 text-right font-semibold">{formatBRL(r.bruto)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-500">{formatBRL(r.liquido)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">Comissões por venda</h3>
          <div className="space-y-3">
            {vendas.map((v) => {
              const parts = comissoesVenda[v.id] ?? [];
              return (
                <div key={v.id} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">{v.numero}</div>
                      <div className="text-sm font-semibold">{v.cliente} · {formatBRL(v.bruto)}</div>
                    </div>
                    <Badge variant="outline">{parts.length} participante(s)</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {parts.map((p, i) => {
                      const col = colaboradores.find((c) => c.id === p.colaboradorId)!;
                      const valor = (v.bruto * p.pct) / 100;
                      return (
                        <div key={i} className="text-xs p-2 rounded bg-muted/40 flex items-center gap-2">
                          <img src={col.foto} className="h-6 w-6 rounded-full" alt="" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{col.nome}</div>
                            <div className="text-[10px] text-muted-foreground">{p.papel} · {p.pct}%</div>
                          </div>
                          <div className="font-semibold">{formatBRL(valor)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
