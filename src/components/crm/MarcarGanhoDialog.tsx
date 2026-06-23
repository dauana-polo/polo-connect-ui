import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/crm/constants";

export function MarcarGanhoDialog({ lead, trigger }: { lead: any; trigger?: React.ReactNode }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Record<string, boolean>>({});

  const { data: proposta } = useQuery({
    queryKey: ["lead-ultima-proposta", lead.id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("propostas")
        .select("*, proposta_palestrantes(*, palestrante:palestrantes(id,nome,foto_url))")
        .eq("lead_id", lead.id)
        .order("versao", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const palestrantes = (proposta?.proposta_palestrantes ?? []) as any[];

  const total = useMemo(
    () => palestrantes.filter((pp) => sel[pp.id]).reduce((s, pp) => s + (Number(pp.cache_proposto) || 0), 0),
    [palestrantes, sel],
  );

  const confirmar = useMutation({
    mutationFn: async () => {
      if (!proposta) throw new Error("Crie uma proposta antes de marcar como ganho.");
      if (!lead.cliente_id) throw new Error("Vincule um cliente ao lead antes.");
      const escolhidos = palestrantes.filter((pp) => sel[pp.id]);
      if (escolhidos.length === 0) throw new Error("Selecione ao menos 1 palestrante.");

      // Insert 1 venda per selected palestrante; triggers create kanban_cards + logistica + nps automatically
      const rows = escolhidos.map((pp: any) => ({
        proposta_id: proposta.id,
        lead_id: lead.id,
        cliente_id: lead.cliente_id,
        palestrante_id: pp.palestrante_id,
        consultor_id: lead.consultor_id,
        titulo: `${proposta.titulo} — ${pp.palestrante?.nome ?? ""}`.trim(),
        data_evento: lead.data_pretendida,
        cidade: lead.cidade_evento,
        formato: lead.formato,
        publico_estimado: lead.publico_estimado,
        briefing: lead.descricao,
        valor_total: Number(pp.cache_proposto) || 0,
        cache_palestr: Number(pp.cache_proposto) || 0,
      }));
      const { error } = await supabase.from("vendas").insert(rows);
      if (error) throw error;

      // Mark lead as ganho (trigger detects existing vendas and skips auto-create)
      const { error: e2 } = await supabase
        .from("leads")
        .update({ etapa: "ganho", convertido: true })
        .eq("id", lead.id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success(`Venda(s) criada(s) e operação iniciada!`);
      setOpen(false); setSel({});
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead", lead.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Trophy className="h-4 w-4 mr-1.5" /> Marcar Ganho
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Marcar como ganho</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {!proposta ? (
            <div className="text-sm text-muted-foreground rounded border bg-amber-50 border-amber-200 p-3">
              Nenhuma proposta encontrada para este lead. Crie uma antes.
            </div>
          ) : palestrantes.length === 0 ? (
            <div className="text-sm text-muted-foreground">A proposta não tem palestrantes.</div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                Marque os palestrantes contratados — cada um vira 1 venda + cards nos Kanbans operacionais.
              </div>
              <div className="space-y-1.5">
                {palestrantes.map((pp: any) => (
                  <label key={pp.id} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                    <Checkbox
                      checked={!!sel[pp.id]}
                      onCheckedChange={(v) => setSel((s) => ({ ...s, [pp.id]: !!v }))}
                    />
                    {pp.palestrante?.foto_url ? (
                      <img src={pp.palestrante.foto_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted grid place-items-center text-xs font-semibold">
                        {pp.palestrante?.nome?.[0] ?? "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{pp.palestrante?.nome}</div>
                    </div>
                    <div className="text-sm font-semibold">{formatBRL(pp.cache_proposto)}</div>
                  </label>
                ))}
              </div>
              <div className="rounded-lg border p-3 flex justify-between bg-emerald-50 border-emerald-200">
                <span className="text-sm font-medium">Total acumulado</span>
                <span className="font-semibold text-emerald-700">{formatBRL(total)}</span>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => confirmar.mutate()}
            disabled={confirmar.isPending || !proposta || Object.values(sel).filter(Boolean).length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {confirmar.isPending ? "Processando…" : "Confirmar fechamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
