import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/crm/constants";

export function MarcarGanhoDialog({
  lead, trigger, open: openProp, onOpenChange,
}: { lead: any; trigger?: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (v: boolean) => { onOpenChange ? onOpenChange(v) : setOpenState(v); };
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [motivosPerda, setMotivosPerda] = useState<Record<string, string>>({});

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
  const naoEscolhidos = palestrantes.filter((pp) => !sel[pp.id]);
  const perdasPreenchidas = naoEscolhidos.every((pp) => (motivosPerda[pp.id] ?? "").trim().length > 0);

  const { data: cliente } = useQuery({
    queryKey: ["cliente-fechamento", lead.cliente_id],
    enabled: open && !!lead.cliente_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("id,cnpj").eq("id", lead.cliente_id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const total = useMemo(
    () => palestrantes.filter((pp) => sel[pp.id]).reduce((s, pp) => s + (Number(pp.cache_proposto) || 0), 0),
    [palestrantes, sel],
  );

  const confirmar = useMutation({
    mutationFn: async () => {
      if (!proposta) throw new Error("Crie uma proposta antes de marcar como ganho.");
      if (!lead.cliente_id) throw new Error("Vincule um cliente ao lead antes de fechar a venda.");
      if (!cliente?.cnpj) throw new Error("Complete o CNPJ do cliente antes de fechar a venda.");
      if (!lead.data_pretendida) throw new Error("Defina a data pretendida do evento antes de fechar.");
      const escolhidos = palestrantes.filter((pp) => sel[pp.id]);
      if (escolhidos.length === 0) throw new Error("Selecione ao menos 1 palestrante recomendado.");
      if (!perdasPreenchidas) throw new Error("Informe o motivo da perda para todos os palestrantes não escolhidos.");
      const semCache = escolhidos.filter((pp: any) => !pp.cache_proposto || Number(pp.cache_proposto) <= 0);
      if (semCache.length > 0) {
        const nomes = semCache.map((pp: any) => pp.palestrante?.nome ?? "palestrante").join(", ");
        throw new Error(`Defina o cachê proposto na proposta para: ${nomes}.`);
      }

      // Conflict check: same palestrante, same data_evento, status != cancelado
      const ids = escolhidos.map((pp: any) => pp.palestrante_id);
      const { data: conflitos, error: eConf } = await supabase
        .from("vendas")
        .select("palestrante_id, palestrantes(nome)")
        .in("palestrante_id", ids)
        .eq("data_evento", lead.data_pretendida)
        .neq("status", "cancelado");
      if (eConf) throw eConf;
      if (conflitos && conflitos.length > 0) {
        const nomes = Array.from(new Set(conflitos.map((c: any) => c.palestrantes?.nome).filter(Boolean))).join(", ");
        throw new Error(`Conflito de agenda em ${lead.data_pretendida}: ${nomes || "palestrante"} já possui evento nesta data.`);
      }

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
       toast.success(`Venda(s) criada(s) e operação iniciada! Motivos de perda validados neste protótipo.`);
      setOpen(false); setSel({}); setMotivosPerda({});
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead", lead.id] });
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["kanban"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Trophy className="h-4 w-4 mr-1.5" /> Marcar Ganho
            </Button>
          )}
        </DialogTrigger>
      )}
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
                Selecione quem foi contratado. Para concluir, o cliente precisa ter CNPJ e cada palestrante não escolhido precisa ter um motivo de perda.
              </div>
              {!cliente?.cnpj && (
                <div className="rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  O cliente está sem CNPJ. Complete o cadastro antes do fechamento.
                </div>
              )}
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
              {Object.values(sel).some(Boolean) && naoEscolhidos.length > 0 && (
                <div className="space-y-3 rounded-lg border p-3">
                  <div className="text-sm font-medium">Motivos obrigatórios dos não escolhidos</div>
                  {naoEscolhidos.map((pp: any) => (
                    <div key={pp.id} className="space-y-1">
                      <Label className="text-xs">{pp.palestrante?.nome ?? "Palestrante"}</Label>
                      <Textarea
                        rows={2}
                        placeholder="Informe por que a indicação não foi fechada"
                        value={motivosPerda[pp.id] ?? ""}
                        onChange={(event) => setMotivosPerda((current) => ({ ...current, [pp.id]: event.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}
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
            disabled={confirmar.isPending || !proposta || !cliente?.cnpj || Object.values(sel).filter(Boolean).length === 0 || !perdasPreenchidas}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {confirmar.isPending ? "Processando…" : "Confirmar fechamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
