import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, CheckCircle2, Circle, Workflow, Trash2 } from "lucide-react";
import { Can } from "@/components/shared/Can";
import { AsyncState } from "@/components/shared/AsyncState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { requiredString } from "@/lib/validators";

export const Route = createFileRoute("/app/processos")({ component: ProcessosPage });

const TEMPLATES: Record<string, string[]> = {
  onboarding: ["Reunião de kick-off", "Coleta de dados fiscais", "Contrato assinado", "Ambiente criado", "Treinamento inicial", "Go-live"],
  fechamento_contrato: ["Proposta enviada", "Negociação", "Aprovação jurídica", "Assinatura contrato", "Pagamento inicial"],
  pos_venda: ["Confirmação evento", "Briefing técnico", "Realização evento", "Coleta NPS", "Follow-up 30 dias"],
  custom: [],
};

const processoSchema = z.object({
  nome: requiredString("Nome"),
  tipo: z.enum(["onboarding", "fechamento_contrato", "pos_venda", "custom"]),
  cliente_id: z.string().optional(),
});
type ProcessoForm = z.infer<typeof processoSchema>;

function ProcessosPage() {
  const qc = useQueryClient();
  const [openNovo, setOpenNovo] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const processosQuery = useQuery({
    queryKey: ["processos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("processos")
        .select("*, responsavel:usuarios!processos_responsavel_id_fkey(nome), cliente:clientes(razao_social)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const processos = processosQuery.data ?? [];
  const filtered = processos.filter((p: any) => filtroStatus === "todos" || p.status === filtroStatus);
  const current = processos.find((p: any) => p.id === selected);

  const criar = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from("processos").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Processo criado"); setOpenNovo(false); qc.invalidateQueries({ queryKey: ["processos"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const avancar = useMutation({
    mutationFn: async ({ id, etapas, etapa_atual }: any) => {
      const proxima = etapa_atual + 1;
      const total = etapas.length;
      const { error } = await supabase.from("processos").update({
        etapa_atual: Math.min(proxima, total),
        status: proxima >= total ? "concluido" : "em_andamento",
        concluido_em: proxima >= total ? new Date().toISOString() : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["processos"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("processos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setSelected(null); setToDelete(null);
      qc.invalidateQueries({ queryKey: ["processos"] });
      toast.success("Processo removido");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <>
      <AppTopbar title="Processos" breadcrumb={["Produtividade", "Processos"]} />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluido">Concluídos</SelectItem>
              <SelectItem value="cancelado">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Can resource="processos" action="edit">
            <Button onClick={() => setOpenNovo(true)}><Plus className="h-4 w-4" />Novo processo</Button>
          </Can>
        </div>

        <AsyncState
          loading={processosQuery.isLoading}
          error={processosQuery.error}
          data={filtered as any[]}
          onRetry={() => processosQuery.refetch()}
          emptyTitle="Nenhum processo"
          emptyDescription="Crie um a partir de um template."
          emptyIcon={<Workflow className="h-8 w-8 opacity-40" />}
        >
          {(list) => (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {list.map((p: any) => {
                const etapas: string[] = Array.isArray(p.etapas) ? p.etapas : [];
                const pct = etapas.length ? Math.round((p.etapa_atual / etapas.length) * 100) : 0;
                return (
                  <Card key={p.id} className="p-4 hover:border-primary/40 cursor-pointer transition" onClick={() => setSelected(p.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{p.nome}</div>
                        <div className="text-[11px] text-muted-foreground capitalize">{p.tipo.replace("_", " ")}</div>
                      </div>
                      <Badge variant={p.status === "concluido" ? "default" : "secondary"} className={p.status === "concluido" ? "bg-emerald-500" : ""}>
                        {p.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">Etapa {p.etapa_atual}/{etapas.length}</div>
                    <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-2">
                      {p.cliente?.razao_social && <span>{p.cliente.razao_social}</span>}
                      {p.responsavel?.nome && <span>· {p.responsavel.nome}</span>}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </AsyncState>
      </div>

      <Sheet open={!!current} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {current && (
            <>
              <SheetHeader>
                <SheetTitle>{current.nome}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="text-xs text-muted-foreground capitalize">{current.tipo.replace("_", " ")} · {current.status.replace("_", " ")}</div>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Etapas</div>
                  <ol className="space-y-2">
                    {(current.etapas as string[]).map((etapa, i) => {
                      const done = i < current.etapa_atual;
                      const atual = i === current.etapa_atual;
                      return (
                        <li key={i} className={`flex items-start gap-2 p-2 rounded ${atual ? "bg-primary/5 border border-primary/30" : ""}`}>
                          {done ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" /> : <Circle className={`h-4 w-4 mt-0.5 ${atual ? "text-primary" : "text-muted-foreground"}`} />}
                          <span className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{etapa}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t">
                  {current.status === "em_andamento" && (
                    <Can resource="processos" action="edit">
                      <Button onClick={() => avancar.mutate({ id: current.id, etapas: current.etapas, etapa_atual: current.etapa_atual })}>
                        Avançar etapa
                      </Button>
                    </Can>
                  )}
                  <Can resource="processos" action="edit">
                    <Button variant="destructive" size="sm" onClick={() => setToDelete(current.id)}>
                      <Trash2 className="h-4 w-4" />Remover
                    </Button>
                  </Can>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <NovoProcessoDialog
        open={openNovo}
        onOpenChange={setOpenNovo}
        onSubmit={(v: any) => criar.mutate(v)}
        saving={criar.isPending}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Remover processo?"
        description="Esta ação não pode ser desfeita."
        destructive
        confirmLabel="Remover"
        onConfirm={() => toDelete && remover.mutate(toDelete)}
      />
    </>
  );
}

function NovoProcessoDialog({
  open, onOpenChange, onSubmit, saving,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSubmit: (v: any) => void; saving: boolean;
}) {
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<ProcessoForm>({
    resolver: zodResolver(processoSchema),
    defaultValues: { nome: "", tipo: "onboarding", cliente_id: "" },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["proc-clientes-min"],
    queryFn: async () => (await supabase.from("clientes").select("id,razao_social").order("razao_social")).data ?? [],
    enabled: open,
  });

  const tipo = watch("tipo");

  const submit = (v: ProcessoForm) => {
    onSubmit({
      nome: v.nome,
      tipo: v.tipo,
      etapas: TEMPLATES[v.tipo] ?? [],
      cliente_id: v.cliente_id || null,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo processo</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <div>
            <Label>Nome *</Label>
            <Input {...register("nome")} placeholder="Ex: Onboarding Cliente ACME" />
            {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>}
          </div>
          <div>
            <Label>Template</Label>
            <Controller name="tipo" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Onboarding de cliente</SelectItem>
                  <SelectItem value="fechamento_contrato">Fechamento de contrato</SelectItem>
                  <SelectItem value="pos_venda">Pós-venda</SelectItem>
                  <SelectItem value="custom">Custom (vazio)</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </div>
          <div>
            <Label>Cliente (opcional)</Label>
            <Controller name="cliente_id" control={control} render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {clientes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
          <div className="text-xs text-muted-foreground">Etapas padrão: {TEMPLATES[tipo]?.join(" → ") || "—"}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando…" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
