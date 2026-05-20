import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contasPagar, contasReceber, formatBRL, receitaMensal } from "@/lib/mock-data";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ArrowDownCircle, ArrowUpCircle, Building2, Wallet } from "lucide-react";

export const Route = createFileRoute("/app/financeiro")({
  component: Financeiro,
});

const statusCor: Record<string, string> = {
  pago: "bg-emerald-500",
  "em aberto": "bg-amber-500",
  atrasado: "bg-rose-500",
};

const cnpjs = [
  { nome: "Polo Eventos LTDA", cnpj: "12.345.678/0001-90", receita: 820000 },
  { nome: "Polo Internacional SA", cnpj: "98.765.432/0001-10", receita: 320000 },
  { nome: "Polo Talents ME", cnpj: "11.222.333/0001-44", receita: 144500 },
];

function Financeiro() {
  return (
    <>
      <AppTopbar title="Financeiro" breadcrumb={["Home", "Financeiro"]} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">A receber (30d)</div><div className="text-2xl font-semibold mt-1">{formatBRL(412000)}</div><div className="text-xs text-emerald-600 mt-1">+8.2%</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">A pagar (30d)</div><div className="text-2xl font-semibold mt-1">{formatBRL(187000)}</div><div className="text-xs text-rose-600 mt-1">+3.1%</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">Saldo previsto</div><div className="text-2xl font-semibold mt-1 text-emerald-600">{formatBRL(225000)}</div><div className="text-xs text-muted-foreground mt-1">Próximos 30 dias</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">Comissões mês</div><div className="text-2xl font-semibold mt-1">{formatBRL(96340)}</div><div className="text-xs text-muted-foreground mt-1">12% médio</div></CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Fluxo de caixa</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={receitaMensal.map((m) => ({ ...m, despesa: m.receita * 0.55 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => formatBRL(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="receita" stroke="var(--chart-2)" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="despesa" stroke="var(--chart-5)" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Multi-CNPJ</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {cnpjs.map((c) => (
                <div key={c.cnpj} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><div className="text-sm font-medium">{c.nome}</div></div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{c.cnpj}</div>
                  <div className="text-sm font-semibold text-emerald-600 mt-1.5">{formatBRL(c.receita)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="receber">
          <TabsList>
            <TabsTrigger value="receber"><ArrowDownCircle className="h-3.5 w-3.5 mr-1.5" />A Receber</TabsTrigger>
            <TabsTrigger value="pagar"><ArrowUpCircle className="h-3.5 w-3.5 mr-1.5" />A Pagar</TabsTrigger>
            <TabsTrigger value="comissoes"><Wallet className="h-3.5 w-3.5 mr-1.5" />Comissões</TabsTrigger>
          </TabsList>

          <TabsContent value="receber">
            <Card><CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground"><tr>
                  <th className="text-left px-5 py-3 font-medium">Cliente</th>
                  <th className="text-left px-2 py-3 font-medium">Evento</th>
                  <th className="text-left px-2 py-3 font-medium">Parcela</th>
                  <th className="text-right px-2 py-3 font-medium">Valor</th>
                  <th className="text-left px-2 py-3 font-medium">Vencimento</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {contasReceber.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-muted/30">
                      <td className="px-5 py-3 font-medium">{c.cliente}</td>
                      <td className="px-2 py-3 text-muted-foreground">{c.evento}</td>
                      <td className="px-2 py-3"><Badge variant="outline" className="font-mono text-[10px]">{c.parcela}</Badge></td>
                      <td className="px-2 py-3 text-right font-semibold">{formatBRL(c.valor)}</td>
                      <td className="px-2 py-3">{c.vencimento}</td>
                      <td className="px-5 py-3"><Badge className={`${statusCor[c.status]} text-white hover:${statusCor[c.status]}`}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="pagar">
            <Card><CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground"><tr>
                  <th className="text-left px-5 py-3 font-medium">Fornecedor</th>
                  <th className="text-left px-2 py-3 font-medium">Descrição</th>
                  <th className="text-right px-2 py-3 font-medium">Valor</th>
                  <th className="text-left px-2 py-3 font-medium">Vencimento</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {contasPagar.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-muted/30">
                      <td className="px-5 py-3 font-medium">{c.fornecedor}</td>
                      <td className="px-2 py-3 text-muted-foreground">{c.descricao}</td>
                      <td className="px-2 py-3 text-right font-semibold">{formatBRL(c.valor)}</td>
                      <td className="px-2 py-3">{c.vencimento}</td>
                      <td className="px-5 py-3"><Badge className={`${statusCor[c.status]} text-white hover:${statusCor[c.status]}`}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="comissoes">
            <Card>
              <CardHeader><CardTitle>Comissões por consultor</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer>
                    <BarChart data={[
                      { nome: "Ana Silva", v: 38400 },
                      { nome: "Pedro Souza", v: 29800 },
                      { nome: "Lucas Martins", v: 18140 },
                      { nome: "Camila", v: 10000 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="nome" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => formatBRL(v)} />
                      <Bar dataKey="v" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
