import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Plus, Building2, Contact, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { requiredString } from "@/lib/validators";

const ORIGENS = [
  { id: "site", label: "Site" },
  { id: "indicacao", label: "Indicação" },
  { id: "ativo", label: "Prospecção ativa" },
  { id: "email", label: "E-mail" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "outro", label: "Outro" },
];

const schema = z.object({
  empresa: requiredString("Empresa"),
  cliente_id: z.string(),
  contato_nome: z.string().trim().max(150),
  contato_email: z.string().trim().max(255).refine(
    (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail inválido",
  ),
  contato_tel: z.string().trim().refine(
    (v) => !v || [10, 11].includes(v.replace(/\D/g, "").length), "Telefone inválido",
  ),
  tema_evento: z.string().trim().max(200),
  data_pretendida: z.string().trim().refine(
    (v) => !v || !Number.isNaN(new Date(v).getTime()), "Data inválida",
  ),
  cidade_evento: z.string().trim().max(120),
  formato: z.string(),
  orcamento_est: z.string().trim().refine(
    (v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0), "Orçamento inválido",
  ),
  origem: z.string().min(1),
  descricao: z.string().trim().max(2000),
});

type FormValues = z.infer<typeof schema>;

export function NewLeadDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showSugg, setShowSugg] = useState(false);
  const [clienteMode, setClienteMode] = useState<"existente" | "novo">("existente");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      empresa: "", cliente_id: "", contato_nome: "", contato_email: "", contato_tel: "",
      tema_evento: "", data_pretendida: "", cidade_evento: "", formato: "",
      orcamento_est: "", origem: "ativo", descricao: "",
    },
  });
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form;
  const empresaVal = watch("empresa");
  const clienteIdVal = watch("cliente_id");

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-search", empresaVal],
    enabled: open && !!empresaVal && empresaVal.length >= 2 && !clienteIdVal,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id,razao_social,nome_fantasia")
        .or(`razao_social.ilike.%${empresaVal}%,nome_fantasia.ilike.%${empresaVal}%`)
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: contatos = [] } = useQuery({
    queryKey: ["novo-negocio-contatos", clienteIdVal],
    enabled: open && !!clienteIdVal,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cliente_contatos")
        .select("id,nome,email,telefone,cargo,principal")
        .eq("cliente_id", clienteIdVal)
        .order("principal", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => { if (!open) { reset(); setShowSugg(false); setClienteMode("existente"); } }, [open, reset]);

  const criar = useMutation({
    mutationFn: async (values: FormValues) => {
      const orc = values.orcamento_est;
      const payload = {
        empresa: values.empresa,
        cliente_id: values.cliente_id || null,
        contato_nome: values.contato_nome || null,
        contato_email: values.contato_email || null,
        contato_tel: values.contato_tel || null,
        tema_evento: values.tema_evento || null,
        data_pretendida: values.data_pretendida || null,
        cidade_evento: values.cidade_evento || null,
        formato: values.formato || null,
        orcamento_est: orc === "" || orc === undefined || orc === null ? null : Number(orc),
        origem: values.origem || "ativo",
        descricao: values.descricao || null,
        etapa: "contato_recebido" as const,
      };
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead criado");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao criar lead"),
  });

  const pickCliente = (c: any) => {
    setValue("cliente_id", c.id);
    setValue("empresa", c.nome_fantasia || c.razao_social);
    setShowSugg(false);
  };

  const pickContato = (contato: any) => {
    setValue("contato_nome", contato.nome ?? "");
    setValue("contato_email", contato.email ?? "");
    setValue("contato_tel", contato.telefone ?? "");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1.5" /> Novo negócio</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Novo negócio</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((v) => criar.mutate(v))} className="space-y-3">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <Button type="button" size="sm" variant={clienteMode === "existente" ? "default" : "ghost"} onClick={() => setClienteMode("existente")}>
              <Building2 className="h-4 w-4" /> Cliente existente
            </Button>
            <Button type="button" size="sm" variant={clienteMode === "novo" ? "default" : "ghost"} onClick={() => { setClienteMode("novo"); setValue("cliente_id", ""); setValue("empresa", ""); }}>
              <UserPlus className="h-4 w-4" /> Incluir cliente novo
            </Button>
          </div>
          <div className="space-y-1 relative">
            <Label className="text-xs">{clienteMode === "existente" ? "Buscar cliente por nome *" : "Nome do novo cliente *"}</Label>
            <Input
              {...register("empresa")}
              onChange={(e) => { setValue("empresa", e.target.value); setValue("cliente_id", ""); setShowSugg(true); }}
              onFocus={() => setShowSugg(true)}
              placeholder={clienteMode === "existente" ? "Digite para buscar em clientes…" : "Digite o nome do cliente"}
            />
            {errors.empresa && <div className="text-[11px] text-rose-500">{errors.empresa.message}</div>}
            {clienteMode === "existente" && showSugg && clientes.length > 0 && (
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
            {clienteIdVal && (
              <div className="text-[11px] text-emerald-600">✓ Vinculado a cliente existente</div>
            )}
            {clienteMode === "novo" && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Input placeholder="Telefone do cliente" />
                <Input placeholder="CNPJ opcional nesta fase" />
                <p className="col-span-2 text-[11px] text-muted-foreground">O novo cliente será incluído junto ao negócio; o CNPJ será exigido somente no fechamento.</p>
              </div>
            )}
          </div>
          {clienteIdVal && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Contatos existentes deste cliente</Label>
                <span className="text-[11px] text-muted-foreground">ou preencha um novo abaixo</span>
              </div>
              {contatos.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {contatos.map((contato: any) => (
                    <Button key={contato.id} type="button" variant="outline" className="h-auto justify-start p-3 text-left" onClick={() => pickContato(contato)}>
                      <Contact className="h-4 w-4 shrink-0" />
                      <span className="min-w-0"><span className="block truncate text-sm">{contato.nome}</span><span className="block truncate text-[11px] text-muted-foreground">{contato.cargo || contato.email || contato.telefone || "Contato cadastrado"}</span></span>
                    </Button>
                  ))}
                </div>
              ) : <p className="text-xs text-muted-foreground">Nenhum contato cadastrado. Inclua um novo contato abaixo.</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex items-center gap-2 border-t pt-3 text-sm font-medium"><UserPlus className="h-4 w-4" /> Incluir novo contato no negócio</div>
            <div className="space-y-1"><Label className="text-xs">Nome do contato</Label>
              <Input {...register("contato_nome")} placeholder="Nome" /></div>
            <div className="space-y-1"><Label className="text-xs">Telefone</Label>
              <Input {...register("contato_tel")} />
              {errors.contato_tel && <div className="text-[11px] text-rose-500">{errors.contato_tel.message}</div>}
            </div>
            <div className="space-y-1"><Label className="text-xs">Cargo</Label><Input placeholder="Cargo" /></div>
            <div className="space-y-1 col-span-2"><Label className="text-xs">E-mail</Label>
              <Input type="email" {...register("contato_email")} />
              {errors.contato_email && <div className="text-[11px] text-rose-500">{errors.contato_email.message}</div>}
            </div>
            <div className="space-y-1 col-span-2"><Label className="text-xs">Tema do evento</Label>
              <Input {...register("tema_evento")} /></div>
            <div className="space-y-1"><Label className="text-xs">Data pretendida</Label>
              <Input type="date" {...register("data_pretendida")} />
              {errors.data_pretendida && <div className="text-[11px] text-rose-500">{errors.data_pretendida.message}</div>}
            </div>
            <div className="space-y-1"><Label className="text-xs">Cidade</Label>
              <Input {...register("cidade_evento")} /></div>
            <div className="space-y-1">
              <Label className="text-xs">Formato</Label>
              <Select value={watch("formato") ?? ""} onValueChange={(v) => setValue("formato", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Orçamento estimado</Label>
              <Input type="number" {...register("orcamento_est")} />
              {errors.orcamento_est && <div className="text-[11px] text-rose-500">{errors.orcamento_est.message as string}</div>}
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Origem</Label>
              <Select value={watch("origem")} onValueChange={(v) => setValue("origem", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORIGENS.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Descrição</Label>
            <Textarea rows={3} {...register("descricao")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={criar.isPending}>Criar negócio</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
