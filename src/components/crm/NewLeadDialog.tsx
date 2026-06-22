import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function NewLeadDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    empresa: "", contato_nome: "", contato_email: "", contato_tel: "",
    tema_evento: "", data_pretendida: "", cidade_evento: "", descricao: "",
  });
  const reset = () => setForm({
    empresa: "", contato_nome: "", contato_email: "", contato_tel: "",
    tema_evento: "", data_pretendida: "", cidade_evento: "", descricao: "",
  });
  const criar = useMutation({
    mutationFn: async () => {
      if (!form.empresa) throw new Error("Empresa é obrigatória");
      const payload: any = { ...form, etapa: "contato_recebido", origem: "ativo" };
      if (!payload.data_pretendida) payload.data_pretendida = null;
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead criado");
      setOpen(false); reset();
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const f = (k: keyof typeof form, label: string, type = "text") => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
    </div>
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1.5" /> Novo Lead</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Novo lead</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {f("empresa", "Empresa *")}
          {f("contato_nome", "Contato")}
          {f("contato_email", "E-mail", "email")}
          {f("contato_tel", "Telefone")}
          {f("tema_evento", "Tema do evento")}
          {f("data_pretendida", "Data", "date")}
          {f("cidade_evento", "Cidade")}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Descrição</Label>
          <Textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        </div>
        <DialogFooter><Button onClick={() => criar.mutate()} disabled={criar.isPending}>Criar lead</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
