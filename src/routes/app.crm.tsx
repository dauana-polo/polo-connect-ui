import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppTopbar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ETAPAS, formatBRL, type Etapa } from "@/lib/crm/constants";
import { LeadDrawer } from "@/components/crm/LeadDrawer";
import { NewLeadDialog } from "@/components/crm/NewLeadDialog";
import { MarcarGanhoDialog } from "@/components/crm/MarcarGanhoDialog";
import { Calendar, Search, User, TrendingUp, Trophy, AlertCircle, DollarSign, Mic2, ChevronDown, ChevronUp, Trophy as TrophyIcon } from "lucide-react";
import { toast } from "sonner";
import { Can } from "@/components/shared/Can";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { usePermissions } from "@/hooks/usePermissions";

export const Route = createFileRoute("/app/crm")({ component: CRM });

type Lead = {
  id: string; empresa: string; etapa: Etapa; tema_evento: string | null;
  data_pretendida: string | null; cidade_evento: string | null;
  orcamento_est: number | null; consultor_id: string | null; origem: string | null;
  created_at: string;
  consultor?: { id: string; nome: string } | null;
  cliente?: { nome_fantasia: string | null; razao_social: string | null } | null;
  proposta_palestrante?: string | null;
};

function CRM() {
  const qc = useQueryClient();
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [ganhoLeadId, setGanhoLeadId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroConsultor, setFiltroConsultor] = useState("all");
  const [filtroOrigem, setFiltroOrigem] = useState("all");
  const [filtroPeriodo, setFiltroPeriodo] = useState("all"); // all|7|30|90
  const [dragId, setDragId] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(ETAPAS[0].id);

  const { can } = usePermissions();
  const canEdit = can("crm", "edit");

  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id,empresa,etapa,tema_evento,data_pretendida,cidade_evento,orcamento_est,consultor_id,origem,created_at,cliente:clientes(nome_fantasia,razao_social),consultor:usuarios!leads_consultor_id_fkey(id,nome),propostas(proposta_palestrantes(palestrante:palestrantes(nome)))")
        .order("posicao");
      if (error) throw error;
      // Flatten first palestrante name from latest proposta
      return (data ?? []).map((l: any) => {
        const palestrantes = (l.propostas ?? [])
          .flatMap((p: any) => p.proposta_palestrantes ?? [])
          .map((pp: any) => pp.palestrante?.nome)
          .filter(Boolean);
        return { ...l, proposta_palestrante: palestrantes[0] ?? null };
      }) as Lead[];
    },
  });

  const { data: consultores = [] } = useQuery({
    queryKey: ["usuarios-consultores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id,nome")
        .in("perfil", ["admin", "gestor", "comercial"])
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });

  const mover = useMutation({
    mutationFn: async ({ id, etapa }: { id: string; etapa: Etapa }) => {
      const payload: any = { etapa };
      if (etapa === "perdido") {
        const motivo = window.prompt("Motivo da perda?");
        if (!motivo) throw new Error("cancelado");
        payload.motivo_perda = motivo;
      }
      const { error } = await supabase.from("leads").update(payload).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, etapa }) => {
      await qc.cancelQueries({ queryKey: ["leads"] });
      const prev = qc.getQueryData<Lead[]>(["leads"]);
      qc.setQueryData<Lead[]>(["leads"], (old) =>
        (old ?? []).map((l) => (l.id === id ? { ...l, etapa } : l)),
      );
      return { prev };
    },
    onError: (e: any, _v, ctx) => {
      qc.setQueryData(["leads"], ctx?.prev);
      if (e.message !== "cancelado") toast.error(e.message ?? "Erro ao mover");
    },
    onSuccess: () => { toast.success("Etapa atualizada"); qc.invalidateQueries({ queryKey: ["leads"] }); },
  });

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    const cutoff = filtroPeriodo === "all" ? null : Date.now() - Number(filtroPeriodo) * 86400000;
    return leads.filter((l) => {
      if (q && !([l.empresa, l.tema_evento, l.cidade_evento, l.consultor?.nome].filter(Boolean).join(" ").toLowerCase().includes(q))) return false;
      if (filtroConsultor !== "all" && l.consultor_id !== filtroConsultor) return false;
      if (filtroOrigem !== "all" && l.origem !== filtroOrigem) return false;
      if (cutoff && new Date(l.created_at).getTime() < cutoff) return false;
      return true;
    });
  }, [leads, busca, filtroConsultor, filtroOrigem, filtroPeriodo]);

  const kpis = useMemo(() => {
    const ganhos = leads.filter((l) => l.etapa === "ganho");
    const perdidos = leads.filter((l) => l.etapa === "perdido");
    const negociando = leads.filter((l) => !["ganho", "perdido"].includes(l.etapa));
    const valorNeg = negociando.reduce((s, l) => s + (l.orcamento_est ?? 0), 0);
    const valorGanho = ganhos.reduce((s, l) => s + (l.orcamento_est ?? 0), 0);
    const total = ganhos.length + perdidos.length;
    const taxa = total > 0 ? (ganhos.length / total) * 100 : 0;
    const ticket = ganhos.length > 0 ? valorGanho / ganhos.length : 0;
    return { leads: leads.length, ganhos: ganhos.length, perdidos: perdidos.length, valorNeg, valorGanho, taxa, ticket, negociando: negociando.length };
  }, [leads]);

  const onDrop = (etapa: Etapa) => {
    if (dragId) {
      const lead = leads.find((l) => l.id === dragId);
      if (lead && lead.etapa !== etapa) mover.mutate({ id: dragId, etapa });
    }
    setDragId(null);
  };

  return (
    <>
      <AppTopbar title="CRM Comercial" breadcrumb={["Home", "CRM", "Pipeline"]} />
      <div className="p-4 md:p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Kpi icon={TrendingUp} label="Leads" value={kpis.leads.toString()} />
          <Kpi icon={User} label="Em negociação" value={kpis.negociando.toString()} />
          <Kpi icon={Trophy} label="Ganhos" value={kpis.ganhos.toString()} color="text-emerald-600" />
          <Kpi icon={AlertCircle} label="Perdidos" value={kpis.perdidos.toString()} color="text-rose-600" />
          <Kpi icon={TrendingUp} label="Conversão" value={`${kpis.taxa.toFixed(0)}%`} />
          <Kpi icon={DollarSign} label="Em negociação" value={formatBRL(kpis.valorNeg)} />
          <Kpi icon={DollarSign} label="Ticket médio" value={formatBRL(kpis.ticket)} color="text-emerald-600" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 lg:max-w-3xl">
            <div className="col-span-2 sm:col-span-1 flex items-center gap-2 h-10 px-3 rounded-lg border bg-card">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input className="flex-1 bg-transparent outline-none text-sm min-w-0" placeholder="Buscar…" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroConsultor} onValueChange={setFiltroConsultor}>
              <SelectTrigger><SelectValue placeholder="Consultor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos consultores</SelectItem>
                {consultores.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
              <SelectTrigger><SelectValue placeholder="Origem" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas origens</SelectItem>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="indicacao">Indicação</SelectItem>
                <SelectItem value="ativo">Prospecção</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
              <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sempre</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Can resource="crm" action="edit"><NewLeadDialog /></Can>
        </div>

        {isLoading && <LoadingState label="Carregando leads…" />}
        {error && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

        {!isLoading && !error && (<>
        {/* Mobile: accordion list. Desktop: kanban grid */}
        <div className="md:hidden space-y-2">
          {ETAPAS.map((stage) => {
            const stageLeads = filtrados.filter((l) => l.etapa === stage.id);
            const total = stageLeads.reduce((s, l) => s + (l.orcamento_est ?? 0), 0);
            const expanded = expandedStage === stage.id;
            return (
              <div key={stage.id} className="rounded-xl border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedStage(expanded ? null : stage.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full ${stage.cor} shrink-0`} />
                    <h3 className="text-xs font-semibold uppercase tracking-wider truncate">{stage.titulo}</h3>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{stageLeads.length}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-medium">{formatBRL(total)}</span>
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                {expanded && (
                  <div className="p-3 pt-0 space-y-2">
                    {stageLeads.map((l) => (
                      <LeadCard key={l.id} l={l} onOpen={() => setOpenLeadId(l.id)} onGanho={() => setGanhoLeadId(l.id)} />
                    ))}
                    {stageLeads.length === 0 && <div className="text-[11px] text-muted-foreground text-center py-3 italic">—</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-9 gap-3">
          {ETAPAS.map((stage) => {
            const stageLeads = filtrados.filter((l) => l.etapa === stage.id);
            const total = stageLeads.reduce((s, l) => s + (l.orcamento_est ?? 0), 0);
            return (
              <div
                key={stage.id}
                className="bg-muted/40 rounded-xl p-3 min-h-[500px] transition-colors"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("bg-primary/10"); }}
                onDragLeave={(e) => e.currentTarget.classList.remove("bg-primary/10")}
                onDrop={(e) => { e.currentTarget.classList.remove("bg-primary/10"); onDrop(stage.id); }}
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full ${stage.cor} shrink-0`} />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider truncate">{stage.titulo}</h3>
                  </div>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{stageLeads.length}</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground px-1 mb-2 font-medium">{formatBRL(total)}</div>
                <div className="space-y-2">
                  {stageLeads.map((l) => (
                    <div
                      key={l.id}
                      draggable
                      onDragStart={() => setDragId(l.id)}
                      onDragEnd={() => setDragId(null)}
                      className={`${dragId === l.id ? "opacity-40" : ""}`}
                    >
                      <LeadCard l={l} onOpen={() => setOpenLeadId(l.id)} onGanho={() => setGanhoLeadId(l.id)} />
                    </div>
                  ))}
                  {stageLeads.length === 0 && <div className="text-[11px] text-muted-foreground text-center py-4 italic">—</div>}
                </div>
              </div>
            );
          })}
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Carregando…</div>}
      </div>

      <LeadDrawer leadId={openLeadId} onClose={() => setOpenLeadId(null)} />
      {ganhoLeadId && (
        <MarcarGanhoDialogWrapper
          leadId={ganhoLeadId}
          onClose={() => setGanhoLeadId(null)}
        />
      )}
    </>
  );
}

function LeadCard({ l, onOpen, onGanho }: { l: Lead; onOpen: () => void; onGanho: () => void }) {
  return (
    <div className="w-full text-left bg-card rounded-lg p-3 border border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing">
      <button onClick={onOpen} className="w-full text-left">
        <div className="font-medium text-sm leading-tight">{l.empresa}</div>
        {l.tema_evento && <div className="text-xs text-muted-foreground mt-0.5 truncate">{l.tema_evento}</div>}
        <div className="mt-2 text-sm font-semibold text-emerald-600">{formatBRL(l.orcamento_est)}</div>
        <div className="mt-2 pt-2 border-t border-border space-y-1">
          {l.proposta_palestrante && (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Mic2 className="h-3 w-3" />{l.proposta_palestrante}
            </div>
          )}
          {l.consultor?.nome && (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <User className="h-3 w-3" />{l.consultor.nome}
            </div>
          )}
          {l.data_pretendida && (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />{new Date(l.data_pretendida).toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>
      </button>
      {l.etapa === "negociacao" && (
        <Button
          size="sm"
          className="w-full mt-2 h-7 bg-emerald-600 hover:bg-emerald-700 text-xs"
          onClick={(e) => { e.stopPropagation(); onGanho(); }}
        >
          <TrophyIcon className="h-3 w-3 mr-1" /> Marcar Ganho
        </Button>
      )}
    </div>
  );
}

function MarcarGanhoDialogWrapper({ leadId, onClose }: { leadId: string; onClose: () => void }) {
  const { data: lead } = useQuery({
    queryKey: ["lead-min", leadId],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("id", leadId).single();
      if (error) throw error;
      return data;
    },
  });
  if (!lead) return null;
  return (
    <MarcarGanhoDialog
      lead={lead}
      trigger={null as any}
      open={true}
      onOpenChange={(v) => { if (!v) onClose(); }}
    />
  );
}

function Kpi({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3 w-3" />{label}
        </div>
        <div className={`font-semibold mt-1 text-sm ${color ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
