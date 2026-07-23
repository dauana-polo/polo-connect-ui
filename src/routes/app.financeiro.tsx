import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDownCircle, ArrowUpCircle, CheckCircle2, Plus, TrendingUp, Wallet } from "lucide-react";

export const Route = createFileRoute("/app/financeiro")({ component: FinanceiroPage });

const BRL = (n: number) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CATEGORIAS_PAGAR = ["Cachê palestrante", "Logística", "Marketing", "Operacional", "Impostos", "Salários", "Outros"];
const CATEGORIAS_RECEBER = ["Evento", "Consultoria", "Treinamento", "Outros"];

const statusCorPagar: Record<string, string> = {
  pago: "bg-emerald-500",
  pendente: "bg-amber-500",
  "em aberto": "bg-amber-500",
  atrasado: "bg-rose-500",
};

function periodoRange(mes: string) {
  const [y, m] = mes.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function FinanceiroPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`);

  // refresh vencidas + gera notificações
  useEffect(() => {
    supabase.rpc("atualizar_status_contas" as any).then(() => {});
  }, []);

  const { start, end } = periodoRange(mes);

  const { data: pagar = [] } = useQuery({
    queryKey: ["contas-pagar"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contas_pagar").select("*").order("vencimento", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: receber = [] } = useQuery({
    queryKey: ["contas-receber"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_receber")
        .select("*, vendas(titulo, cliente_id, data_evento, clientes(razao_social))")
        .order("vencimento", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const kpis = useMemo(() => {
    const inPeriod = (d: string | null) => d && d >= start && d <= end;
    const totPagar = pagar.filter((r: any) => inPeriod(r.vencimento) && r.status !== "pago").reduce((a: number, r: any) => a + Number(r.valor || 0), 0);
    const totReceber = receber.filter((r: any) => inPeriod(r.vencimento) && r.status !== "recebido" && r.status !== "pago").reduce((a: number, r: any) => a + Number(r.valor || 0), 0);
    const pagoMes = pagar.filter((r: any) => r.status === "pago" && inPeriod(r.pago_em)).reduce((a: number, r: any) => a + Number(r.valor || 0), 0);
    const recebidoMes = receber.filter((r: any) => (r.status === "recebido" || r.status === "pago") && inPeriod(r.recebido_em)).reduce((a: number, r: any) => a + Number(r.valor_recebido || r.valor || 0), 0);
    const saldo = recebidoMes - pagoMes;
    const projecao = saldo + totReceber - totPagar;
    const atrasadas = [...pagar, ...receber].filter((r: any) => r.status === "atrasado").length;
    return { totPagar, totReceber, pagoMes, recebidoMes, saldo, projecao, atrasadas };
  }, [pagar, receber, start, end]);

  return (
    <>
      <AppTopbar title="Financeiro" breadcrumb={["Home", "Financeiro"]} />
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-end gap-3 justify-between">
          <div>
            <Label className="text-xs">Período</Label>
            <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="w-44" />
          </div>
          <div className="flex gap-2">
            <NovaContaDialog tipo="pagar" />
            <NovaContaDialog tipo="receber" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI titulo="Saldo do mês" valor={BRL(kpis.saldo)} nota={kpis.saldo >= 0 ? "positivo" : "negativo"} color={kpis.saldo >= 0 ? "text-emerald-600" : "text-rose-600"} icon={<Wallet />} />
          <KPI titulo="A receber (período)" valor={BRL(kpis.totReceber)} nota="em aberto" color="text-emerald-600" icon={<ArrowDownCircle />} />
          <KPI titulo="A pagar (período)" valor={BRL(kpis.totPagar)} nota="em aberto" color="text-rose-600" icon={<ArrowUpCircle />} />
          <KPI titulo="Saldo projetado" valor={BRL(kpis.projecao)} nota={`${kpis.atrasadas} atrasadas`} color={kpis.projecao >= 0 ? "text-emerald-600" : "text-rose-600"} icon={<TrendingUp />} />
        </div>

        <Tabs defaultValue="visao">
          <TabsList>
            <TabsTrigger value="visao">Visão geral</TabsTrigger>
            <TabsTrigger value="pagar">Contas a pagar</TabsTrigger>
            <TabsTrigger value="receber">Contas a receber</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo de caixa</TabsTrigger>
          </TabsList>

          <TabsContent value="visao">
            <VisaoGeral pagar={pagar} receber={receber} />
          </TabsContent>

          <TabsContent value="pagar">
            <ContasPagarTab dados={pagar} />
          </TabsContent>

          <TabsContent value="receber">
            <ContasReceberTab dados={receber} />
          </TabsContent>

          <TabsContent value="fluxo">
            <FluxoCaixa pagar={pagar} receber={receber} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function KPI({ titulo, valor, nota, color, icon }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{titulo}</div>
          <div className="text-muted-foreground/60 [&>svg]:h-4 [&>svg]:w-4">{icon}</div>
        </div>
        <div className={`text-2xl font-semibold mt-1 ${color}`}>{valor}</div>
        <div className="text-xs text-muted-foreground mt-1">{nota}</div>
      </CardContent>
    </Card>
  );
}

function VisaoGeral({ pagar, receber }: any) {
  const porCategoria = useMemo(() => {
    const map: Record<string, { cat: string; pagar: number; receber: number }> = {};
    pagar.forEach((r: any) => {
      const k = r.categoria || "Sem categoria";
      map[k] = map[k] || { cat: k, pagar: 0, receber: 0 };
      map[k].pagar += Number(r.valor || 0);
    });
    receber.forEach((r: any) => {
      const k = r.categoria || "Sem categoria";
      map[k] = map[k] || { cat: k, pagar: 0, receber: 0 };
      map[k].receber += Number(r.valor || 0);
    });
    return Object.values(map);
  }, [pagar, receber]);

  const saude = useMemo(() => {
    const totRec = receber.reduce((a: number, r: any) => a + Number(r.valor || 0), 0);
    const totPag = pagar.reduce((a: number, r: any) => a + Number(r.valor || 0), 0);
    const cobertura = totPag > 0 ? (totRec / totPag) : totRec > 0 ? Infinity : 1;
    const atrasoPagar = pagar.filter((r: any) => r.status === "atrasado").length;
    const atrasoReceber = receber.filter((r: any) => r.status === "atrasado").length;
    return { cobertura, atrasoPagar, atrasoReceber };
  }, [pagar, receber]);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Distribuição por categoria</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={porCategoria}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="cat" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => BRL(v)} />
                <Legend />
                <Bar dataKey="receber" name="A receber" fill="#10b981" radius={[6,6,0,0]} />
                <Bar dataKey="pagar" name="A pagar" fill="#e11d48" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Saúde financeira</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Cobertura de despesas</div>
            <div className="text-xl font-semibold">
              {saude.cobertura === Infinity ? "∞" : `${(saude.cobertura * 100).toFixed(0)}%`}
            </div>
            <div className="text-xs text-muted-foreground">Recebíveis vs. contas a pagar totais</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground">Pagar atrasadas</div>
              <div className="text-lg font-semibold text-rose-600">{saude.atrasoPagar}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground">Receber atrasadas</div>
              <div className="text-lg font-semibold text-amber-600">{saude.atrasoReceber}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContasPagarTab({ dados }: any) {
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState("todos");
  const filtered = dados.filter((r: any) => filtro === "todos" ? true : r.status === filtro);

  const baixar = useMutation({
    mutationFn: async (r: any) => {
      const { error } = await supabase.from("contas_pagar")
        .update({ status: "pago", pago_em: new Date().toISOString().slice(0,10) })
        .eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contas-pagar"] }); toast.success("Pagamento registrado"); },
    onError: (e: any) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contas_pagar").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contas-pagar"] }); toast.success("Removida"); },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contas a pagar</CardTitle>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="atrasado">Atrasadas</SelectItem>
            <SelectItem value="pago">Pagas</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Descrição</th>
              <th className="text-left px-2 py-3 font-medium">Fornecedor</th>
              <th className="text-left px-2 py-3 font-medium">Categoria</th>
              <th className="text-right px-2 py-3 font-medium">Valor</th>
              <th className="text-left px-2 py-3 font-medium">Vencimento</th>
              <th className="text-left px-2 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="px-5 py-3 font-medium">{r.descricao || "—"}</td>
                <td className="px-2 py-3 text-muted-foreground">{r.fornecedor || r.beneficiario || "—"}</td>
                <td className="px-2 py-3"><Badge variant="outline">{r.categoria || "—"}</Badge></td>
                <td className="px-2 py-3 text-right font-semibold">{BRL(r.valor)}</td>
                <td className="px-2 py-3">{r.vencimento ? new Date(r.vencimento).toLocaleDateString("pt-BR") : "—"}</td>
                <td className="px-2 py-3">
                  <Badge className={`${statusCorPagar[r.status] || "bg-slate-500"} text-white`}>{r.status}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  {r.status !== "pago" && (
                    <Button size="sm" variant="ghost" onClick={() => baixar.mutate(r)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />Baixar
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remover.mutate(r.id)}>Excluir</Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">Nenhuma conta registrada.</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function ContasReceberTab({ dados }: any) {
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState("todos");
  const filtered = dados.filter((r: any) => {
    if (filtro === "todos") return true;
    if (filtro === "recebido") return r.status === "recebido" || r.status === "pago";
    return r.status === filtro;
  });

  const baixar = useMutation({
    mutationFn: async (r: any) => {
      const { error } = await supabase.from("contas_receber")
        .update({ status: "recebido", recebido_em: new Date().toISOString().slice(0,10), valor_recebido: r.valor })
        .eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contas-receber"] }); toast.success("Recebimento registrado"); },
    onError: (e: any) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contas_receber").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contas-receber"] }); toast.success("Removido"); },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contas a receber</CardTitle>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="atrasado">Atrasadas</SelectItem>
            <SelectItem value="recebido">Recebidas</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Cliente</th>
              <th className="text-left px-2 py-3 font-medium">Evento / Venda</th>
              <th className="text-left px-2 py-3 font-medium">Parcela</th>
              <th className="text-right px-2 py-3 font-medium">Valor</th>
              <th className="text-left px-2 py-3 font-medium">Vencimento</th>
              <th className="text-left px-2 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="px-5 py-3 font-medium">{r.vendas?.clientes?.razao_social || "—"}</td>
                <td className="px-2 py-3 text-muted-foreground">{r.vendas?.titulo || r.categoria || "—"}</td>
                <td className="px-2 py-3"><Badge variant="outline" className="font-mono text-[10px]">{r.parcela || 1}/{r.total_parcelas || 1}</Badge></td>
                <td className="px-2 py-3 text-right font-semibold">{BRL(r.valor)}</td>
                <td className="px-2 py-3">{r.vencimento ? new Date(r.vencimento).toLocaleDateString("pt-BR") : "—"}</td>
                <td className="px-2 py-3">
                  <Badge className={`${statusCorPagar[r.status] || (r.status === "recebido" ? "bg-emerald-500" : "bg-slate-500")} text-white`}>{r.status}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  {r.status !== "recebido" && r.status !== "pago" && (
                    <Button size="sm" variant="ghost" onClick={() => baixar.mutate(r)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />Dar baixa
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remover.mutate(r.id)}>Excluir</Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">Nenhum recebível registrado.</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function FluxoCaixa({ pagar, receber }: any) {
  const [modo, setModo] = useState<"diario" | "mensal">("mensal");

  const serie = useMemo(() => {
    const map: Record<string, { data: string; entradas: number; saidas: number; previsto_in: number; previsto_out: number }> = {};
    const bucket = (d: string) => modo === "mensal" ? d.slice(0, 7) : d;

    receber.forEach((r: any) => {
      if (r.recebido_em && (r.status === "recebido" || r.status === "pago")) {
        const k = bucket(r.recebido_em);
        map[k] = map[k] || { data: k, entradas: 0, saidas: 0, previsto_in: 0, previsto_out: 0 };
        map[k].entradas += Number(r.valor_recebido || r.valor || 0);
      } else if (r.vencimento) {
        const k = bucket(r.vencimento);
        map[k] = map[k] || { data: k, entradas: 0, saidas: 0, previsto_in: 0, previsto_out: 0 };
        map[k].previsto_in += Number(r.valor || 0);
      }
    });

    pagar.forEach((r: any) => {
      if (r.pago_em && r.status === "pago") {
        const k = bucket(r.pago_em);
        map[k] = map[k] || { data: k, entradas: 0, saidas: 0, previsto_in: 0, previsto_out: 0 };
        map[k].saidas += Number(r.valor || 0);
      } else if (r.vencimento) {
        const k = bucket(r.vencimento);
        map[k] = map[k] || { data: k, entradas: 0, saidas: 0, previsto_in: 0, previsto_out: 0 };
        map[k].previsto_out += Number(r.valor || 0);
      }
    });

    const arr = Object.values(map).sort((a, b) => a.data.localeCompare(b.data));
    let acumulado = 0;
    return arr.map((p) => {
      const saldo = p.entradas - p.saidas;
      const proj = saldo + p.previsto_in - p.previsto_out;
      acumulado += proj;
      return { ...p, saldo, projetado: proj, acumulado };
    });
  }, [pagar, receber, modo]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fluxo de caixa</CardTitle>
        <Tabs value={modo} onValueChange={(v) => setModo(v as any)}>
          <TabsList>
            <TabsTrigger value="mensal">Mensal</TabsTrigger>
            <TabsTrigger value="diario">Diário</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer>
            <AreaChart data={serie}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="data" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => BRL(v)} />
              <Legend />
              <Area type="monotone" dataKey="entradas" name="Entradas (pagas)" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
              <Area type="monotone" dataKey="saidas" name="Saídas (pagas)" stroke="#e11d48" fill="#e11d4833" strokeWidth={2} />
              <Area type="monotone" dataKey="acumulado" name="Saldo projetado acumulado" stroke="#3b82f6" fill="#3b82f622" strokeWidth={2} strokeDasharray="4 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {serie.slice(-4).map((p) => (
            <div key={p.data} className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground">{p.data}</div>
              <div className="text-emerald-600">+ {BRL(p.entradas)}</div>
              <div className="text-rose-600">− {BRL(p.saidas)}</div>
              <div className="text-xs text-muted-foreground mt-1">Projetado: {BRL(p.projetado)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NovaContaDialog({ tipo }: { tipo: "pagar" | "receber" }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    descricao: "",
    fornecedor: "",
    categoria: "",
    valor: "",
    vencimento: new Date().toISOString().slice(0, 10),
    status: "pendente",
    observacao: "",
    venda_id: "",
    parcela: 1,
    total_parcelas: 1,
  });

  const { data: vendas = [] } = useQuery({
    enabled: tipo === "receber" && open,
    queryKey: ["vendas-select"],
    queryFn: async () => {
      const { data } = await supabase.from("vendas")
        .select("id, titulo, clientes(razao_social)")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  const criar = useMutation({
    mutationFn: async () => {
      if (tipo === "pagar") {
        const payload: any = {
          descricao: form.descricao,
          fornecedor: form.fornecedor,
          beneficiario: form.fornecedor,
          categoria: form.categoria,
          valor: Number(form.valor),
          vencimento: form.vencimento,
          status: form.status,
          observacao: form.observacao || null,
        };
        const { error } = await supabase.from("contas_pagar").insert(payload);
        if (error) throw error;
      } else {
        const payload: any = {
          venda_id: form.venda_id || null,
          categoria: form.categoria,
          valor: Number(form.valor),
          vencimento: form.vencimento,
          status: form.status,
          parcela: Number(form.parcela) || 1,
          total_parcelas: Number(form.total_parcelas) || 1,
          observacao: form.observacao || null,
        };
        const { error } = await supabase.from("contas_receber").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [tipo === "pagar" ? "contas-pagar" : "contas-receber"] });
      toast.success("Registrado com sucesso");
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={tipo === "pagar" ? "outline" : "default"}>
          <Plus className="h-4 w-4 mr-1" />
          {tipo === "pagar" ? "Nova conta a pagar" : "Novo recebível"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{tipo === "pagar" ? "Nova conta a pagar" : "Novo recebível"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {tipo === "pagar" ? (
            <>
              <div>
                <Label>Descrição</Label>
                <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div>
                <Label>Fornecedor</Label>
                <Input value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} />
              </div>
            </>
          ) : (
            <div>
              <Label>Venda vinculada (opcional)</Label>
              <Select value={form.venda_id} onValueChange={(v) => setForm({ ...form, venda_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar venda..." /></SelectTrigger>
                <SelectContent>
                  {vendas.map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.clientes?.razao_social || "Cliente"} — {v.titulo || "Venda"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {(tipo === "pagar" ? CATEGORIAS_PAGAR : CATEGORIAS_RECEBER).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Vencimento</Label>
              <Input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">{tipo === "pagar" ? "Pago" : "Recebido"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {tipo === "receber" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Parcela</Label>
                <Input type="number" value={form.parcela} onChange={(e) => setForm({ ...form, parcela: e.target.value })} />
              </div>
              <div>
                <Label>Total parcelas</Label>
                <Input type="number" value={form.total_parcelas} onChange={(e) => setForm({ ...form, total_parcelas: e.target.value })} />
              </div>
            </div>
          )}
          <div>
            <Label>Observação</Label>
            <Textarea value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => criar.mutate()} disabled={criar.isPending || !form.valor}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
