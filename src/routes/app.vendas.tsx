import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { vendas, empresas, calcularVenda, formatBRL } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Percent, Wallet, Receipt, Building2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app/vendas")({ component: VendasPage });

const empresaCor: Record<string, string> = {
  polo: "from-violet-500 to-fuchsia-500",
  penna: "from-emerald-500 to-teal-500",
  talks: "from-amber-500 to-orange-500",
};

function VendasPage() {
  const [selectedId, setSelectedId] = useState(vendas[0].id);
  const v = vendas.find((x) => x.id === selectedId)!;
  const calc = calcularVenda(v.bruto, v.cache, v.empresa);
  const e = empresas.find((x) => x.id === v.empresa)!;

  const totalBruto = vendas.reduce((a, b) => a + b.bruto, 0);
  const totalLiquido = vendas.reduce((a, b) => a + calcularVenda(b.bruto, b.cache, b.empresa).liquido, 0);
  const totalMargem = vendas.reduce((a, b) => a + calcularVenda(b.bruto, b.cache, b.empresa).margem, 0);
  const totalImpostos = totalBruto - totalLiquido;

  return (
    <>
      <AppTopbar title="Vendas & Tributação" breadcrumb={["Comercial", "Vendas"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Receita bruta</div>
            <div className="text-2xl font-bold mt-1">{formatBRL(totalBruto)}</div>
            <div className="text-[11px] text-emerald-500 mt-1">+12,4% vs mês ant.</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Receipt className="h-3 w-3" /> Impostos retidos</div>
            <div className="text-2xl font-bold mt-1 text-rose-500">- {formatBRL(totalImpostos)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{((totalImpostos / totalBruto) * 100).toFixed(1)}% efetivo</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Receita líquida</div>
            <div className="text-2xl font-bold mt-1 text-emerald-500">{formatBRL(totalLiquido)}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Percent className="h-3 w-3" /> Margem operacional</div>
            <div className="text-2xl font-bold mt-1">{formatBRL(totalMargem)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{((totalMargem / totalBruto) * 100).toFixed(1)}% sobre bruto</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3 p-5">
            <h3 className="font-semibold mb-4">Vendas recentes</h3>
            <div className="space-y-3">
              {vendas.map((s) => {
                const c = calcularVenda(s.bruto, s.cache, s.empresa);
                const emp = empresas.find((x) => x.id === s.empresa)!;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-left p-4 rounded-lg border transition ${selectedId === s.id ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-9 w-9 rounded-md bg-gradient-to-br ${empresaCor[s.empresa]} grid place-items-center text-white text-xs font-bold shrink-0`}>{emp.nome[0]}</div>
                        <div className="min-w-0">
                          <div className="font-mono text-xs text-muted-foreground">{s.numero}</div>
                          <div className="font-semibold text-sm truncate">{s.cliente} <span className="text-muted-foreground font-normal">· {s.palestrante}</span></div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{emp.regime}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div><div className="text-muted-foreground">Bruto</div><div className="font-semibold">{formatBRL(s.bruto)}</div></div>
                      <div><div className="text-muted-foreground">Impostos</div><div className="font-semibold text-rose-500">-{formatBRL(c.impostos)}</div></div>
                      <div><div className="text-muted-foreground">Líquido</div><div className="font-semibold text-emerald-500">{formatBRL(c.liquido)}</div></div>
                      <div><div className="text-muted-foreground">Margem</div><div className="font-semibold">{formatBRL(c.margem)}</div></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-5 h-fit sticky top-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs text-muted-foreground font-mono">{v.numero}</div>
                <div className="font-semibold">{v.cliente}</div>
                <div className="text-xs text-muted-foreground">{v.palestrante}</div>
              </div>
              <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${empresaCor[v.empresa]} grid place-items-center text-white font-bold`}>
                <Building2 className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Empresa emissora</span>
                <Badge>{e.regime}</Badge>
              </div>
              <div className="font-semibold">{e.nome}</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-sm font-medium">Valor bruto da venda</span>
                <span className="text-lg font-bold">{formatBRL(v.bruto)}</span>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] uppercase font-semibold text-muted-foreground">Retenções automáticas</div>
                {calc.detalhes.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-dashed">
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">{d.label}</span>
                      <Badge variant="outline" className="text-[10px]">{d.pct}%</Badge>
                    </span>
                    <span className="text-rose-500 font-medium">- {formatBRL(d.valor)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 font-semibold">
                  <span>Total de impostos</span>
                  <span className="text-rose-500">- {formatBRL(calc.impostos)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-sm font-medium flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-600" /> Valor líquido</span>
                <span className="text-lg font-bold text-emerald-600">{formatBRL(calc.liquido)}</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] uppercase font-semibold text-muted-foreground">Distribuição</div>
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground">Cachê do palestrante (70%)</span>
                  <span>- {formatBRL(calc.cache)}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground">Comissão consultor ({v.consultor}) · 5%</span>
                  <span>- {formatBRL(calc.comissao)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30">
                <span className="text-sm font-medium">Margem da venda</span>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatBRL(calc.margem)}</div>
                  <div className="text-[11px] text-muted-foreground">{((calc.margem / v.bruto) * 100).toFixed(1)}% sobre bruto</div>
                </div>
              </div>

              <Button className="w-full">Emitir NF-e <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Empresas vinculadas</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {empresas.map((emp) => {
              const empVendas = vendas.filter((s) => s.empresa === emp.id);
              const total = empVendas.reduce((a, b) => a + b.bruto, 0);
              return (
                <div key={emp.id} className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${empresaCor[emp.id]} grid place-items-center text-white font-bold`}>{emp.nome[0]}</div>
                    <div>
                      <div className="font-semibold text-sm">{emp.nome}</div>
                      <Badge variant="outline" className="text-[10px] mt-0.5">{emp.regime}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><div className="text-muted-foreground">Vendas</div><div className="font-semibold">{empVendas.length}</div></div>
                    <div><div className="text-muted-foreground">Receita</div><div className="font-semibold">{formatBRL(total)}</div></div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-[11px] text-muted-foreground">
                    {emp.regime === "Simples Nacional" ? `DAS ${emp.das}% + ISS ${emp.iss}%` : `ISS ${emp.iss}% · PIS ${emp.pis}% · COFINS ${emp.cofins}% · IRRF ${emp.irrf}% · CSLL ${emp.csll}%`}
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
