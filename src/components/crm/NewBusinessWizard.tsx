import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, ChevronLeft, ChevronRight, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/crm/constants";

type Pal = {
  id: string; nome: string; mini_bio: string | null; foto_url: string | null;
  cache_padrao: number | null; cache_min: number | null; cache_max: number | null;
  exclusivo: boolean | null; temas: string[] | null; formatos: string[] | null;
};

export function NewBusinessWizard({ lead, trigger }: { lead: any; trigger?: React.ReactNode }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [busca, setBusca] = useState("");
  const [filtroTema, setFiltroTema] = useState("");
  const [filtroFormato, setFiltroFormato] = useState("");
  const [filtroExclusivo, setFiltroExclusivo] = useState("");
  const [cacheMin, setCacheMin] = useState("");
  const [cacheMax, setCacheMax] = useState("");
  const [sel, setSel] = useState<Record<string, { justificativa: string; cache: string }>>({});
  const [titulo, setTitulo] = useState("");

  const { data: palestrantes = [] } = useQuery({
    queryKey: ["palestrantes-ativos"],
    enabled: open && step >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("palestrantes")
        .select("id,nome,mini_bio,foto_url,cache_padrao,cache_min,cache_max,exclusivo,temas,formatos")
        .eq("status", "ativo")
        .order("nome");
      if (error) throw error;
      return (data ?? []) as Pal[];
    },
  });

  const temasUnicos = useMemo(() => {
    const s = new Set<string>();
    palestrantes.forEach((p) => p.temas?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [palestrantes]);

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    const min = cacheMin ? Number(cacheMin) : null;
    const max = cacheMax ? Number(cacheMax) : null;
    return palestrantes.filter((p) => {
      if (q) {
        const hay = [p.nome, p.mini_bio, ...(p.temas ?? [])].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filtroTema && !p.temas?.includes(filtroTema)) return false;
      if (filtroFormato && !p.formatos?.includes(filtroFormato)) return false;
      if (filtroExclusivo === "sim" && !p.exclusivo) return false;
      if (filtroExclusivo === "nao" && p.exclusivo) return false;
      if (min !== null && (p.cache_padrao ?? 0) < min) return false;
      if (max !== null && (p.cache_padrao ?? 0) > max) return false;
      return true;
    });
  }, [palestrantes, busca, filtroTema, filtroFormato, filtroExclusivo, cacheMin, cacheMax]);

  const toggleSel = (p: Pal) => {
    setSel((s) => {
      if (s[p.id]) { const c = { ...s }; delete c[p.id]; return c; }
      return { ...s, [p.id]: { justificativa: "", cache: String(p.cache_padrao ?? "") } };
    });
  };

  const selecionados = Object.entries(sel);

  const criar = useMutation({
    mutationFn: async () => {
      if (selecionados.length === 0) throw new Error("Selecione ao menos 1 palestrante");
      const valor_total = selecionados.reduce((s, [, v]) => s + (Number(v.cache) || 0), 0);
      const { data: prop, error } = await supabase
        .from("propostas")
        .insert({
          lead_id: lead.id,
          cliente_id: lead.cliente_id,
          consultor_id: lead.consultor_id,
          titulo: titulo || `Proposta — ${lead.empresa}`,
          valor_total,
          status: "rascunho",
        })
        .select()
        .single();
      if (error) throw error;

      // For each selected palestrante, create a recomendacao (required FK) then proposta_palestrante
      const rows: any[] = [];
      let ordem = 0;
      for (const [palId, v] of selecionados) {
        const { data: rec, error: re } = await supabase
          .from("lead_palestrante_recomendacoes")
          .insert({
            lead_id: lead.id,
            palestrante_id: palId,
            cache_proposto: Number(v.cache) || null,
            ordem,
            status: "recomendado",
          })
          .select()
          .single();
        if (re) throw re;
        rows.push({
          proposta_id: prop.id,
          recomendacao_id: rec.id,
          palestrante_id: palId,
          cache_proposto: Number(v.cache) || null,
          justificativa: v.justificativa || null,
          ordem,
          selecionado: true,
        });
        ordem++;
      }
      const { error: e2 } = await supabase.from("proposta_palestrantes").insert(rows);
      if (e2) throw e2;

      // Move lead to proposta_enviada if still early
      if (["contato_recebido", "briefing_realizado", "recomendacao_palestrante", "consulta_palestrante"].includes(lead.etapa)) {
        await supabase.from("leads").update({ etapa: "proposta_enviada" }).eq("id", lead.id);
      }
      return prop.id;
    },
    onSuccess: () => {
      toast.success("Negócio criado com sucesso");
      setOpen(false); setStep(1); setSel({}); setTitulo(""); setBusca("");
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead", lead.id] });
      qc.invalidateQueries({ queryKey: ["lead-propostas", lead.id] });
      qc.invalidateQueries({ queryKey: ["lead-recs", lead.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setStep(1); setSel({}); } }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <Briefcase className="h-4 w-4 mr-1.5" /> Novo Negócio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Negócio — passo {step} de 3</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Confira os dados do lead antes de prosseguir.</div>
            <div className="rounded-lg border p-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Empresa</span><span className="font-medium">{lead.empresa}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tema</span><span>{lead.tema_evento ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span>{lead.data_pretendida ? new Date(lead.data_pretendida).toLocaleDateString("pt-BR") : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cidade / Formato</span><span>{[lead.cidade_evento, lead.formato].filter(Boolean).join(" · ") || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Orçamento est.</span><span>{formatBRL(lead.orcamento_est)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cliente vinculado</span><span>{lead.cliente_id ? "Sim" : "Não"}</span></div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Título da proposta (opcional)</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={`Proposta — ${lead.empresa}`} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-lg border bg-background">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input className="bg-transparent outline-none text-sm flex-1" placeholder="Buscar por nome ou tema…" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Select value={filtroTema || "all"} onValueChange={(v) => setFiltroTema(v === "all" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Tema" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos temas</SelectItem>
                  {temasUnicos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filtroFormato || "all"} onValueChange={(v) => setFiltroFormato(v === "all" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Formato" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos formatos</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroExclusivo || "all"} onValueChange={(v) => setFiltroExclusivo(v === "all" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Exclusivo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sim">Exclusivo</SelectItem>
                  <SelectItem value="nao">Não exclusivo</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Cachê mín" value={cacheMin} onChange={(e) => setCacheMin(e.target.value)} />
              <Input type="number" placeholder="Cachê máx" value={cacheMax} onChange={(e) => setCacheMax(e.target.value)} />
            </div>
            <div className="text-xs text-muted-foreground">{filtrados.length} palestrantes · {selecionados.length} selecionados</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
              {filtrados.map((p) => {
                const checked = !!sel[p.id];
                return (
                  <label key={p.id} className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                    <Checkbox checked={checked} onCheckedChange={() => toggleSel(p)} className="mt-1" />
                    {p.foto_url ? (
                      <img src={p.foto_url} alt="" className="h-12 w-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted shrink-0 grid place-items-center text-xs font-semibold">{p.nome[0]}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="font-medium text-sm truncate">{p.nome}</div>
                        {p.exclusivo && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2">{p.mini_bio}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.temas?.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-[10px] h-4 px-1.5">{t}</Badge>)}
                      </div>
                      <div className="text-xs font-medium mt-1">{formatBRL(p.cache_padrao)}</div>
                    </div>
                  </label>
                );
              })}
              {filtrados.length === 0 && <div className="text-sm text-muted-foreground text-center py-6 col-span-full">Nenhum palestrante encontrado.</div>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Para cada palestrante, explique por que recomendá-lo a este cliente.</div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {selecionados.map(([id, v]) => {
                const p = palestrantes.find((x) => x.id === id)!;
                return (
                  <div key={id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm">{p?.nome}</div>
                      <div className="flex items-center gap-2">
                        <Label className="text-[11px] text-muted-foreground">Cachê</Label>
                        <Input
                          type="number" className="h-8 w-32"
                          value={v.cache}
                          onChange={(e) => setSel((s) => ({ ...s, [id]: { ...s[id], cache: e.target.value } }))}
                        />
                      </div>
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Por que este palestrante para este cliente?"
                      value={v.justificativa}
                      onChange={(e) => setSel((s) => ({ ...s, [id]: { ...s[id], justificativa: e.target.value } }))}
                    />
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg border p-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Valor total</span>
              <span className="font-semibold">{formatBRL(selecionados.reduce((s, [, v]) => s + (Number(v.cache) || 0), 0))}</span>
            </div>
          </div>
        )}

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 2 && selecionados.length === 0}>
              Avançar <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={() => criar.mutate()} disabled={criar.isPending || selecionados.length === 0}>
              {criar.isPending ? "Criando…" : "Confirmar e criar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
