import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Calendar, User, AlertTriangle, CheckSquare, Trash2 } from "lucide-react";
import { Can } from "@/components/shared/Can";
import { AsyncState } from "@/components/shared/AsyncState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { requiredString } from "@/lib/validators";

export const Route = createFileRoute("/app/tarefas")({ component: TarefasPage });

const PRIORIDADES = [
  { v: "baixa", label: "Baixa", cor: "bg-slate-500" },
  { v: "media", label: "Média", cor: "bg-blue-500" },
  { v: "alta", label: "Alta", cor: "bg-amber-500" },
  { v: "urgente", label: "Urgente", cor: "bg-rose-600" },
];

const tarefaSchema = z.object({
  titulo: requiredString("Título"),
  descricao: z.string().optional(),
  prazo: z.string().optional(),
  prioridade: z.enum(["baixa", "media", "alta", "urgente"]),
  responsavel_id: z.string().optional(),
});
type TarefaForm = z.infer<typeof tarefaSchema>;

function TarefasPage() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [filtroResp, setFiltroResp] = useState("all");
  const [filtroPri, setFiltroPri] = useState("all");
  const [aba, setAba] = useState("pendentes");
  const [openNova, setOpenNova] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const tarefasQuery = useQuery({
    queryKey: ["tarefas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tarefas")
        .select("*, responsavel:usuarios!tarefas_responsavel_id_fkey(id,nome), cliente:clientes(razao_social)")
        .order("prazo", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const tarefas = tarefasQuery.data ?? [];

  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios-ativos"],
    queryFn: async () => {
      const { data } = await supabase.from("usuarios").select("id,nome,perfil").eq("ativo", true).order("nome");
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return tarefas.filter((t: any) => {
      if (aba === "pendentes" && (t.status === "concluida" || t.status === "cancelada")) return false;
      if (aba === "concluidas" && t.status !== "concluida") return false;
      if (busca && !`${t.titulo} ${t.descricao ?? ""}`.toLowerCase().includes(busca.toLowerCase())) return false;
      if (filtroResp !== "all" && t.responsavel_id !== filtroResp) return false;
      if (filtroPri !== "all" && t.prioridade !== filtroPri) return false;
      return true;
    });
  }, [tarefas, aba, busca, filtroResp, filtroPri]);

  const kpis = useMemo(() => {
    const now = new Date();
    return {
      total: tarefas.length,
      pendentes: tarefas.filter((t: any) => t.status !== "concluida" && t.status !== "cancelada").length,
      atrasadas: tarefas.filter((t: any) => t.status !== "concluida" && t.status !== "cancelada" && t.prazo && new Date(t.prazo) < now).length,
      concluidas: tarefas.filter((t: any) => t.status === "concluida").length,
    };
  }, [tarefas]);

  const toggle = useMutation({
    mutationFn: async ({ id, concluida }: { id: string; concluida: boolean }) => {
      const { error } = await supabase.from("tarefas").update({
        status: concluida ? "concluida" : "aberta",
        concluida_em: concluida ? new Date().toISOString() : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tarefas"] }),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tarefas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tarefa removida");
      setToDelete(null);
      qc.invalidateQueries({ queryKey: ["tarefas"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const criar = useMutation({
    mutationFn: async (payload: any) => {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      const { data: me } = uid ? await supabase.from("usuarios").select("id").eq("user_id", uid).single() : { data: null as any };
      const { error } = await supabase.from("tarefas").insert({ ...payload, criado_por: me?.id ?? null });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tarefa criada"); setOpenNova(false); qc.invalidateQueries({ queryKey: ["tarefas"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <>
      <AppTopbar title="Tarefas" breadcrumb={["Produtividade", "Tarefas"]} />
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Total" value={kpis.total} icon={CheckSquare} />
          <Kpi label="Pendentes" value={kpis.pendentes} icon={Calendar} />
          <Kpi label="Atrasadas" value={kpis.atrasadas} icon={AlertTriangle} color="text-rose-600" />
          <Kpi label="Concluídas" value={kpis.concluidas} icon={CheckSquare} color="text-emerald-600" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg border bg-card flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Buscar tarefas…" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <Select value={filtroResp} onValueChange={setFiltroResp}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Responsável" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos responsáveis</SelectItem>
              {usuarios.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filtroPri} onValueChange={setFiltroPri}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas prioridades</SelectItem>
              {PRIORIDADES.map((p) => <SelectItem key={p.v} value={p.v}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Can resource="tarefas" action="edit">
            <Button onClick={() => setOpenNova(true)}><Plus className="h-4 w-4" />Nova tarefa</Button>
          </Can>
        </div>

        <Tabs value={aba} onValueChange={setAba}>
          <TabsList>
            <TabsTrigger value="pendentes">Pendentes ({kpis.pendentes})</TabsTrigger>
            <TabsTrigger value="concluidas">Concluídas ({kpis.concluidas})</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>
        </Tabs>

        <AsyncState
          loading={tarefasQuery.isLoading}
          error={tarefasQuery.error}
          data={filtered as any[]}
          onRetry={() => tarefasQuery.refetch()}
          emptyTitle="Nenhuma tarefa encontrada"
        >
          {(list) => (
            <Card className="divide-y">
              {list.map((t: any) => {
                const pri = PRIORIDADES.find((p) => p.v === t.prioridade);
                const atrasada = t.status !== "concluida" && t.prazo && new Date(t.prazo) < new Date();
                return (
                  <div key={t.id} className="flex items-start gap-3 p-3 hover:bg-muted/30">
                    <Can resource="tarefas" action="edit" fallback={<Checkbox checked={t.status === "concluida"} disabled className="mt-1" />}>
                      <Checkbox
                        checked={t.status === "concluida"}
                        onCheckedChange={(v) => toggle.mutate({ id: t.id, concluida: !!v })}
                        className="mt-1"
                      />
                    </Can>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${t.status === "concluida" ? "line-through text-muted-foreground" : ""}`}>{t.titulo}</div>
                      {t.descricao && <div className="text-xs text-muted-foreground line-clamp-2">{t.descricao}</div>}
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                        <span className={`inline-flex items-center gap-1 ${atrasada ? "text-rose-600 font-medium" : ""}`}>
                          <Calendar className="h-3 w-3" />
                          {t.prazo ? new Date(t.prazo).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Sem prazo"}
                        </span>
                        {t.responsavel && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{t.responsavel.nome}</span>}
                        {t.cliente && <span>· {t.cliente.razao_social}</span>}
                      </div>
                    </div>
                    {pri && <Badge className={`${pri.cor} text-white text-[10px]`}>{pri.label}</Badge>}
                    <Can resource="tarefas" action="edit">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setToDelete(t.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </Can>
                  </div>
                );
              })}
            </Card>
          )}
        </AsyncState>
      </div>

      <NovaTarefaDialog
        open={openNova}
        onOpenChange={setOpenNova}
        usuarios={usuarios}
        onSubmit={(v: any) => criar.mutate(v)}
        saving={criar.isPending}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Excluir tarefa?"
        description="Esta ação não pode ser desfeita."
        destructive
        confirmLabel="Excluir"
        onConfirm={() => { if (toDelete) remover.mutate(toDelete); }}
      />
    </>
  );
}

function Kpi({ icon: Icon, label, value, color }: any) {
  return (
    <Card className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Icon className="h-3 w-3" />{label}</div>
      <div className={`font-semibold text-lg mt-1 ${color ?? ""}`}>{value}</div>
    </Card>
  );
}

function NovaTarefaDialog({
  open, onOpenChange, usuarios, onSubmit, saving,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  usuarios: any[]; onSubmit: (v: any) => void; saving: boolean;
}) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TarefaForm>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: { titulo: "", descricao: "", prazo: "", prioridade: "media", responsavel_id: "" },
  });

  const submit = (v: TarefaForm) => {
    onSubmit({
      titulo: v.titulo,
      descricao: v.descricao || null,
      prazo: v.prazo ? new Date(v.prazo).toISOString() : null,
      prioridade: v.prioridade,
      responsavel_id: v.responsavel_id || null,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova tarefa</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <div>
            <Label>Título *</Label>
            <Input {...register("titulo")} />
            {errors.titulo && <p className="text-xs text-destructive mt-1">{errors.titulo.message}</p>}
          </div>
          <div><Label>Descrição</Label><Textarea rows={3} {...register("descricao")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prioridade</Label>
              <Controller name="prioridade" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORIDADES.map((p) => <SelectItem key={p.v} value={p.v}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div><Label>Prazo</Label><Input type="datetime-local" {...register("prazo")} /></div>
          </div>
          <div>
            <Label>Responsável</Label>
            <Controller name="responsavel_id" control={control} render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
                <SelectContent>{usuarios.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando…" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
