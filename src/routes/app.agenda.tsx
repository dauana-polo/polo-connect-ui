import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Mic2 } from "lucide-react";
import { Can } from "@/components/shared/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { requiredString } from "@/lib/validators";

export const Route = createFileRoute("/app/agenda")({ component: AgendaPage });

type EventoAgenda = {
  id: string;
  titulo: string;
  data: Date;
  tipo: string;
  fonte: "compromisso" | "evento_venda";
  descricao?: string | null;
  cor: string;
};

const compromissoSchema = z.object({
  titulo: requiredString("Título"),
  inicio: z.string().trim().min(1, "Data/hora é obrigatória"),
  tipo: z.string().min(1),
  local: z.string().optional(),
  descricao: z.string().optional(),
});
type CompromissoForm = z.infer<typeof compromissoSchema>;

function AgendaPage() {
  const [ref, setRef] = useState(() => new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const qc = useQueryClient();
  const { can } = usePermissions();

  const monthStart = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const monthEnd = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  const gridStart = new Date(monthStart); gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(monthEnd); gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const compromissosQuery = useQuery({
    queryKey: ["agenda-eventos", monthStart.toISOString(), monthEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.from("agenda_eventos")
        .select("id,titulo,inicio,fim,tipo,descricao,local,cliente_id,clientes(razao_social)")
        .gte("inicio", gridStart.toISOString())
        .lte("inicio", gridEnd.toISOString())
        .order("inicio");
      if (error) throw error;
      return data ?? [];
    },
  });

  const vendasQuery = useQuery({
    queryKey: ["agenda-vendas", monthStart.toISOString(), monthEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendas")
        .select("id,titulo,data_evento,cidade,clientes(razao_social),palestrantes(nome)")
        .gte("data_evento", gridStart.toISOString().slice(0, 10))
        .lte("data_evento", gridEnd.toISOString().slice(0, 10));
      if (error) throw error;
      return data ?? [];
    },
  });

  const compromissos = compromissosQuery.data ?? [];
  const vendas = vendasQuery.data ?? [];
  const loading = compromissosQuery.isLoading || vendasQuery.isLoading;
  const error = compromissosQuery.error ?? vendasQuery.error;

  const eventos: EventoAgenda[] = useMemo(() => {
    const list: EventoAgenda[] = [];
    for (const c of compromissos as any[]) {
      list.push({
        id: `c-${c.id}`, titulo: c.titulo, data: new Date(c.inicio),
        tipo: c.tipo, fonte: "compromisso", descricao: c.descricao,
        cor: c.tipo === "reuniao" ? "bg-violet-500" : c.tipo === "ligacao" ? "bg-blue-500" : "bg-slate-500",
      });
    }
    for (const v of vendas as any[]) {
      if (!v.data_evento) continue;
      list.push({
        id: `v-${v.id}`, titulo: v.titulo ?? `Evento — ${v.clientes?.razao_social ?? ""}`,
        data: new Date(v.data_evento + "T09:00:00"),
        tipo: "evento", fonte: "evento_venda",
        descricao: `${v.palestrantes?.nome ?? ""} · ${v.cidade ?? ""}`,
        cor: "bg-primary",
      });
    }
    return list;
  }, [compromissos, vendas]);

  const days: Date[] = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) days.push(new Date(d));

  const eventosDia = (d: Date) => eventos.filter((e) => e.data.toDateString() === d.toDateString());

  const criar = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from("agenda_eventos").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Compromisso criado");
      setOpenDialog(false);
      qc.invalidateQueries({ queryKey: ["agenda-eventos"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const canEdit = can("agenda", "edit");
  const onDayClick = (d: Date) => {
    setSelectedDay(d);
    if (canEdit) setOpenDialog(true);
  };

  return (
    <>
      <AppTopbar title="Agenda" breadcrumb={["Produtividade", "Agenda"]} />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setRef(new Date(ref.getFullYear(), ref.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold capitalize min-w-[180px] text-center">
              {ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </div>
            <Button variant="outline" size="icon" onClick={() => setRef(new Date(ref.getFullYear(), ref.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRef(new Date())}>Hoje</Button>
          </div>
          <Can resource="agenda" action="edit">
            <Button onClick={() => { setSelectedDay(null); setOpenDialog(true); }}>
              <Plus className="h-4 w-4" />Novo compromisso
            </Button>
          </Can>
        </div>

        {loading ? (
          <LoadingState label="Carregando agenda..." />
        ) : error ? (
          <ErrorState onRetry={() => { compromissosQuery.refetch(); vendasQuery.refetch(); }} />
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="grid grid-cols-7 border-b bg-muted/40 text-[11px] uppercase font-semibold text-muted-foreground">
                {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((d) => (
                  <div key={d} className="p-2 text-center">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((d) => {
                  const isMonth = d.getMonth() === ref.getMonth();
                  const isToday = d.toDateString() === new Date().toDateString();
                  const evs = eventosDia(d);
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => onDayClick(d)}
                      className={`min-h-[110px] border-b border-r p-2 text-left transition hover:bg-muted/30 ${!isMonth ? "bg-muted/10 opacity-60" : ""}`}
                    >
                      <div className={`text-xs font-semibold mb-1 ${isToday ? "text-primary" : ""}`}>
                        {d.getDate()}
                        {isToday && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />}
                      </div>
                      <div className="space-y-1">
                        {evs.slice(0, 3).map((e) => (
                          <div key={e.id} className={`text-[10px] px-1.5 py-0.5 rounded text-white truncate ${e.cor}`}>
                            {e.fonte === "evento_venda" ? <Mic2 className="h-2.5 w-2.5 inline mr-1" /> : null}
                            {e.titulo}
                          </div>
                        ))}
                        {evs.length > 3 && <div className="text-[10px] text-muted-foreground">+{evs.length - 3} mais</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><CalendarDays className="h-4 w-4" />Próximos 7 dias</h3>
              <div className="space-y-2">
                {eventos
                  .filter((e) => e.data >= new Date() && e.data <= new Date(Date.now() + 7 * 86400000))
                  .sort((a, b) => a.data.getTime() - b.data.getTime())
                  .slice(0, 10)
                  .map((e) => (
                    <div key={e.id} className="flex items-center gap-3 p-2 rounded border">
                      <div className={`h-8 w-1 rounded-full ${e.cor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{e.titulo}</div>
                        <div className="text-xs text-muted-foreground truncate">{e.descricao ?? "—"}</div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right shrink-0">
                        <div>{e.data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</div>
                        <div>{e.data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">{e.tipo}</Badge>
                    </div>
                  ))}
                {!eventos.some((e) => e.data >= new Date()) && (
                  <div className="text-center text-sm text-muted-foreground py-4">Nenhum compromisso próximo.</div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>

      <NovoCompromissoDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        defaultDate={selectedDay}
        onSubmit={(v) => criar.mutate(v)}
        saving={criar.isPending}
      />
    </>
  );
}

function NovoCompromissoDialog({
  open, onOpenChange, defaultDate, onSubmit, saving,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  defaultDate: Date | null; onSubmit: (v: any) => void; saving: boolean;
}) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CompromissoForm>({
    resolver: zodResolver(compromissoSchema),
    defaultValues: { titulo: "", tipo: "reuniao", inicio: "", local: "", descricao: "" },
  });

  useEffect(() => {
    if (open) {
      const inicio = defaultDate
        ? new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        : "";
      reset({ titulo: "", tipo: "reuniao", inicio, local: "", descricao: "" });
    }
  }, [open, defaultDate, reset]);

  const submit = (v: CompromissoForm) => {
    onSubmit({
      titulo: v.titulo, descricao: v.descricao || null, tipo: v.tipo,
      inicio: new Date(v.inicio).toISOString(), local: v.local || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo compromisso</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <div>
            <Label>Título *</Label>
            <Input {...register("titulo")} />
            {errors.titulo && <p className="text-xs text-destructive mt-1">{errors.titulo.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Controller name="tipo" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="ligacao">Ligação</SelectItem>
                    <SelectItem value="tarefa">Tarefa</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div>
              <Label>Data/hora *</Label>
              <Input type="datetime-local" {...register("inicio")} />
              {errors.inicio && <p className="text-xs text-destructive mt-1">{errors.inicio.message}</p>}
            </div>
          </div>
          <div><Label>Local</Label><Input {...register("local")} /></div>
          <div><Label>Descrição</Label><Textarea rows={3} {...register("descricao")} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando…" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
