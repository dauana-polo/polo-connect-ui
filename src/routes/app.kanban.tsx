import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppTopbar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { SETORES, getSetor, type SetorKey } from "@/components/kanban/constants";
import { KanbanCard, type KanbanCardData } from "@/components/kanban/KanbanCard";
import { KanbanFilters, type Filtros, type Option } from "@/components/kanban/KanbanFilters";
import { VendaDrawer } from "@/components/vendas/VendaDrawer";

export const Route = createFileRoute("/app/kanban")({
  component: KanbanMulti,
  validateSearch: (s: Record<string, unknown>) => ({
    setor: (s.setor as string) || "pos_venda",
    venda: (s.venda as string) || undefined,
  }),
});

function KanbanMulti() {
  const { setor: setorParam, venda: vendaParam } = Route.useSearch();
  const [setor, setSetor] = useState<SetorKey>((setorParam as SetorKey) || "pos_venda");
  const [cards, setCards] = useState<KanbanCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [consultores, setConsultores] = useState<Option[]>([]);
  const [palestrantes, setPalestrantes] = useState<Option[]>([]);
  const [clientes, setClientes] = useState<Option[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    periodo: "all",
    consultor: "all",
    palestrante: "all",
    cliente: "all",
  });
  const [mobileCol, setMobileCol] = useState(0);
  const [selectedVenda, setSelectedVenda] = useState<string | null>(vendaParam ?? null);
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);
  const [notaDraft, setNotaDraft] = useState("");
  const cfg = getSetor(setor);

  // Load filter options once
  useEffect(() => {
    supabase.from("usuarios").select("id, nome").eq("perfil", "comercial").eq("ativo", true)
      .then(({ data }) => setConsultores(data ?? []));
    supabase.from("palestrantes").select("id, nome").order("nome")
      .then(({ data }) => setPalestrantes(data ?? []));
    supabase.from("clientes").select("id, nome:razao_social").order("razao_social")
      .then(({ data }) => setClientes(data ?? []));
  }, []);

  // Load cards for setor
  const loadCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kanban_cards")
      .select(
        "id, coluna, notas, vendas(id, titulo, data_evento, valor_total, status, consultor_id, palestrante_id, cliente_id, clientes(nome:razao_social), palestrantes(nome))"
      )
      .eq("setor", setor);
    if (error) toast.error("Erro ao carregar cards");
    setCards((data as unknown as KanbanCardData[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadCards();
    setMobileCol(0);
    // realtime
    const ch = supabase
      .channel(`kanban-${setor}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "kanban_cards", filter: `setor=eq.${setor}` }, () => loadCards())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setor]);

  // Open drawer if venda search param present
  useEffect(() => {
    if (vendaParam) setSelectedVenda(vendaParam);
  }, [vendaParam]);

  const filtered = useMemo(() => {
    const now = new Date();
    const dias = filtros.periodo === "all" ? null : parseInt(filtros.periodo, 10);
    return cards.filter((c) => {
      const v = c.vendas;
      if (!v) return false;
      if (filtros.consultor !== "all" && v.consultor_id !== filtros.consultor) return false;
      if (filtros.palestrante !== "all" && v.palestrante_id !== filtros.palestrante) return false;
      if (filtros.cliente !== "all" && v.cliente_id !== filtros.cliente) return false;
      if (dias != null && v.data_evento) {
        const d = new Date(v.data_evento);
        const diff = (d.getTime() - now.getTime()) / 86400000;
        if (diff < 0 || diff > dias) return false;
      }
      return true;
    });
  }, [cards, filtros]);

  const moveCard = async (cardId: string, novaColuna: string) => {
    const prev = cards;
    setCards((cs) => cs.map((c) => (c.id === cardId ? { ...c, coluna: novaColuna } : c)));
    const { error } = await supabase.from("kanban_cards").update({ coluna: novaColuna }).eq("id", cardId);
    if (error) {
      setCards(prev);
      toast.error("Erro ao mover card");
    } else {
      const lbl = cfg.colunas.find((c) => c.key === novaColuna)?.label ?? novaColuna;
      toast.success(`Card movido para ${lbl}`);
    }
  };

  const openCard = (card: KanbanCardData) => {
    setSelectedCard(card);
    setNotaDraft(card.notas ?? "");
    setSelectedVenda(card.vendas?.id ?? null);
  };

  const saveNota = async () => {
    if (!selectedCard) return;
    const { error } = await supabase.from("kanban_cards").update({ notas: notaDraft }).eq("id", selectedCard.id);
    if (error) toast.error("Erro ao salvar nota");
    else {
      toast.success("Nota salva");
      setCards((cs) => cs.map((c) => (c.id === selectedCard.id ? { ...c, notas: notaDraft } : c)));
    }
  };

  const colunasComCards = cfg.colunas.map((col) => ({
    ...col,
    items: filtered.filter((c) => c.coluna === col.key),
  }));

  return (
    <>
      <AppTopbar title="Kanban Multissetorial" breadcrumb={["Home", "Operação", "Kanban"]} />
      <div className="p-4 md:p-6 space-y-4">
        {/* Setor: tabs desktop, select mobile */}
        <div className="md:hidden">
          <Select value={setor} onValueChange={(v) => setSetor(v as SetorKey)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SETORES.map((s) => (
                <SelectItem key={s.key} value={s.key}>{s.titulo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden md:block">
          <Tabs value={setor} onValueChange={(v) => setSetor(v as SetorKey)}>
            <TabsList>
              {SETORES.map((s) => (
                <TabsTrigger key={s.key} value={s.key}>{s.titulo}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <KanbanFilters
          filtros={filtros}
          setFiltros={setFiltros}
          consultores={consultores}
          palestrantes={palestrantes}
          clientes={clientes}
        />

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <>
            {/* Mobile: uma coluna por vez */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={() => setMobileCol((c) => Math.max(0, c - 1))} disabled={mobileCol === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  {colunasComCards[mobileCol]?.label} ({colunasComCards[mobileCol]?.items.length})
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMobileCol((c) => Math.min(cfg.colunas.length - 1, c + 1))} disabled={mobileCol >= cfg.colunas.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 space-y-2 min-h-[60vh]">
                {colunasComCards[mobileCol]?.items.map((card) => (
                  <div key={card.id} className="space-y-1">
                    <KanbanCard card={card} onClick={() => openCard(card)} />
                    <Select value={card.coluna} onValueChange={(v) => moveCard(card.id, v)}>
                      <SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Mover para…" /></SelectTrigger>
                      <SelectContent>
                        {cfg.colunas.map((c) => (
                          <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {colunasComCards[mobileCol]?.items.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-8">Nenhum card</div>
                )}
              </div>
            </div>

            {/* Desktop: todas as colunas */}
            <div className="hidden md:flex gap-4 overflow-x-auto pb-2">
              {colunasComCards.map((col) => (
                <div
                  key={col.key}
                  className="bg-muted/40 rounded-xl p-3 min-h-[480px] flex-1 min-w-[240px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) moveCard(id, col.key);
                  }}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider">{col.label}</h3>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{col.items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {col.items.map((card) => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", card.id)}
                        onClick={() => openCard(card)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <VendaDrawer
        vendaId={selectedVenda}
        open={!!selectedVenda}
        onOpenChange={(o) => {
          if (!o) { setSelectedVenda(null); setSelectedCard(null); }
        }}
        onSaved={loadCards}
        extraSlot={selectedCard ? (
          <div className="border-t pt-3">
            <Label>Notas do card ({cfg.titulo})</Label>
            <Textarea rows={3} value={notaDraft} onChange={(e) => setNotaDraft(e.target.value)} />
            <div className="flex justify-end mt-2">
              <Button size="sm" variant="secondary" onClick={saveNota}>Salvar nota</Button>
            </div>
          </div>
        ) : null}
      />
    </>
  );
}
