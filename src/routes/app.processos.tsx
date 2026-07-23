import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, CheckCircle2, Circle, Workflow, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/processos")({ component: ProcessosPage });

const TEMPLATES = {
  onboarding: ["Reunião de kick-off", "Coleta de dados fiscais", "Contrato assinado", "Ambiente criado", "Treinamento inicial", "Go-live"],
  fechamento_contrato: ["Proposta enviada", "Negociação", "Aprovação jurídica", "Assinatura contrato", "Pagamento inicial"],
  pos_venda: ["Confirmação evento", "Briefing técnico", "Realização evento", "Coleta NPS", "Follow-up 30 dias"],
  custom: [],
};

function ProcessosPage() {
  const qc = useQueryClient();
  const [openNovo, setOpenNovo] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const { data: processos = [] } = useQuery({
    queryKey: ["processos"],
    queryFn: async () => {
      const { data } = await supabase.from("processos")
        .select("*, responsavel:usuarios!processos_responsavel_id_fkey(nome), cliente:clientes(razao_social)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

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
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("processos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { setSelected(null); qc.invalidateQueries({ queryKey: ["processos"] }); toast.success("Processo removido"); },
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
          <NovoProcessoDialog open={openNovo} onOpenChange={setOpenNovo} onSubmit={(v: any) => criar.mutate(v)} saving={criar.isPending} />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p: any) => {
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
          {filtered.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground col-span-full">
              <Workflow className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Nenhum processo. Crie um a partir de um template acima.
            </Card>
          )}
        </div>
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
                    <Button onClick={() => avancar.mutate({ id: current.id, etapas: current.etapas, etapa_atual: current.etapa_atual })}>
                      Avançar etapa
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => remover.mutate(current.id)}>
                    <Trash2 className="h-4 w-4" />Remover
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function NovoProcessoDialog({ open, onOpenChange, onSubmit, saving }: any) {
  const [form, setForm] = useState<any>({ nome: "", tipo: "onboarding" });
  const { data: clientes = [] } = useQuery({
    queryKey: ["proc-clientes-min"],
    queryFn: async () => (await supabase.from("clientes").select("id,razao_social").order("razao_social")).data ?? [],
  });
  const [clienteId, setClienteId] = useState<string>("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Novo processo</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo processo</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nome *</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Onboarding Cliente ACME" /></div>
          <div>
            <Label>Template</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="onboarding">Onboarding de cliente</SelectItem>
                <SelectItem value="fechamento_contrato">Fechamento de contrato</SelectItem>
                <SelectItem value="pos_venda">Pós-venda</SelectItem>
                <SelectItem value="custom">Custom (vazio)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cliente (opcional)</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {clientes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground">Etapas padrão: {TEMPLATES[form.tipo as keyof typeof TEMPLATES]?.join(" → ") || "—"}</div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={saving || !form.nome} onClick={() => onSubmit({
            nome: form.nome, tipo: form.tipo,
            etapas: TEMPLATES[form.tipo as keyof typeof TEMPLATES] ?? [],
            cliente_id: clienteId || null,
          })}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
