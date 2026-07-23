import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewBusinessWizard } from "@/components/crm/NewBusinessWizard";
import { GerarSugestaoPDF } from "@/components/crm/GerarSugestaoPDF";
import { formatBRL } from "@/lib/crm/constants";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Can } from "@/components/shared/Can";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { usePermissions } from "@/hooks/usePermissions";

export const Route = createFileRoute("/app/propostas")({
  component: Propostas,
});

const statusColor: Record<string, string> = {
  rascunho: "bg-slate-500",
  enviada: "bg-blue-500",
  visualizada: "bg-indigo-500",
  aprovada: "bg-emerald-500",
  recusada: "bg-rose-500",
};

const statusLabel: Record<string, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  visualizada: "Visualizada",
  aprovada: "Aprovada",
  recusada: "Recusada",
};

type PropostaRow = {
  id: string;
  titulo: string;
  status: string;
  valor_total: number | null;
  created_at: string;
  cliente: { razao_social: string; nome_fantasia: string | null } | null;
  lead: { empresa: string } | null;
  consultor: { nome: string } | null;
  proposta_palestrantes: { palestrante: { nome: string; foto_url: string | null; bio: string | null } | null }[];
};

function Propostas() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("lista");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string>("");
  const [wizardOpen, setWizardOpen] = useState(false);

  const { data: propostas = [], isLoading } = useQuery({
    queryKey: ["propostas-lista"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("propostas")
        .select(
          "id,titulo,status,valor_total,created_at,cliente:clientes(razao_social,nome_fantasia),lead:leads(empresa),consultor:usuarios(nome),proposta_palestrantes(palestrante:palestrantes(nome,foto_url,bio))",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PropostaRow[];
    },
  });

  const { data: leadsAbertos = [] } = useQuery({
    queryKey: ["leads-para-proposta"],
    enabled: tab === "nova",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(
          "id,empresa,cliente_id,consultor_id,etapa,tema_evento,data_pretendida,cidade_evento,formato,publico_estimado,descricao,orcamento_est",
        )
        .not("etapa", "in", "(ganho,perdido)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const leadSelecionado = leadsAbertos.find((l: any) => l.id === leadId) ?? null;

  const previewData = useMemo(() => {
    if (previewId) return propostas.find((p) => p.id === previewId) ?? null;
    return propostas[0] ?? null;
  }, [propostas, previewId]);

  return (
    <>
      <AppTopbar title="Propostas" breadcrumb={["Home", "Comercial", "Propostas"]} />
      <div className="p-6">
        <Tabs value={tab} onValueChange={setTab} className="space-y-5">
          <TabsList>
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="nova">Nova Proposta</TabsTrigger>
            <TabsTrigger value="preview">Preview PDF</TabsTrigger>
          </TabsList>

          <TabsContent value="lista">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-5 py-3">Título</th>
                      <th className="text-left font-medium px-2 py-3">Cliente / Lead</th>
                      <th className="text-left font-medium px-2 py-3">Palestrantes</th>
                      <th className="text-right font-medium px-2 py-3">Valor</th>
                      <th className="text-left font-medium px-2 py-3">Criada em</th>
                      <th className="text-left font-medium px-2 py-3">Consultor</th>
                      <th className="text-left font-medium px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propostas.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t hover:bg-muted/30 cursor-pointer"
                        onClick={() => {
                          setPreviewId(p.id);
                          setTab("preview");
                        }}
                      >
                        <td className="px-5 py-3 font-medium">{p.titulo}</td>
                        <td className="px-2 py-3">
                          {p.cliente?.nome_fantasia || p.cliente?.razao_social || p.lead?.empresa || "—"}
                        </td>
                        <td className="px-2 py-3 text-muted-foreground">
                          {p.proposta_palestrantes.map((pp) => pp.palestrante?.nome).filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="px-2 py-3 text-right font-semibold">{formatBRL(p.valor_total)}</td>
                        <td className="px-2 py-3 text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-2 py-3 text-muted-foreground">{p.consultor?.nome ?? "—"}</td>
                        <td className="px-5 py-3">
                          <Badge
                            className={`${statusColor[p.status] ?? "bg-slate-500"} text-white hover:${statusColor[p.status] ?? "bg-slate-500"}`}
                          >
                            {statusLabel[p.status] ?? p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && propostas.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">
                          Nenhuma proposta ainda. Crie uma na aba "Nova Proposta".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nova">
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Selecione o lead / oportunidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Toda proposta parte de um lead em aberto no CRM — assim os palestrantes sugeridos ficam
                  automaticamente ligados ao histórico daquela oportunidade.
                </p>
                <Select
                  value={leadId}
                  onValueChange={(v) => {
                    setLeadId(v);
                    setWizardOpen(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um lead em aberto…" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadsAbertos.map((l: any) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.empresa} {l.tema_evento ? `— ${l.tema_evento}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {leadsAbertos.length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    Nenhum lead em aberto no CRM. Crie um lead primeiro na aba de CRM.
                  </div>
                )}
                {leadSelecionado && (
                  <Button className="w-full" onClick={() => setWizardOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" /> Montar proposta para {leadSelecionado.empresa}
                  </Button>
                )}
              </CardContent>
            </Card>
            {leadSelecionado && (
              <NewBusinessWizard
                lead={leadSelecionado}
                trigger={null}
                open={wizardOpen}
                onOpenChange={setWizardOpen}
                onCreated={() => {
                  qc.invalidateQueries({ queryKey: ["propostas-lista"] });
                  setTab("lista");
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="preview">
            {!previewData ? (
              <div className="text-sm text-muted-foreground text-center py-10">
                Nenhuma proposta disponível ainda.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  <Select value={previewData.id} onValueChange={setPreviewId}>
                    <SelectTrigger className="w-72">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propostas.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <GerarSugestaoPDF propostaId={previewData.id} />
                </div>
                <div className="flex justify-center">
                  <Card className="max-w-2xl w-full shadow-xl">
                    <CardContent className="p-12 space-y-8">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider">
                            Proposta Comercial
                          </div>
                          <div className="font-mono text-sm mt-1">{previewData.titulo}</div>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {previewData.cliente?.nome_fantasia ||
                            previewData.cliente?.razao_social ||
                            previewData.lead?.empresa ||
                            "Cliente"}
                        </h2>
                        <p className="text-muted-foreground">
                          Status: {statusLabel[previewData.status] ?? previewData.status}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Palestrantes
                        </h3>
                        {previewData.proposta_palestrantes.length === 0 && (
                          <div className="text-sm text-muted-foreground">Nenhum palestrante nesta proposta.</div>
                        )}
                        {previewData.proposta_palestrantes.map((pp, i) => (
                          <div key={i} className="flex gap-4 p-4 rounded-lg border">
                            {pp.palestrante?.foto_url ? (
                              <img src={pp.palestrante.foto_url} className="h-16 w-16 rounded-full object-cover" alt="" />
                            ) : (
                              <div className="h-16 w-16 rounded-full bg-muted grid place-items-center font-semibold">
                                {pp.palestrante?.nome?.[0] ?? "?"}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-semibold">{pp.palestrante?.nome}</div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{pp.palestrante?.bio}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-sm font-medium">Valor total</span>
                        <span className="text-2xl font-bold">{formatBRL(previewData.valor_total)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
