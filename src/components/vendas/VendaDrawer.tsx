import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/shared/Can";
import { LoadingState } from "@/components/shared/LoadingState";
import { usePermissions } from "@/hooks/usePermissions";
import { requiredString, isoDateSchema, moneySchema } from "@/lib/validators";

interface Props {
  vendaId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extraSlot?: React.ReactNode;
  onSaved?: () => void;
}

interface VendaMeta {
  id: string;
  status: string | null;
  clientes: { nome: string } | null;
  palestrantes: { nome: string } | null;
  usuarios: { nome: string } | null;
  proposta_id: string | null;
}

interface EmpresaOption {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
}

const vendaSchema = z.object({
  titulo: requiredString("Título"),
  data_evento: isoDateSchema.optional().or(z.literal("")),
  cidade: z.string().trim().optional(),
  formato: z.string().trim().optional(),
  publico_estimado: z.string().trim().optional(),
  briefing: z.string().trim().optional(),
  valor_total: moneySchema,
  cache_palestr: moneySchema,
  status: z.string().trim().optional(),
  empresa_polo_id: z.string().trim().optional(),
});
type VendaForm = z.input<typeof vendaSchema>;
type VendaValues = z.output<typeof vendaSchema>;

export function VendaDrawer({ vendaId, open, onOpenChange, extraSlot, onSaved }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<VendaMeta | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);

  const { can } = usePermissions();
  const canEdit = can("vendas", "edit");

  const form = useForm<VendaForm>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      titulo: "", data_evento: "", cidade: "", formato: "", publico_estimado: "",
      briefing: "", valor_total: 0, cache_palestr: 0, status: "ativo", empresa_polo_id: "",
    },
  });
  const errors = form.formState.errors;

  useEffect(() => {
    if (!open || !vendaId) return;
    setLoading(true);
    supabase
      .from("vendas")
      .select(
        "id, titulo, data_evento, cidade, formato, publico_estimado, briefing, valor_total, cache_palestr, status, empresa_polo_id, proposta_id, clientes(nome:razao_social), palestrantes(nome), usuarios:consultor_id(nome)"
      )
      .eq("id", vendaId)
      .single()
      .then(({ data, error }) => {
        if (error) toast.error("Erro ao carregar venda");
        else if (data) {
          const d = data as any;
          setMeta({
            id: d.id, status: d.status,
            clientes: d.clientes, palestrantes: d.palestrantes,
            usuarios: d.usuarios, proposta_id: d.proposta_id,
          });
          form.reset({
            titulo: d.titulo ?? "",
            data_evento: d.data_evento ?? "",
            cidade: d.cidade ?? "",
            formato: d.formato ?? "",
            publico_estimado: d.publico_estimado != null ? String(d.publico_estimado) : "",
            briefing: d.briefing ?? "",
            valor_total: d.valor_total ?? 0,
            cache_palestr: d.cache_palestr ?? 0,
            status: d.status ?? "ativo",
            empresa_polo_id: d.empresa_polo_id ?? "",
          });
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendaId, open]);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("empresas_polo")
      .select("id, razao_social, nome_fantasia")
      .eq("ativo", true)
      .order("razao_social")
      .then(({ data, error }) => {
        if (!error) setEmpresas((data ?? []) as EmpresaOption[]);
      });
  }, [open]);

  const onSubmit = async (values: VendaForm) => {
    if (!meta) return;
    setSaving(true);

    if (values.data_evento) {
      const { data: vRow } = await supabase.from("vendas").select("palestrante_id").eq("id", meta.id).single();
      if (vRow?.palestrante_id) {
        const { data: conflitos } = await supabase
          .from("vendas")
          .select("id")
          .eq("palestrante_id", vRow.palestrante_id)
          .eq("data_evento", values.data_evento)
          .neq("status", "cancelado")
          .neq("id", meta.id);
        if (conflitos && conflitos.length > 0) {
          setSaving(false);
          toast.error(`Conflito de agenda: este palestrante já tem outro evento em ${values.data_evento}.`);
          return;
        }
      }
    }

    const { error } = await supabase
      .from("vendas")
      .update({
        titulo: values.titulo,
        data_evento: values.data_evento || null,
        cidade: values.cidade || null,
        formato: values.formato || null,
        publico_estimado: values.publico_estimado ? Number(values.publico_estimado) : null,
        briefing: values.briefing || null,
        valor_total: values.valor_total,
        cache_palestr: values.cache_palestr,
        status: values.status || null,
        empresa_polo_id: values.empresa_polo_id || null,
      })
      .eq("id", meta.id);
    setSaving(false);
    if (error) toast.error("Erro ao salvar: " + error.message);
    else {
      toast.success("Venda atualizada");
      onSaved?.();
    }
  };

  const goSetor = (setor: string) => {
    onOpenChange(false);
    navigate({ to: "/app/kanban", search: { setor, venda: meta?.id } as never });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes da Venda</SheetTitle>
          <SheetDescription>Edite os dados e clique em Salvar.</SheetDescription>
        </SheetHeader>

        {loading || !meta ? (
          <LoadingState label="Carregando venda…" />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Cliente</div>
                <div className="font-medium">{meta.clientes?.nome ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Palestrante</div>
                <div className="font-medium">{meta.palestrantes?.nome ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Consultor</div>
                <div className="font-medium">{meta.usuarios?.nome ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status atual</div>
                <Badge variant="outline">{meta.status ?? "—"}</Badge>
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <Label>Título</Label>
                <Input disabled={!canEdit} {...form.register("titulo")} />
                {errors.titulo && <p className="text-[11px] text-rose-500 mt-1">{errors.titulo.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data do evento</Label>
                  <Input type="date" disabled={!canEdit} {...form.register("data_evento")} />
                  {errors.data_evento && <p className="text-[11px] text-rose-500 mt-1">{errors.data_evento.message}</p>}
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input disabled={!canEdit} {...form.register("cidade")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Formato</Label>
                  <Controller
                    control={form.control}
                    name="formato"
                    render={({ field }) => (
                      <Select value={field.value ?? ""} disabled={!canEdit} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label>Público estimado</Label>
                  <Input type="number" disabled={!canEdit} {...form.register("publico_estimado")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor total (R$)</Label>
                  <Input type="number" step="0.01" disabled={!canEdit} {...form.register("valor_total")} />
                  {errors.valor_total && <p className="text-[11px] text-rose-500 mt-1">{errors.valor_total.message}</p>}
                </div>
                <div>
                  <Label>Cachê palestrante (R$)</Label>
                  <Input type="number" step="0.01" disabled={!canEdit} {...form.register("cache_palestr")} />
                  {errors.cache_palestr && <p className="text-[11px] text-rose-500 mt-1">{errors.cache_palestr.message}</p>}
                </div>
              </div>
              <div>
                <Label>Empresa emissora</Label>
                <Controller
                  control={form.control}
                  name="empresa_polo_id"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} disabled={!canEdit} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                      <SelectContent>
                        {empresas.map((e) => (
                          <SelectItem key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value ?? "ativo"} disabled={!canEdit} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="suspenso">Suspenso</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label>Briefing</Label>
                <Textarea rows={4} disabled={!canEdit} {...form.register("briefing")} />
              </div>
            </div>

            {extraSlot}

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button type="button" size="sm" variant="outline" onClick={() => goSetor("juridico")}>Jurídico</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => goSetor("financeiro")}>Financeiro</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => goSetor("logistica")}>Logística</Button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Can resource="vendas" action="edit">
                <Button type="submit" disabled={saving || !canEdit}>{saving ? "Salvando…" : "Salvar"}</Button>
              </Can>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
