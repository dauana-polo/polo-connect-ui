import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Hotel, Car, MapPin, User2 } from "lucide-react";
import { Can } from "@/components/shared/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

export const Route = createFileRoute("/app/logistica")({ component: LogisticaPage });

type LogisticaRow = {
  id: string;
  venda_id: string;
  status: string;
  observacoes: string | null;
  passagem_ida_cia: string | null; passagem_ida_voo: string | null;
  passagem_ida_data: string | null; passagem_ida_hora: string | null;
  passagem_ida_origem: string | null; passagem_ida_destino: string | null;
  passagem_volta_cia: string | null; passagem_volta_voo: string | null;
  passagem_volta_data: string | null; passagem_volta_hora: string | null;
  hotel_nome: string | null; hotel_checkin: string | null; hotel_checkout: string | null;
  hotel_endereco: string | null; hotel_reserva: string | null;
  transfer_ida_empresa: string | null; transfer_ida_obs: string | null;
  transfer_volta_empresa: string | null; transfer_volta_obs: string | null;
  venda: {
    id: string;
    titulo: string;
    data_evento: string | null;
    cidade: string | null;
    cliente: { razao_social: string } | null;
    palestrante: { id: string; nome: string; foto_url: string | null; telefone: string | null } | null;
  } | null;
};

const statusMap: Record<string, { label: string; cls: string }> = {
  pendente: { label: "Pendente", cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
  em_andamento: { label: "Em andamento", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  concluido: { label: "Concluído", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
};

function LogisticaPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<"cards" | "kanban">("cards");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LogisticaRow | null>(null);

  const logisticaQuery = useQuery({
    queryKey: ["logistica-lista"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logistica")
        .select("*, venda:vendas(id,titulo,data_evento,cidade,cliente:clientes(razao_social),palestrante:palestrantes(id,nome,foto_url,telefone))")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as LogisticaRow[];
    },
  });
  const rows = logisticaQuery.data ?? [];
  const isLoading = logisticaQuery.isLoading;
  const { can } = usePermissions();
  const canEdit = can("logistica", "edit");

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0] ?? null;

  useEffect(() => {
    if (selected) setDraft({ ...selected });
  }, [selected?.id]);

  const save = useMutation({
    mutationFn: async (row: LogisticaRow) => {
      const { venda, id, ...payload } = row as any;
      const { error } = await supabase.from("logistica").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Logística atualizada");
      qc.invalidateQueries({ queryKey: ["logistica-lista"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const setF = (k: keyof LogisticaRow, v: any) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  return (
    <>
      <AppTopbar title="Logística de Viagens" breadcrumb={["Operação", "Logística"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(statusMap).map(([k, v]) => (
              <Card key={k} className="px-4 py-3 min-w-[140px]">
                <div className="text-xs text-muted-foreground">{v.label}</div>
                <div className="text-2xl font-bold">{rows.filter((l) => l.status === k).length}</div>
              </Card>
            ))}
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <LoadingState label="Carregando logística..." />
        ) : logisticaQuery.error ? (
          <ErrorState onRetry={() => logisticaQuery.refetch()} />
        ) : rows.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            Nenhuma logística — registros são criados automaticamente quando uma venda é fechada no CRM.
          </Card>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {rows.map((l) => (
                <Card
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  className={`p-5 cursor-pointer transition hover:shadow-md ${selected?.id === l.id ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">{l.venda?.data_evento ?? "—"} · {l.venda?.cidade ?? "—"}</div>
                      <div className="font-semibold mt-0.5 truncate">{l.venda?.titulo ?? "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">{l.venda?.cliente?.razao_social ?? "—"}</div>
                    </div>
                    <Badge className={statusMap[l.status]?.cls}>{statusMap[l.status]?.label ?? l.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                    <span>{l.venda?.palestrante?.nome ?? "—"}</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><Plane className="h-3.5 w-3.5" /> {l.passagem_ida_cia ?? "—"} {l.passagem_ida_voo ?? ""} {l.passagem_ida_hora ?? ""}</div>
                    <div className="flex items-center gap-2"><Hotel className="h-3.5 w-3.5" /> {l.hotel_nome ?? "—"}</div>
                  </div>
                </Card>
              ))}
            </div>

            {draft && (
              <Card className="p-5 h-fit lg:sticky lg:top-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{draft.venda?.data_evento ?? "—"}</div>
                    <div className="font-semibold truncate">{draft.venda?.titulo ?? "—"}</div>
                    <div className="text-xs text-muted-foreground truncate">{draft.venda?.palestrante?.nome ?? "—"}</div>
                  </div>
                  <Select value={draft.status} onValueChange={(v) => setF("status", v)}>
                    <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusMap).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Section title="Voo — Ida" icon={<Plane className="h-3 w-3" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <F label="Cia" value={draft.passagem_ida_cia} onChange={(v) => setF("passagem_ida_cia", v)} />
                    <F label="Voo" value={draft.passagem_ida_voo} onChange={(v) => setF("passagem_ida_voo", v)} />
                    <F label="Origem" value={draft.passagem_ida_origem} onChange={(v) => setF("passagem_ida_origem", v)} />
                    <F label="Destino" value={draft.passagem_ida_destino} onChange={(v) => setF("passagem_ida_destino", v)} />
                    <F label="Data" type="date" value={draft.passagem_ida_data} onChange={(v) => setF("passagem_ida_data", v)} />
                    <F label="Hora" type="time" value={draft.passagem_ida_hora} onChange={(v) => setF("passagem_ida_hora", v)} />
                  </div>
                </Section>

                <Section title="Voo — Volta" icon={<Plane className="h-3 w-3 rotate-180" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <F label="Cia" value={draft.passagem_volta_cia} onChange={(v) => setF("passagem_volta_cia", v)} />
                    <F label="Voo" value={draft.passagem_volta_voo} onChange={(v) => setF("passagem_volta_voo", v)} />
                    <F label="Data" type="date" value={draft.passagem_volta_data} onChange={(v) => setF("passagem_volta_data", v)} />
                    <F label="Hora" type="time" value={draft.passagem_volta_hora} onChange={(v) => setF("passagem_volta_hora", v)} />
                  </div>
                </Section>

                <Section title="Hospedagem" icon={<Hotel className="h-3 w-3" />}>
                  <F label="Hotel" value={draft.hotel_nome} onChange={(v) => setF("hotel_nome", v)} />
                  <div className="grid grid-cols-2 gap-2">
                    <F label="Check-in" type="date" value={draft.hotel_checkin} onChange={(v) => setF("hotel_checkin", v)} />
                    <F label="Check-out" type="date" value={draft.hotel_checkout} onChange={(v) => setF("hotel_checkout", v)} />
                  </div>
                  <F label="Reserva" value={draft.hotel_reserva} onChange={(v) => setF("hotel_reserva", v)} />
                </Section>

                <Section title="Transfer" icon={<Car className="h-3 w-3" />}>
                  <F label="Ida — empresa" value={draft.transfer_ida_empresa} onChange={(v) => setF("transfer_ida_empresa", v)} />
                  <F label="Volta — empresa" value={draft.transfer_volta_empresa} onChange={(v) => setF("transfer_volta_empresa", v)} />
                </Section>

                <Section title="Observações" icon={<MapPin className="h-3 w-3" />}>
                  <Textarea rows={3} value={draft.observacoes ?? ""} onChange={(e) => setF("observacoes", e.target.value)} />
                </Section>

                <Button className="w-full" onClick={() => save.mutate(draft)} disabled={save.isPending}>
                  {save.isPending ? "Salvando…" : "Salvar logística"}
                </Button>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(statusMap).map(([col, v]) => (
              <div key={col} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-semibold">{v.label}</span>
                  <span className="text-xs text-muted-foreground">{rows.filter((l) => l.status === col).length}</span>
                </div>
                {rows.filter((l) => l.status === col).map((l) => (
                  <Card key={l.id} className="p-3 cursor-pointer hover:shadow-md transition" onClick={() => { setSelectedId(l.id); setView("cards"); }}>
                    <div className="text-[11px] text-muted-foreground">{l.venda?.data_evento ?? "—"}</div>
                    <div className="font-medium text-sm truncate">{l.venda?.titulo ?? "—"}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{l.venda?.cidade ?? "—"}</div>
                    <div className="text-xs mt-2 flex items-center gap-1"><Plane className="h-3 w-3 text-muted-foreground" />{l.passagem_ida_voo ?? "—"}</div>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">{icon} {title}</div>
      <div className="rounded-lg border p-3 space-y-2">{children}</div>
    </div>
  );
}

function F({ label, value, onChange, type = "text" }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input className="h-8 text-xs" type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
