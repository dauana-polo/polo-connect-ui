import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/shared/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { requiredString, isoDateSchema, moneySchema } from "@/lib/validators";

interface Props {
  vendaId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extraSlot?: React.ReactNode;
  onSaved?: () => void;
}

interface VendaRow {
  id: string;
  titulo: string;
  data_evento: string | null;
  cidade: string | null;
  formato: string | null;
  publico_estimado: number | null;
  briefing: string | null;
  valor_total: number;
  cache_palestr: number;
  status: string | null;
  empresa_polo_id: string | null;
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

export function VendaDrawer({ vendaId, open, onOpenChange, extraSlot, onSaved }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<VendaRow | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);

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
        else setData(data as unknown as VendaRow);
        setLoading(false);
      });
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

  const { can } = usePermissions();
  const canEdit = can("vendas", "edit");

  const update = <K extends keyof VendaRow>(k: K, v: VendaRow[K]) => {
    setData((d) => (d ? { ...d, [k]: v } : d));
  };

  const vendaSchema = z.object({
    titulo: requiredString("Título"),
    data_evento: isoDateSchema.optional().or(z.literal("")),
    valor_total: moneySchema,
    cache_palestr: moneySchema,
  });

  const handleSave = async () => {
    if (!data) return;
    const parsed = vendaSchema.safeParse({
      titulo: data.titulo ?? "",
      data_evento: data.data_evento ?? "",
      valor_total: data.valor_total ?? 0,
      cache_palestr: data.cache_palestr ?? 0,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);

    // Conflict check: same palestrante + same data_evento on other active vendas
    if (data.data_evento) {
      const { data: vRow } = await supabase.from("vendas").select("palestrante_id").eq("id", data.id).single();
      if (vRow?.palestrante_id) {
        const { data: conflitos } = await supabase
          .from("vendas")
          .select("id")
          .eq("palestrante_id", vRow.palestrante_id)
          .eq("data_evento", data.data_evento)
          .neq("status", "cancelado")
          .neq("id", data.id);
        if (conflitos && conflitos.length > 0) {
          setSaving(false);
          toast.error(`Conflito de agenda: este palestrante já tem outro evento em ${data.data_evento}.`);
          return;
        }
      }
    }

    const { error } = await supabase
      .from("vendas")
      .update({
        titulo: data.titulo,
        data_evento: data.data_evento,
        cidade: data.cidade,
        formato: data.formato,
        publico_estimado: data.publico_estimado,
        briefing: data.briefing,
        valor_total: data.valor_total,
        cache_palestr: data.cache_palestr,
        status: data.status,
        empresa_polo_id: data.empresa_polo_id,
      })
      .eq("id", data.id);
    setSaving(false);
    if (error) toast.error("Erro ao salvar: " + error.message);
    else {
      toast.success("Venda atualizada");
      onSaved?.();
    }
  };

  const goSetor = (setor: string) => {
    onOpenChange(false);
    navigate({ to: "/app/kanban", search: { setor, venda: data?.id } as never });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes da Venda</SheetTitle>
          <SheetDescription>Edite os dados e clique em Salvar.</SheetDescription>
        </SheetHeader>

        {loading || !data ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Cliente</div>
                <div className="font-medium">{data.clientes?.nome ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Palestrante</div>
                <div className="font-medium">{data.palestrantes?.nome ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Consultor</div>
                <div className="font-medium">{data.usuarios?.nome ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status atual</div>
                <Badge variant="outline">{data.status ?? "—"}</Badge>
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <Label>Título</Label>
                <Input value={data.titulo ?? ""} onChange={(e) => update("titulo", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data do evento</Label>
                  <Input
                    type="date"
                    value={data.data_evento ?? ""}
                    onChange={(e) => update("data_evento", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input value={data.cidade ?? ""} onChange={(e) => update("cidade", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Formato</Label>
                  <Select value={data.formato ?? ""} onValueChange={(v) => update("formato", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Público estimado</Label>
                  <Input
                    type="number"
                    value={data.publico_estimado ?? ""}
                    onChange={(e) => update("publico_estimado", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor total (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.valor_total ?? 0}
                    onChange={(e) => update("valor_total", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Cachê palestrante (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.cache_palestr ?? 0}
                    onChange={(e) => update("cache_palestr", Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label>Empresa emissora</Label>
                <Select
                  value={data.empresa_polo_id ?? ""}
                  onValueChange={(v) => update("empresa_polo_id", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={data.status ?? "ativo"} onValueChange={(v) => update("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Briefing</Label>
                <Textarea
                  rows={4}
                  value={data.briefing ?? ""}
                  onChange={(e) => update("briefing", e.target.value)}
                />
              </div>
            </div>

            {extraSlot}

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => goSetor("juridico")}>Jurídico</Button>
              <Button size="sm" variant="outline" onClick={() => goSetor("financeiro")}>Financeiro</Button>
              <Button size="sm" variant="outline" onClick={() => goSetor("logistica")}>Logística</Button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Can resource="vendas" action="edit">
                <Button onClick={handleSave} disabled={saving || !canEdit}>{saving ? "Salvando…" : "Salvar"}</Button>
              </Can>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
