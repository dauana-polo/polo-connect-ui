import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBRL } from "@/lib/crm/constants";
import { Download, FileSignature, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/juridico")({
  component: Juridico,
});

const statusCor: Record<string, string> = {
  rascunho: "bg-slate-500",
  enviado: "bg-blue-500",
  assinado: "bg-emerald-500",
  arquivado: "bg-zinc-500",
};

const modelos = [
  { id: "padrao", nome: "Contrato Padrão", desc: "Eventos nacionais, palestrante PJ" },
  { id: "corporativo", nome: "Corporativo", desc: "Grandes empresas, cláusulas estendidas" },
  { id: "exclusivo", nome: "Exclusivo", desc: "Exclusividade temporal e setorial" },
  { id: "internacional", nome: "Internacional", desc: "Bilíngue, foro internacional" },
] as const;

type ContratoRow = {
  id: string;
  numero: string | null;
  modelo: string | null;
  status: string;
  data_geracao: string;
  conteudo: string | null;
  venda: {
    id: string;
    titulo: string;
    valor_total: number;
    data_evento: string | null;
    cliente: { razao_social: string; nome_fantasia: string | null } | null;
    palestrante: { nome: string } | null;
  } | null;
};

function Juridico() {
  const qc = useQueryClient();
  const [viewId, setViewId] = useState<string | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);
  const [vendaId, setVendaId] = useState("");
  const [modeloSel, setModeloSel] = useState<string>("padrao");

  const { data: contratos = [], isLoading } = useQuery({
    queryKey: ["contratos-lista"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select(
          "id,numero,modelo,status,data_geracao,conteudo,venda:vendas(id,titulo,valor_total,data_evento,cliente:clientes(razao_social,nome_fantasia),palestrante:palestrantes(nome))",
        )
        .order("data_geracao", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ContratoRow[];
    },
  });

  // Vendas that don't have a contrato yet
  const { data: vendasSemContrato = [] } = useQuery({
    queryKey: ["vendas-sem-contrato"],
    enabled: novoOpen,
    queryFn: async () => {
      const { data: vendas, error } = await supabase
        .from("vendas")
        .select(
          "id,titulo,valor_total,data_evento,empresa_polo_id,cliente:clientes(razao_social,nome_fantasia),palestrante:palestrantes(nome)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      const { data: existentes, error: e2 } = await supabase.from("contratos").select("venda_id");
      if (e2) throw e2;
      const comContrato = new Set((existentes ?? []).map((c: any) => c.venda_id));
      return (vendas ?? []).filter((v: any) => !comContrato.has(v.id));
    },
  });

  const vendaSelecionada = vendasSemContrato.find((v: any) => v.id === vendaId) ?? null;

  const criar = useMutation({
    mutationFn: async () => {
      if (!vendaSelecionada) throw new Error("Selecione uma venda");
      const conteudo = gerarConteudo(vendaSelecionada, modeloSel);
      const { error } = await supabase.from("contratos").insert({
        venda_id: vendaSelecionada.id,
        empresa_polo_id: vendaSelecionada.empresa_polo_id,
        modelo: modeloSel,
        conteudo,
        status: "rascunho",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contrato criado — numeração gerada automaticamente pelo banco");
      setNovoOpen(false);
      setVendaId("");
      qc.invalidateQueries({ queryKey: ["contratos-lista"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: any = { status };
      if (status === "enviado") patch.data_envio = new Date().toISOString();
      if (status === "assinado") {
        patch.data_assinatura = new Date().toISOString();
        patch.assinado_cliente_em = new Date().toISOString();
        patch.assinado_polo_em = new Date().toISOString();
      }
      const { error } = await supabase.from("contratos").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["contratos-lista"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const contratoView = contratos.find((c) => c.id === viewId) ?? null;

  const baixarPdf = async (c: ContratoRow) => {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = document.createElement("div");
    el.innerHTML = `<div style="font-family:Inter,system-ui,sans-serif;padding:40px;color:#0f172a;white-space:pre-wrap;">${(c.conteudo ?? "").replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]!))}</div>`;
    document.body.appendChild(el);
    await (html2pdf() as any)
      .from(el)
      .set({ filename: `contrato-${c.numero ?? c.id}.pdf`, jsPDF: { unit: "mm", format: "a4" } })
      .save();
    document.body.removeChild(el);
  };

  return (
    <>
      <AppTopbar title="Jurídico" breadcrumb={["Home", "Jurídico", "Contratos"]} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {modelos.map((m) => (
            <Card key={m.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
                  <FileSignature className="h-5 w-5 text-primary" />
                </div>
                <div className="font-semibold text-sm">{m.nome}</div>
                <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setNovoOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Contrato
          </Button>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Número</th>
                  <th className="text-left px-2 py-3 font-medium">Cliente</th>
                  <th className="text-left px-2 py-3 font-medium">Modelo</th>
                  <th className="text-right px-2 py-3 font-medium">Valor</th>
                  <th className="text-left px-2 py-3 font-medium">Gerado em</th>
                  <th className="text-left px-2 py-3 font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{c.numero ?? "—"}</td>
                    <td className="px-2 py-3 font-medium">
                      {c.venda?.cliente?.nome_fantasia || c.venda?.cliente?.razao_social || "—"}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground capitalize">{c.modelo}</td>
                    <td className="px-2 py-3 text-right font-semibold">{formatBRL(c.venda?.valor_total)}</td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {new Date(c.data_geracao).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-2 py-3">
                      <Badge className={`${statusCor[c.status] ?? "bg-slate-500"} text-white hover:${statusCor[c.status] ?? "bg-slate-500"}`}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setViewId(c.id)}>
                        Visualizar
                      </Button>
                    </td>
                  </tr>
                ))}
                {!isLoading && contratos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">
                      Nenhum contrato ainda. Crie um a partir de uma venda fechada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo contrato</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Venda</div>
              <Select value={vendaId} onValueChange={setVendaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma venda sem contrato" />
                </SelectTrigger>
                <SelectContent>
                  {vendasSemContrato.map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.cliente?.nome_fantasia || v.cliente?.razao_social || "—"} — {v.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {vendasSemContrato.length === 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Todas as vendas já têm contrato, ou nenhuma venda foi criada ainda.
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Modelo</div>
              <Select value={modeloSel} onValueChange={setModeloSel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => criar.mutate()} disabled={criar.isPending || !vendaSelecionada}>
              {criar.isPending ? "Criando…" : "Criar contrato"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!contratoView} onOpenChange={(v) => !v && setViewId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contrato {contratoView?.numero}</DialogTitle>
          </DialogHeader>
          {contratoView && (
            <>
              <div className="bg-white border rounded-lg p-10 max-h-[60vh] overflow-y-auto shadow-inner space-y-5 text-sm whitespace-pre-wrap text-slate-800">
                {contratoView.conteudo}
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  {contratoView.status === "rascunho" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => atualizarStatus.mutate({ id: contratoView.id, status: "enviado" })}
                    >
                      Marcar enviado
                    </Button>
                  )}
                  {contratoView.status === "enviado" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => atualizarStatus.mutate({ id: contratoView.id, status: "assinado" })}
                    >
                      Marcar assinado
                    </Button>
                  )}
                  {contratoView.status !== "arquivado" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => atualizarStatus.mutate({ id: contratoView.id, status: "arquivado" })}
                    >
                      Arquivar
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => baixarPdf(contratoView)}>
                  <Download className="h-4 w-4 mr-1.5" />
                  Baixar PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function gerarConteudo(venda: any, modelo: string): string {
  const cliente = venda.cliente?.nome_fantasia || venda.cliente?.razao_social || "Cliente";
  const palestrante = venda.palestrante?.nome ?? "Palestrante";
  const data = venda.data_evento ? new Date(venda.data_evento).toLocaleDateString("pt-BR") : "a definir";
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS (modelo: ${modelo})

CONTRATANTE: ${cliente}
CONTRATADA: Polo Palestrantes

Cláusula 1ª — Objeto
Prestação de serviços de palestra pelo profissional ${palestrante} no evento "${venda.titulo}", em ${data}.

Cláusula 2ª — Valor
${formatBRL(venda.valor_total)}, conforme condições comerciais acordadas entre as partes.

_____________________________          _____________________________
CONTRATANTE                             CONTRATADA`;
}
