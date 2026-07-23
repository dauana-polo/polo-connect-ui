import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ETAPAS, ETAPA_LABEL, STATUS_RECOMENDACAO, TIPOS_ATIVIDADE, formatBRL, type Etapa,
} from "@/lib/crm/constants";
import { NewBusinessWizard } from "./NewBusinessWizard";
import { GerarSugestaoPDF } from "./GerarSugestaoPDF";
import { MarcarGanhoDialog } from "./MarcarGanhoDialog";
import { Can } from "@/components/shared/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { requiredString, optionalEmail, phoneSchema, isoDateSchema } from "@/lib/validators";
import {
  Trash2, Plus, Phone, Mail, MessageSquare, Calendar, CheckCircle2,
  Clock, ArrowRight, AlertTriangle, FileText,
} from "lucide-react";

type Lead = any;

export function LeadDrawer({ leadId, onClose }: { leadId: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const open = !!leadId;

  const { can } = usePermissions();
  const canEdit = can("crm", "edit");

  const { data: lead } = useQuery({
    queryKey: ["lead", leadId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, cliente:clientes(id,razao_social,nome_fantasia), consultor:usuarios!leads_consultor_id_fkey(id,nome)")
        .eq("id", leadId!)
        .single();
      if (error) throw error;
      return data as Lead;
    },
  });

  const moverEtapa = useMutation({
    mutationFn: async (etapa: Etapa) => {
      const payload: any = { etapa };
      if (etapa === "perdido") {
        const motivo = window.prompt("Motivo da perda?");
        if (!motivo) throw new Error("Motivo obrigatório");
        payload.motivo_perda = motivo;
      }
      if (etapa === "ganho") {
        if (!window.confirm("Marcar como GANHO criará automaticamente a venda e os cards nos Kanbans operacionais. Continuar?")) {
          throw new Error("Cancelado");
        }
      }
      const { error } = await supabase.from("leads").update(payload).eq("id", leadId!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Etapa atualizada");
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
      qc.invalidateQueries({ queryKey: ["lead-historico", leadId] });
      qc.invalidateQueries({ queryKey: ["lead-atividades", leadId] });
    },
    onError: (e: any) => e.message !== "Cancelado" && toast.error(e.message ?? "Erro ao mover"),
  });

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        {!lead ? (
          <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <>
            <SheetHeader className="p-6 border-b">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <SheetTitle className="text-xl">{lead.empresa}</SheetTitle>
                  <div className="text-sm text-muted-foreground mt-0.5 truncate">{lead.tema_evento ?? "—"}</div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{ETAPA_LABEL[lead.etapa as Etapa]}</Badge>
                    {lead.consultor?.nome && <span className="text-xs text-muted-foreground">Resp.: {lead.consultor.nome}</span>}
                  </div>
                </div>
                <Select value={lead.etapa} disabled={!canEdit} onValueChange={(v) => moverEtapa.mutate(v as Etapa)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ETAPAS.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.titulo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Can resource="crm" action="edit">
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <NewBusinessWizard lead={lead} />
                  {lead.etapa === "negociacao" && <MarcarGanhoDialog lead={lead} />}
                </div>
              </Can>
            </SheetHeader>

            <Tabs defaultValue="detalhes" className="px-6 py-4">
              <TabsList className="grid w-full grid-cols-7 h-auto">
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="recomendacoes">Recom.</TabsTrigger>
                <TabsTrigger value="consultas">Consultas</TabsTrigger>
                <TabsTrigger value="propostas">Propostas</TabsTrigger>
                <TabsTrigger value="atividades">Atividades</TabsTrigger>
                <TabsTrigger value="comentarios">Coment.</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="detalhes"><TabDetalhes lead={lead} /></TabsContent>
              <TabsContent value="recomendacoes"><TabRecomendacoes leadId={lead.id} /></TabsContent>
              <TabsContent value="consultas"><TabConsultas leadId={lead.id} /></TabsContent>
              <TabsContent value="propostas"><TabPropostas lead={lead} /></TabsContent>
              <TabsContent value="atividades"><TabAtividades leadId={lead.id} /></TabsContent>
              <TabsContent value="comentarios"><TabComentarios leadId={lead.id} /></TabsContent>
              <TabsContent value="timeline"><TabTimeline leadId={lead.id} /></TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ============ Tab: Detalhes ============ */
const detalhesSchema = z.object({
  empresa: requiredString("Empresa"),
  contato_nome: z.string().trim().optional(),
  contato_email: optionalEmail,
  contato_tel: phoneSchema.optional().or(z.literal("")),
  tema_evento: z.string().trim().optional(),
  data_pretendida: isoDateSchema.optional().or(z.literal("")),
  cidade_evento: z.string().trim().optional(),
  formato: z.string().trim().optional(),
  publico_estimado: z.string().trim().optional(),
  orcamento_est: z.string().trim().optional(),
  orcamento_min: z.string().trim().optional(),
  orcamento_max: z.string().trim().optional(),
  objetivo: z.string().trim().optional(),
  descricao: z.string().trim().optional(),
});
type DetalhesForm = z.infer<typeof detalhesSchema>;

function TabDetalhes({ lead }: { lead: Lead }) {
  const qc = useQueryClient();
  const { can } = usePermissions();
  const canEdit = can("crm", "edit");

  const form = useForm<DetalhesForm>({
    resolver: zodResolver(detalhesSchema),
    defaultValues: {
      empresa: lead.empresa ?? "",
      contato_nome: lead.contato_nome ?? "",
      contato_email: lead.contato_email ?? "",
      contato_tel: lead.contato_tel ?? "",
      tema_evento: lead.tema_evento ?? "",
      data_pretendida: lead.data_pretendida ?? "",
      cidade_evento: lead.cidade_evento ?? "",
      formato: lead.formato ?? "",
      publico_estimado: lead.publico_estimado != null ? String(lead.publico_estimado) : "",
      orcamento_est: lead.orcamento_est != null ? String(lead.orcamento_est) : "",
      orcamento_min: lead.orcamento_min != null ? String(lead.orcamento_min) : "",
      orcamento_max: lead.orcamento_max != null ? String(lead.orcamento_max) : "",
      objetivo: lead.objetivo ?? "",
      descricao: lead.descricao ?? "",
    },
  });
  const errors = form.formState.errors;

  const salvar = useMutation({
    mutationFn: async (values: DetalhesForm) => {
      const payload: any = { ...values };
      (["publico_estimado", "orcamento_est", "orcamento_min", "orcamento_max"] as const).forEach((k) => {
        payload[k] = payload[k] === "" || payload[k] == null ? null : Number(payload[k]);
      });
      if (!payload.data_pretendida) payload.data_pretendida = null;
      if (!payload.formato) payload.formato = null;
      const { error } = await supabase.from("leads").update(payload).eq("id", lead.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Salvo");
      qc.invalidateQueries({ queryKey: ["lead", lead.id] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const field = (k: keyof DetalhesForm, label: string, type = "text") => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type={type} disabled={!canEdit} {...form.register(k)} />
      {errors[k] && <p className="text-[11px] text-rose-500">{errors[k]?.message as string}</p>}
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit((v) => salvar.mutate(v))} className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        {field("empresa", "Empresa")}
        {field("contato_nome", "Contato")}
        {field("contato_email", "E-mail", "email")}
        {field("contato_tel", "Telefone")}
        {field("tema_evento", "Tema")}
        {field("objetivo", "Objetivo")}
        {field("data_pretendida", "Data do evento", "date")}
        {field("cidade_evento", "Cidade")}
        <div className="space-y-1">
          <Label className="text-xs">Formato</Label>
          <Select value={form.watch("formato") ?? ""} disabled={!canEdit} onValueChange={(v) => form.setValue("formato", v, { shouldDirty: true })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {field("publico_estimado", "Público estimado", "number")}
        {field("orcamento_min", "Orçamento mín", "number")}
        {field("orcamento_max", "Orçamento máx", "number")}
        {field("orcamento_est", "Orçamento est.", "number")}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Descrição</Label>
        <Textarea disabled={!canEdit} {...form.register("descricao")} rows={3} />
      </div>
      <Can resource="crm" action="edit">
        <Button type="submit" disabled={salvar.isPending}>Salvar</Button>
      </Can>
    </form>
  );
}

/* ============ Tab: Recomendações ============ */
function TabRecomendacoes({ leadId }: { leadId: string }) {
  const qc = useQueryClient();
  const { data: recs = [] } = useQuery({
    queryKey: ["lead-recs", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_palestrante_recomendacoes")
        .select("*, palestrante:palestrantes(id,nome,cache_padrao)")
        .eq("lead_id", leadId)
        .order("ordem");
      if (error) throw error;
      return data as any[];
    },
  });

  const [busca, setBusca] = useState("");
  const { data: palestrantes = [] } = useQuery({
    queryKey: ["palestrantes-busca", busca],
    queryFn: async () => {
      let q = supabase.from("palestrantes").select("id,nome,cache_padrao").limit(10);
      if (busca) q = q.ilike("nome", `%${busca}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });

  const add = useMutation({
    mutationFn: async (p: any) => {
      const { error } = await supabase.from("lead_palestrante_recomendacoes").insert({
        lead_id: leadId, palestrante_id: p.id, cache_proposto: p.cache_padrao, ordem: recs.length,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lead-recs", leadId] }); qc.invalidateQueries({ queryKey: ["lead-historico", leadId] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: async ({ id, patch }: any) => {
      const { error } = await supabase.from("lead_palestrante_recomendacoes").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead-recs", leadId] }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lead_palestrante_recomendacoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lead-recs", leadId] }); qc.invalidateQueries({ queryKey: ["lead-historico", leadId] }); },
  });

  return (
    <div className="space-y-3 pt-2">
      <div className="rounded-lg border p-3 space-y-2">
        <Label className="text-xs">Adicionar palestrante</Label>
        <Input placeholder="Buscar por nome…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        {busca && (
          <div className="max-h-40 overflow-auto rounded border divide-y">
            {palestrantes.map((p) => (
              <button key={p.id} onClick={() => { add.mutate(p); setBusca(""); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between">
                <span>{p.nome}</span>
                <span className="text-muted-foreground">{formatBRL(p.cache_padrao)}</span>
              </button>
            ))}
            {palestrantes.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">Nenhum resultado</div>}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {recs.map((r) => (
          <div key={r.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{r.palestrante?.nome}</div>
              <Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" value={r.cache_proposto ?? ""} onBlur={(e) => update.mutate({ id: r.id, patch: { cache_proposto: e.target.value ? Number(e.target.value) : null } })}
                onChange={() => {}} defaultValue={r.cache_proposto ?? ""} placeholder="Cachê" />
              <Select value={r.status} onValueChange={(v) => update.mutate({ id: r.id, patch: { status: v } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_RECOMENDACAO.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Observações" defaultValue={r.observacoes ?? ""}
              onBlur={(e) => update.mutate({ id: r.id, patch: { observacoes: e.target.value } })} rows={2} />
          </div>
        ))}
        {recs.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Nenhum palestrante recomendado.</div>}
      </div>
    </div>
  );
}

/* ============ Tab: Consultas ============ */
function TabConsultas({ leadId }: { leadId: string }) {
  const qc = useQueryClient();
  const { data: recs = [] } = useQuery({
    queryKey: ["lead-recs", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_palestrante_recomendacoes")
        .select("*, palestrante:palestrantes(id,nome)")
        .eq("lead_id", leadId).order("ordem");
      if (error) throw error;
      return data as any[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: any) => {
      const { error } = await supabase.from("lead_palestrante_recomendacoes")
        .update({ status, disponibilidade_verificada_em: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead-recs", leadId] }),
  });

  return (
    <div className="space-y-2 pt-2">
      {recs.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-6">
          Adicione palestrantes na aba <strong>Recomendações</strong> primeiro.
        </div>
      )}
      {recs.map((r) => (
        <div key={r.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
          <div>
            <div className="font-medium text-sm">{r.palestrante?.nome}</div>
            <div className="text-xs text-muted-foreground">Status: {STATUS_RECOMENDACAO.find((s) => s.id === r.status)?.label}</div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: r.id, status: "consultado" })}>Consultar</Button>
            <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => setStatus.mutate({ id: r.id, status: "disponivel" })}>Disponível</Button>
            <Button size="sm" variant="outline" className="text-rose-600" onClick={() => setStatus.mutate({ id: r.id, status: "indisponivel" })}>Indisponível</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============ Tab: Propostas ============ */
function TabPropostas({ lead }: { lead: Lead }) {
  const qc = useQueryClient();
  const leadId = lead.id;

  const { data: recs = [] } = useQuery({
    queryKey: ["lead-recs", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_palestrante_recomendacoes")
        .select("*, palestrante:palestrantes(id,nome)")
        .eq("lead_id", leadId).order("ordem");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: propostas = [] } = useQuery({
    queryKey: ["lead-propostas", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("propostas")
        .select("*, proposta_palestrantes(*, palestrante:palestrantes(nome))")
        .eq("lead_id", leadId).order("versao", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [condicoes, setCondicoes] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});

  const criar = useMutation({
    mutationFn: async () => {
      const ids = Object.entries(selecionados).filter(([, v]) => v).map(([k]) => k);
      if (ids.length === 0) throw new Error("Selecione ao menos um palestrante recomendado.");
      const versao = (propostas[0]?.versao ?? 0) + 1;
      const { data: p, error } = await supabase.from("propostas").insert({
        lead_id: leadId, cliente_id: lead.cliente_id, consultor_id: lead.consultor_id,
        titulo: titulo || `Proposta v${versao} — ${lead.empresa}`,
        valor_total: valorTotal ? Number(valorTotal) : null,
        condicoes_comerciais: condicoes, observacoes, status: "rascunho", versao,
      }).select().single();
      if (error) throw error;
      const rows = ids.map((recId, i) => {
        const r = recs.find((x) => x.id === recId)!;
        return {
          proposta_id: p.id, recomendacao_id: r.id, palestrante_id: r.palestrante_id,
          cache_proposto: r.cache_proposto, ordem: i, selecionado: true,
        };
      });
      const { error: e2 } = await supabase.from("proposta_palestrantes").insert(rows);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Proposta criada");
      setOpen(false); setTitulo(""); setValorTotal(""); setCondicoes(""); setObservacoes(""); setSelecionados({});
      qc.invalidateQueries({ queryKey: ["lead-propostas", leadId] });
      qc.invalidateQueries({ queryKey: ["lead-historico", leadId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{propostas.length} proposta(s)</div>
        <Can resource="crm" action="edit">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={recs.length === 0}>
              <Plus className="h-4 w-4 mr-1.5" /> Nova proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova proposta</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Apenas palestrantes da lista de recomendações podem ser adicionados.
              </div>
              <div className="space-y-1"><Label className="text-xs">Título</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Label className="text-xs">Valor total</Label>
                  <Input type="number" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} /></div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Palestrantes</Label>
                <div className="rounded border divide-y max-h-40 overflow-auto">
                  {recs.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted">
                      <Checkbox checked={!!selecionados[r.id]} onCheckedChange={(v) => setSelecionados({ ...selecionados, [r.id]: !!v })} />
                      <span className="flex-1">{r.palestrante?.nome}</span>
                      <span className="text-xs text-muted-foreground">{formatBRL(r.cache_proposto)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Condições comerciais</Label>
                <Textarea rows={2} value={condicoes} onChange={(e) => setCondicoes(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Observações</Label>
                <Textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></div>
            </div>
            <DialogFooter><Button onClick={() => criar.mutate()} disabled={criar.isPending}>Criar proposta</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        </Can>
      </div>
      <div className="space-y-2">
        {propostas.map((p) => (
          <div key={p.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="font-medium text-sm">{p.titulo}</div>
                <Badge variant="outline">v{p.versao}</Badge>
                <Badge variant="secondary">{p.status}</Badge>
              </div>
              <div className="text-sm font-semibold">{formatBRL(p.valor_total)}</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {p.proposta_palestrantes?.map((pp: any) => pp.palestrante?.nome).filter(Boolean).join(" · ")}
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              <GerarSugestaoPDF propostaId={p.id} />
              {p.pdf_sugestao_url && <Badge variant="outline" className="text-[10px]">PDF gerado</Badge>}
            </div>
          </div>
        ))}
        {propostas.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Nenhuma proposta criada.</div>}
      </div>
    </div>
  );
}

/* ============ Tab: Atividades ============ */
function TabAtividades({ leadId }: { leadId: string }) {
  const qc = useQueryClient();
  const { data: ativ = [] } = useQuery({
    queryKey: ["lead-atividades", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_atividades").select("*")
        .eq("lead_id", leadId).order("concluida").order("prazo", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const [tipo, setTipo] = useState("tarefa");
  const [titulo, setTitulo] = useState("");
  const [prazo, setPrazo] = useState("");

  const criar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("crm_atividades").insert({
        lead_id: leadId, tipo, titulo, prazo: prazo || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { setTitulo(""); setPrazo(""); qc.invalidateQueries({ queryKey: ["lead-atividades", leadId] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: async (a: any) => {
      const { error } = await supabase.from("crm_atividades")
        .update({ concluida: !a.concluida, concluida_em: !a.concluida ? new Date().toISOString() : null })
        .eq("id", a.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead-atividades", leadId] }),
  });

  const icon = (t: string) => {
    if (t === "ligacao") return Phone;
    if (t === "email") return Mail;
    if (t === "whatsapp") return MessageSquare;
    if (t === "reuniao") return Calendar;
    if (t === "followup") return Clock;
    return CheckCircle2;
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="rounded-lg border p-3 space-y-2">
        <div className="grid grid-cols-[1fr_2fr_1fr_auto] gap-2">
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TIPOS_ATIVIDADE.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <Input type="datetime-local" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          <Button onClick={() => titulo && criar.mutate()} disabled={!titulo}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="space-y-1">
        {ativ.map((a) => {
          const Icon = icon(a.tipo);
          return (
            <div key={a.id} className={`flex items-center gap-2 rounded border px-3 py-2 ${a.concluida ? "bg-muted/50 text-muted-foreground" : ""}`}>
              <Checkbox checked={a.concluida} onCheckedChange={() => toggle.mutate(a)} />
              <Icon className="h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className={`text-sm truncate ${a.concluida ? "line-through" : ""}`}>{a.titulo}</div>
                {a.prazo && <div className="text-[11px] text-muted-foreground">Prazo: {new Date(a.prazo).toLocaleString("pt-BR")}</div>}
              </div>
              {a.automatica && <Badge variant="outline" className="text-[10px]">auto</Badge>}
            </div>
          );
        })}
        {ativ.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Nenhuma atividade.</div>}
      </div>
    </div>
  );
}

/* ============ Tab: Comentários ============ */
function TabComentarios({ leadId }: { leadId: string }) {
  const qc = useQueryClient();
  const { data: coms = [] } = useQuery({
    queryKey: ["lead-coms", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_comentarios").select("*, usuario:usuarios(nome)")
        .eq("lead_id", leadId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
  const [texto, setTexto] = useState("");
  const enviar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("crm_comentarios").insert({ lead_id: leadId, texto });
      if (error) throw error;
    },
    onSuccess: () => { setTexto(""); qc.invalidateQueries({ queryKey: ["lead-coms", leadId] }); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="space-y-3 pt-2">
      <div className="flex gap-2">
        <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Comentário interno…" rows={2} />
        <Button onClick={() => texto && enviar.mutate()} disabled={!texto}>Enviar</Button>
      </div>
      <div className="space-y-2">
        {coms.map((c) => (
          <div key={c.id} className="rounded border p-3">
            <div className="text-xs text-muted-foreground mb-1">
              {c.usuario?.nome ?? "—"} · {new Date(c.created_at).toLocaleString("pt-BR")}
            </div>
            <div className="text-sm whitespace-pre-wrap">{c.texto}</div>
          </div>
        ))}
        {coms.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Sem comentários.</div>}
      </div>
    </div>
  );
}

/* ============ Tab: Timeline ============ */
function TabTimeline({ leadId }: { leadId: string }) {
  const { data: hist = [] } = useQuery({
    queryKey: ["lead-historico", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_historico").select("*, usuario:usuarios(nome)")
        .eq("lead_id", leadId).order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data as any[];
    },
  });
  return (
    <div className="space-y-2 pt-2">
      {hist.map((h) => (
        <div key={h.id} className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-muted grid place-items-center shrink-0">
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="flex-1 border-b pb-2">
            <div className="text-sm">{h.descricao}</div>
            <div className="text-[11px] text-muted-foreground">
              {h.usuario?.nome ?? "Sistema"} · {new Date(h.created_at).toLocaleString("pt-BR")} · {h.tipo_evento}
            </div>
          </div>
        </div>
      ))}
      {hist.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Sem histórico.</div>}
    </div>
  );
}
