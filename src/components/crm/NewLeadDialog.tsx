import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2 } from "lucide-react";
import { toast } from "sonner";

const ORIGENS = [
  { id: "site", label: "Site" },
  { id: "indicacao", label: "Indicação" },
  { id: "ativo", label: "Prospecção ativa" },
  { id: "email", label: "E-mail" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "outro", label: "Outro" },
];

export function NewLeadDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const empty = {
    empresa: "", cliente_id: "" as string | "",
    contato_nome: "", contato_email: "", contato_tel: "",
    tema_evento: "", data_pretendida: "", cidade_evento: "",
    formato: "", orcamento_est: "", origem: "ativo", descricao: "",
  };
  const [form, setForm] = useState(empty);
  const [showSugg, setShowSugg] = useState(false);

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-search", form.empresa],
    enabled: open && form.empresa.length >= 2 && !form.cliente_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id,razao_social,nome_fantasia")
        .or(`razao_social.ilike.%${form.empresa}%,nome_fantasia.ilike.%${form.empresa}%`)
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => { if (!open) { setForm(empty); setShowSugg(false); } /* eslint-disable-next-line */ }, [open]);

  const criar = useMutation({
    mutationFn: async () => {
      if (!form.empresa) throw new Error("Empresa é obrigatória");
      const payload: any = {
        empresa: form.empresa,
        cliente_id: form.cliente_id || null,
        contato_nome: form.contato_nome || null,
        contato_email: form.contato_email || null,
        contato_tel: form.contato_tel || null,
        tema_evento: form.tema_evento || null,
        data_pretendida: form.data_pretendida || null,
        cidade_evento: form.cidade_evento || null,
        formato: form.formato || null,
        orcamento_est: form.orcamento_est ? Number(form.orcamento_est) : null,
        origem: form.origem || "ativo",
        descricao: form.descricao || null,
        etapa: "contato_recebido",
      };
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead criado");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const pickCliente = (c: any) => {
    setForm((f) => ({ ...f, cliente_id: c.id, empresa: c.nome_fantasia || c.razao_social }));
    setShowSugg(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1.5" /> Novo Atendimento</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Novo atendimento</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1 relative">
            <Label className="text-xs">Empresa *</Label>
            <Input
              value={form.empresa}
              onChange={(e) => { setForm({ ...form, empresa: e.target.value, cliente_id: "" }); setShowSugg(true); }}
              onFocus={() => setShowSugg(true)}
              placeholder="Digite para buscar em clientes…"
            />
            {showSugg && clientes.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-md z-10 max-h-48 overflow-auto">
                {clientes.map((c: any) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickCliente(c)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                  >
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="truncate">{c.nome_fantasia || c.razao_social}</div>
                      {c.nome_fantasia && c.razao_social && (
                        <div className="text-[11px] text-muted-foreground truncate">{c.razao_social}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {form.cliente_id && (
              <div className="text-[11px] text-emerald-600">✓ Vinculado a cliente existente</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Contato</Label>
              <Input value={form.contato_nome} onChange={(e) => setForm({ ...form, contato_nome: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Telefone</Label>
              <Input value={form.contato_tel} onChange={(e) => setForm({ ...form, contato_tel: e.target.value })} /></div>
            <div className="space-y-1 col-span-2"><Label className="text-xs">E-mail</Label>
              <Input type="email" value={form.contato_email} onChange={(e) => setForm({ ...form, contato_email: e.target.value })} /></div>
            <div className="space-y-1 col-span-2"><Label className="text-xs">Tema do evento</Label>
              <Input value={form.tema_evento} onChange={(e) => setForm({ ...form, tema_evento: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Data pretendida</Label>
              <Input type="date" value={form.data_pretendida} onChange={(e) => setForm({ ...form, data_pretendida: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Cidade</Label>
              <Input value={form.cidade_evento} onChange={(e) => setForm({ ...form, cidade_evento: e.target.value })} /></div>
            <div className="space-y-1">
              <Label className="text-xs">Formato</Label>
              <Select value={form.formato} onValueChange={(v) => setForm({ ...form, formato: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Orçamento estimado</Label>
              <Input type="number" value={form.orcamento_est} onChange={(e) => setForm({ ...form, orcamento_est: e.target.value })} /></div>
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Origem</Label>
              <Select value={form.origem} onValueChange={(v) => setForm({ ...form, origem: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORIGENS.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Descrição</Label>
            <Textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
        </div>
        <DialogFooter><Button onClick={() => criar.mutate()} disabled={criar.isPending}>Criar atendimento</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
