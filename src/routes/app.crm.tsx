import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppTopbar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ETAPAS, formatBRL, type Etapa } from "@/lib/crm/constants";
import { LeadDrawer } from "@/components/crm/LeadDrawer";
import { NewLeadDialog } from "@/components/crm/NewLeadDialog";
import { Calendar, Search, User, TrendingUp, Trophy, AlertCircle, DollarSign } from "lucide-react";

export const Route = createFileRoute("/app/crm")({ component: CRM });

type Lead = {
  id: string; empresa: string; etapa: Etapa; tema_evento: string | null;
  data_pretendida: string | null; cidade_evento: string | null;
  orcamento_est: number | null; consultor_id: string | null;
  consultor?: { nome: string } | null;
  cliente?: { nome_fantasia: string | null; razao_social: string | null } | null;
  created_at: string; updated_at: string; etapa_alterada_em: string | null;
  atividades_pendentes?: number;
};

function CRM() {
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id,empresa,etapa,tema_evento,data_pretendida,cidade_evento,orcamento_est,consultor_id,created_at,updated_at,etapa_alterada_em,cliente:clientes(nome_fantasia,razao_social),consultor:usuarios!leads_consultor_id_fkey(nome)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Lead[];
    },
  });

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.empresa, l.tema_evento, l.cidade_evento, l.consultor?.nome]
        .filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [leads, busca]);

  const kpis = useMemo(() => {
    const ganhos = leads.filter((l) => l.etapa === "ganho");
    const perdidos = leads.filter((l) => l.etapa === "perdido");
    const negociando = leads.filter((l) => !["ganho", "perdido"].includes(l.etapa));
    const valorNeg = negociando.reduce((s, l) => s + (l.orcamento_est ?? 0), 0);
    const valorGanho = ganhos.reduce((s, l) => s + (l.orcamento_est ?? 0), 0);
    const total = ganhos.length + perdidos.length;
    const taxa = total > 0 ? (ganhos.length / total) * 100 : 0;
    const ticket = ganhos.length > 0 ? valorGanho / ganhos.length : 0;
    return {
      leads: leads.length, ganhos: ganhos.length, perdidos: perdidos.length,
      valorNeg, valorGanho, taxa, ticket, negociando: negociando.length,
    };
  }, [leads]);

  return (
    <>
      <AppTopbar title="CRM Comercial" breadcrumb={["Home", "CRM", "Pipeline"]} />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Kpi icon={TrendingUp} label="Leads" value={kpis.leads.toString()} />
          <Kpi icon={User} label="Em negociação" value={kpis.negociando.toString()} />
          <Kpi icon={Trophy} label="Ganhos" value={kpis.ganhos.toString()} color="text-emerald-600" />
          <Kpi icon={AlertCircle} label="Perdidos" value={kpis.perdidos.toString()} color="text-rose-600" />
          <Kpi icon={TrendingUp} label="Conversão" value={`${kpis.taxa.toFixed(0)}%`} />
          <Kpi icon={DollarSign} label="Em negociação" value={formatBRL(kpis.valorNeg)} />
          <Kpi icon={DollarSign} label="Ticket médio" value={formatBRL(kpis.ticket)} color="text-emerald-600" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-lg border bg-card">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Buscar empresa, tema, cidade…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
          <NewLeadDialog />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-9 gap-3">
          {ETAPAS.map((stage) => {
            const stageLeads = filtrados.filter((l) => l.etapa === stage.id);
            const total = stageLeads.reduce((s, l) => s + (l.orcamento_est ?? 0), 0);
            return (
              <div key={stage.id} className="bg-muted/40 rounded-xl p-3 min-h-[500px]">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full ${stage.cor} shrink-0`} />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider truncate">{stage.titulo}</h3>
                  </div>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{stageLeads.length}</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground px-1 mb-2 font-medium">
                  {formatBRL(total)}
                </div>
                <div className="space-y-2">
                  {stageLeads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setOpenLeadId(l.id)}
                      className="w-full text-left bg-card rounded-lg p-3 border border-border hover:border-primary/40 hover:shadow-sm transition-all"
                    >
                      <div className="font-medium text-sm leading-tight">{l.empresa}</div>
                      {l.tema_evento && <div className="text-xs text-muted-foreground mt-0.5 truncate">{l.tema_evento}</div>}
                      <div className="mt-2 text-sm font-semibold text-emerald-600">{formatBRL(l.orcamento_est)}</div>
                      <div className="mt-2 pt-2 border-t border-border space-y-1">
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
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-[11px] text-muted-foreground text-center py-4 italic">—</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Carregando…</div>}
      </div>

      <LeadDrawer leadId={openLeadId} onClose={() => setOpenLeadId(null)} />
    </>
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
