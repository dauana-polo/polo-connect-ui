import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VendaDrawer } from "@/components/vendas/VendaDrawer";
import { formatBRL } from "@/lib/crm/constants";
import { TrendingUp, Percent, Wallet, Receipt, Building2, Pencil } from "lucide-react";
import { Can } from "@/components/shared/Can";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

export const Route = createFileRoute("/app/vendas")({ component: VendasPage });

type VendaRow = {
  id: string;
  titulo: string;
  data_evento: string | null;
  cidade: string | null;
  valor_total: number;
  cache_palestr: number;
  valor_iss: number;
  valor_pis: number;
  valor_cofins: number;
  valor_irrf: number;
  valor_csll: number;
  total_impostos: number;
  valor_liquido: number;
  status: string;
  empresa_polo_id: string | null;
  cliente: { razao_social: string; nome_fantasia: string | null } | null;
  palestrante: { nome: string } | null;
  consultor: { nome: string } | null;
};

type Empresa = { id: string; razao_social: string; nome_fantasia: string | null; regime: string | null };

function VendasPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const { data: vendas = [], isLoading, error, refetch } = useQuery({
    queryKey: ["vendas-lista"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select(
          "id,titulo,data_evento,cidade,valor_total,cache_palestr,valor_iss,valor_pis,valor_cofins,valor_irrf,valor_csll,total_impostos,valor_liquido,status,empresa_polo_id,cliente:clientes(razao_social,nome_fantasia),palestrante:palestrantes(nome),consultor:usuarios(nome)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as VendaRow[];
    },
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas-polo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas_polo")
        .select("id,razao_social,nome_fantasia,regime")
        .order("razao_social");
      if (error) throw error;
      return (data ?? []) as Empresa[];
    },
  });

  const { data: regras = [] } = useQuery({
    queryKey: ["regras-comissao"],
    queryFn: async () => {
      const { data, error } = await supabase.from("regras_comissao").select("tipo,percentual").eq("ativo", true);
      if (error) throw error;
      return data ?? [];
    },
  });
  const pctConsultor = Number(regras.find((r: any) => r.tipo === "consultor")?.percentual ?? 0);

  const v = useMemo(() => vendas.find((x) => x.id === selectedId) ?? vendas[0], [vendas, selectedId]);

  const { data: comissoesVenda = [] } = useQuery({
    queryKey: ["comissoes-venda", v?.id],
    enabled: !!v,
    queryFn: async () => {
      const { data, error } = await supabase.from("comissoes").select("tipo,percentual,valor,pago").eq("venda_id", v!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalBruto = vendas.reduce((a, b) => a + Number(b.valor_total), 0);
  const totalLiquido = vendas.reduce((a, b) => a + Number(b.valor_liquido), 0);
  const totalImpostos = vendas.reduce((a, b) => a + Number(b.total_impostos), 0);
  const totalMargemEstimada = vendas.reduce(
    (a, b) => a + (Number(b.valor_liquido) - Number(b.cache_palestr) - Number(b.valor_liquido) * (pctConsultor / 100)),
    0,
  );

  const empresaLabel = (id: string | null) => {
    if (!id) return "Sem empresa vinculada";
    const e = empresas.find((x) => x.id === id);
    return e ? e.nome_fantasia || e.razao_social : "—";
  };
  const empresaInitial = (id: string | null) => (empresaLabel(id)[0] ?? "?").toUpperCase();

  if (isLoading) {
    return (<>
      <AppTopbar title="Vendas & Tributação" breadcrumb={["Comercial", "Vendas"]} />
      <LoadingState label="Carregando vendas…" />
    </>);
  }
  if (error) {
    return (<>
      <AppTopbar title="Vendas & Tributação" breadcrumb={["Comercial", "Vendas"]} />
      <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
    </>);
  }
  if (vendas.length === 0) {
    return (
      <>
        <AppTopbar title="Vendas & Tributação" breadcrumb={["Comercial", "Vendas"]} />
        <div className="p-10 text-center text-sm text-muted-foreground max-w-md mx-auto">
          Nenhuma venda registrada ainda. Vendas são criadas automaticamente ao marcar um lead como
          "Ganho" no CRM (aba Propostas → Nova Proposta → fechar negócio).
        </div>
      </>
    );
  }

  return (
    <>
      <AppTopbar title="Vendas & Tributação" breadcrumb={["Comercial", "Vendas"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Receita bruta
            </div>
            <div className="text-2xl font-bold mt-1">{formatBRL(totalBruto)}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Receipt className="h-3 w-3" /> Impostos retidos
            </div>
            <div className="text-2xl font-bold mt-1 text-rose-500">- {formatBRL(totalImpostos)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {totalBruto ? ((totalImpostos / totalBruto) * 100).toFixed(1) : "0.0"}% efetivo
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Receita líquida
            </div>
            <div className="text-2xl font-bold mt-1 text-emerald-500">{formatBRL(totalLiquido)}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Percent className="h-3 w-3" /> Margem estimada
            </div>
            <div className="text-2xl font-bold mt-1">{formatBRL(totalMargemEstimada)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">líquido − cachês − comissão consultor ({pctConsultor}%)</div>
          </Card>
        </div>

        {v && (
          <div className="grid lg:grid-cols-5 gap-5">
            <Card className="lg:col-span-3 p-5">
              <h3 className="font-semibold mb-4">Vendas recentes</h3>
              <div className="space-y-3">
                {vendas.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-left p-4 rounded-lg border transition ${v.id === s.id ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-white text-xs font-bold shrink-0">
                          {empresaInitial(s.empresa_polo_id)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {s.cliente?.nome_fantasia || s.cliente?.razao_social || "—"}
                            <span className="text-muted-foreground font-normal"> · {s.palestrante?.nome ?? "—"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{s.titulo}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                        {s.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Bruto</div>
                        <div className="font-semibold">{formatBRL(s.valor_total)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Impostos</div>
                        <div className="font-semibold text-rose-500">-{formatBRL(s.total_impostos)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Líquido</div>
                        <div className="font-semibold text-emerald-500">{formatBRL(s.valor_liquido)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Cachê</div>
                        <div className="font-semibold">{formatBRL(s.cache_palestr)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-2 p-5 h-fit sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">
                    {v.data_evento ? new Date(v.data_evento).toLocaleDateString("pt-BR") : "Sem data"}
                  </div>
                  <div className="font-semibold">{v.cliente?.nome_fantasia || v.cliente?.razao_social || "—"}</div>
                  <div className="text-xs text-muted-foreground">{v.palestrante?.nome ?? "—"}</div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-white font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Empresa emissora</span>
                  <Can resource="vendas" action="edit">
                    <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => setDrawerId(v.id)}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </Can>
                </div>
                <div className="font-semibold">{empresaLabel(v.empresa_polo_id)}</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-sm font-medium">Valor bruto da venda</span>
                  <span className="text-lg font-bold">{formatBRL(v.valor_total)}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground">
                    Retenções automáticas (calculadas pelo banco)
                  </div>
                  {[
                    { label: "ISS", pct: 5, valor: v.valor_iss },
                    { label: "PIS", pct: 0.65, valor: v.valor_pis },
                    { label: "COFINS", pct: 3, valor: v.valor_cofins },
                    { label: "IRRF", pct: 1.5, valor: v.valor_irrf },
                    { label: "CSLL", pct: 1, valor: v.valor_csll },
                  ].map((d) => (
                    <div key={d.label} className="flex items-center justify-between text-sm py-1.5 border-b border-dashed">
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground">{d.label}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {d.pct}%
                        </Badge>
                      </span>
                      <span className="text-rose-500 font-medium">- {formatBRL(d.valor)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 font-semibold">
                    <span>Total de impostos</span>
                    <span className="text-rose-500">- {formatBRL(v.total_impostos)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-emerald-600" /> Valor líquido
                  </span>
                  <span className="text-lg font-bold text-emerald-600">{formatBRL(v.valor_liquido)}</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground">Comissões</div>
                  {comissoesVenda.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-1">
                      Ainda não geradas — o gatilho do banco calcula as comissões automaticamente quando uma parcela é
                      marcada como recebida no Financeiro. Estimativa do consultor: {formatBRL(v.valor_liquido * (pctConsultor / 100))}{" "}
                      ({pctConsultor}%).
                    </div>
                  ) : (
                    comissoesVenda.map((c: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1">
                        <span className="text-muted-foreground capitalize">
                          {c.tipo} · {c.percentual}% {c.pago ? "· pago" : "· pendente"}
                        </span>
                        <span>{formatBRL(c.valor)}</span>
                      </div>
                    ))
                  )}
                </div>

                <Button className="w-full" onClick={() => setDrawerId(v.id)}>
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Editar venda
                </Button>
              </div>
            </Card>
          </div>
        )}

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Empresas vinculadas</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {empresas.map((emp) => {
              const empVendas = vendas.filter((s) => s.empresa_polo_id === emp.id);
              const total = empVendas.reduce((a, b) => a + Number(b.valor_total), 0);
              return (
                <div key={emp.id} className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-white font-bold">
                      {(emp.nome_fantasia || emp.razao_social)[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{emp.nome_fantasia || emp.razao_social}</div>
                      <Badge variant="outline" className="text-[10px] mt-0.5 capitalize">
                        {emp.regime?.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Vendas</div>
                      <div className="font-semibold">{empVendas.length}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Receita</div>
                      <div className="font-semibold">{formatBRL(total)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {(() => {
              const semEmpresa = vendas.filter((s) => !s.empresa_polo_id);
              if (semEmpresa.length === 0) return null;
              const total = semEmpresa.reduce((a, b) => a + Number(b.valor_total), 0);
              return (
                <div className="p-4 rounded-lg border border-dashed">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-muted grid place-items-center text-muted-foreground font-bold">—</div>
                    <div>
                      <div className="font-semibold text-sm">Sem empresa vinculada</div>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        defina no drawer da venda
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Vendas</div>
                      <div className="font-semibold">{semEmpresa.length}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Receita</div>
                      <div className="font-semibold">{formatBRL(total)}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </Card>
      </div>

      <VendaDrawer
        vendaId={drawerId}
        open={!!drawerId}
        onOpenChange={(open) => !open && setDrawerId(null)}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["vendas-lista"] });
          setDrawerId(null);
        }}
      />
    </>
  );
}
