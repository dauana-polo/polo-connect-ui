import { createFileRoute } from "@tanstack/react-router";
import { forwardRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Mail, Phone, FileText, Calendar, TrendingUp, Search, Loader2, CheckCircle2, Plus, MapPin, Trash2 } from "lucide-react";
import { Can } from "@/components/shared/Can";
import { AsyncState } from "@/components/shared/AsyncState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { requiredString, optionalEmail, phoneSchema, cnpjSchema, cepSchema } from "@/lib/validators";

export const Route = createFileRoute("/app/clientes")({ component: ClientesPage });

const BRL = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function ClientesPage() {
  const qc = useQueryClient();
  const { can } = usePermissions();
  const canEdit = can("clientes", "edit");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busca, setBusca] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: clientes = [], isLoading, error, refetch } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes")
        .select("*").order("razao_social");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = clientes.filter((c: any) =>
    !busca || `${c.razao_social} ${c.nome_fantasia ?? ""} ${c.cnpj ?? ""}`.toLowerCase().includes(busca.toLowerCase())
  );
  const current = clientes.find((c: any) => c.id === selectedId) ?? filtered[0];

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cliente excluído");
      setConfirmDelete(null);
      setSelectedId(null);
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao excluir. Verifique se há leads/vendas vinculados."),
  });

  const { data: contatos = [] } = useQuery({
    queryKey: ["cliente-contatos", current?.id],
    enabled: !!current?.id,
    queryFn: async () => {
      const { data } = await supabase.from("cliente_contatos").select("*").eq("cliente_id", current!.id);
      return data ?? [];
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["cliente-leads", current?.id],
    enabled: !!current?.id,
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("id,empresa,etapa,orcamento_est,created_at").eq("cliente_id", current!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ["cliente-vendas", current?.id],
    enabled: !!current?.id,
    queryFn: async () => {
      const { data } = await supabase.from("vendas").select("id,titulo,data_evento,valor_total,status,palestrantes(nome)").eq("cliente_id", current!.id).order("data_evento", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <>
      <AppTopbar title="Clientes — Cadastro 360°" breadcrumb={["Cadastros", "Clientes"]} />
      <div className="flex-1 overflow-auto p-4 md:p-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-2">
          <Can resource="clientes" action="edit">
            <Button className="w-full" onClick={() => { setShowNew(true); setSelectedId(null); }}><Plus className="h-4 w-4" /> Novo cliente</Button>
          </Can>
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg border bg-card">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Buscar…" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <div className="text-xs uppercase font-semibold text-muted-foreground px-2 mt-3 mb-1">Base ({clientes.length})</div>
          <AsyncState
            loading={isLoading}
            error={error}
            data={filtered}
            onRetry={() => refetch()}
            loadingLabel="Carregando clientes…"
            emptyTitle={busca ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          >
            {(list) => (
              <div className="space-y-1.5 max-h-[70vh] overflow-y-auto">
                {list.map((x: any) => (
                  <button
                    key={x.id}
                    onClick={() => { setSelectedId(x.id); setShowNew(false); setEditing(false); }}
                    className={`w-full text-left p-3 rounded-lg border transition ${current?.id === x.id && !showNew ? "bg-primary/5 border-primary" : "bg-card hover:bg-muted"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-white font-bold text-sm">
                        {(x.razao_social ?? "?")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{x.nome_fantasia || x.razao_social}</div>
                        <div className="text-xs text-muted-foreground truncate">{x.segmento ?? "—"} · {BRL(x.total_gasto)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </AsyncState>
        </div>

        <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-4">
          {showNew && canEdit ? (
            <NovoClienteForm onClose={() => setShowNew(false)} onSaved={(id) => { setShowNew(false); setSelectedId(id); qc.invalidateQueries({ queryKey: ["clientes"] }); }} />
          ) : editing && current && canEdit ? (
            <NovoClienteForm
              initial={current}
              onClose={() => setEditing(false)}
              onSaved={(id) => { setEditing(false); setSelectedId(id); qc.invalidateQueries({ queryKey: ["clientes"] }); }}
            />
          ) : current ? (
            <>
              <Card className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-white text-xl font-bold">
                      {(current.razao_social ?? "?")[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold">{current.nome_fantasia || current.razao_social}</h2>
                        <Badge className={current.ativo ? "bg-emerald-500" : "bg-muted"}>{current.ativo ? "Ativo" : "Inativo"}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{current.segmento ?? "—"} · CNPJ {current.cnpj ?? "—"}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        {current.contato_email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {current.contato_email}</span>}
                        {current.contato_tel && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {current.contato_tel}</span>}
                      </div>
                    </div>
                  </div>
                  <Can resource="clientes" action="edit">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setConfirmDelete(current.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </div>
                  </Can>
                </div>
              </Card>


              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Total gasto</div><div className="text-xl font-bold mt-1">{BRL(current.total_gasto)}</div></Card>
                <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Eventos</div><div className="text-xl font-bold mt-1">{current.total_eventos ?? 0}</div></Card>
                <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Leads</div><div className="text-xl font-bold mt-1">{leads.length}</div></Card>
                <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Vendas</div><div className="text-xl font-bold mt-1">{vendas.length}</div></Card>
              </div>

              <Tabs defaultValue="info">
                <TabsList className="flex-wrap">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="contatos">Contatos ({contatos.length})</TabsTrigger>
                  <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
                  <TabsTrigger value="vendas">Vendas ({vendas.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                  <Card className="p-5 grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <Field label="Razão social">{current.razao_social}</Field>
                    <Field label="Nome fantasia">{current.nome_fantasia ?? "—"}</Field>
                    <Field label="CNPJ"><span className="font-mono">{current.cnpj ?? "—"}</span></Field>
                    <Field label="Segmento">{current.segmento ?? "—"}</Field>
                    <div className="md:col-span-2 pt-3 border-t">
                      <div className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2"><MapPin className="h-3 w-3" /> Endereço</div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Field label="CEP">{current.cep ?? "—"}</Field>
                        <Field label="Logradouro">{current.logradouro ?? "—"}</Field>
                        <Field label="Bairro">{current.bairro ?? "—"}</Field>
                        <Field label="Cidade">{current.cidade ?? "—"}</Field>
                        <Field label="Estado">{current.estado ?? "—"}</Field>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="contatos">
                  <Card className="p-5">
                    <div className="grid md:grid-cols-2 gap-3">
                      {contatos.length === 0 && <div className="text-sm text-muted-foreground col-span-full">Nenhum contato adicional</div>}
                      {contatos.map((ct: any) => (
                        <div key={ct.id} className="p-3 rounded-lg border">
                          <div className="font-semibold text-sm">{ct.nome}</div>
                          <div className="text-xs text-muted-foreground">{ct.cargo ?? "—"}</div>
                          <div className="mt-2 text-xs space-y-0.5 text-muted-foreground">
                            {ct.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {ct.email}</div>}
                            {ct.telefone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {ct.telefone}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="leads">
                  <Card className="p-5 space-y-2">
                    {leads.length === 0 && <div className="text-sm text-muted-foreground">Nenhum lead registrado.</div>}
                    {leads.map((l: any) => (
                      <div key={l.id} className="flex items-center justify-between p-3 rounded border">
                        <div>
                          <div className="text-sm font-medium">{l.empresa}</div>
                          <div className="text-xs text-muted-foreground">Criado {new Date(l.created_at).toLocaleDateString("pt-BR")}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{BRL(l.orcamento_est)}</div>
                          <Badge variant="outline" className="text-[10px]">{l.etapa}</Badge>
                        </div>
                      </div>
                    ))}
                  </Card>
                </TabsContent>

                <TabsContent value="vendas">
                  <Card className="p-5 space-y-2">
                    {vendas.length === 0 && <div className="text-sm text-muted-foreground">Nenhuma venda ainda.</div>}
                    {vendas.map((v: any) => (
                      <div key={v.id} className="flex items-center justify-between p-3 rounded border">
                        <div>
                          <div className="text-sm font-medium">{v.titulo ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{v.palestrantes?.nome ?? "—"} · {v.data_evento ? new Date(v.data_evento).toLocaleDateString("pt-BR") : "sem data"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{BRL(v.valor_total)}</div>
                          <Badge variant="outline" className="text-[10px]">{v.status ?? "—"}</Badge>
                        </div>
                      </div>
                    ))}
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card className="p-12 text-center text-sm text-muted-foreground">
              {clientes.length === 0 ? "Nenhum cliente cadastrado. Comece criando um novo." : "Selecione um cliente ao lado ou crie um novo."}
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title="Excluir cliente?"
        description="Esta ação é permanente. Não será possível se houver leads, propostas ou vendas vinculadas."
        destructive
        confirmLabel="Excluir"
        onConfirm={() => { if (confirmDelete) excluir.mutate(confirmDelete); }}
      />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

type Lookup = {
  razao_social?: string; nome_fantasia?: string; cep?: string; logradouro?: string; numero?: string;
  bairro?: string; municipio?: string; uf?: string; descricao_situacao_cadastral?: string;
};

const clienteSchema = z.object({
  cnpj: cnpjSchema.optional().or(z.literal("")),
  razao_social: requiredString("Razão social"),
  nome_fantasia: z.string().trim().optional(),
  segmento: z.string().trim().optional(),
  cep: cepSchema.optional().or(z.literal("")),
  logradouro: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  estado: z.string().trim().max(2, "Use a sigla (2 letras)").optional(),
  contato_nome: z.string().trim().optional(),
  contato_email: optionalEmail,
  contato_tel: phoneSchema.optional().or(z.literal("")),
});
type ClienteForm = z.infer<typeof clienteSchema>;

function NovoClienteForm({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const form = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      cnpj: "", razao_social: "", nome_fantasia: "", segmento: "",
      cep: "", logradouro: "", bairro: "", cidade: "", estado: "",
      contato_nome: "", contato_email: "", contato_tel: "",
    },
  });

  const salvar = useMutation({
    mutationFn: async (values: ClienteForm) => {
      const payload = {
        razao_social: values.razao_social,
        nome_fantasia: values.nome_fantasia || null,
        segmento: values.segmento || null,
        cnpj: values.cnpj ? values.cnpj.replace(/\D/g, "") : null,
        cep: values.cep || null,
        logradouro: values.logradouro || null,
        bairro: values.bairro || null,
        cidade: values.cidade || null,
        estado: values.estado || null,
        contato_nome: values.contato_nome || null,
        contato_email: values.contato_email || null,
        contato_tel: values.contato_tel || null,
      };
      const { data, error } = await supabase.from("clientes").insert(payload).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => { toast.success("Cliente criado"); onSaved(id); },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar"),
  });

  async function consultar() {
    const clean = (form.getValues("cnpj") ?? "").replace(/\D/g, "");
    if (clean.length !== 14) { setErr("CNPJ deve ter 14 dígitos"); return; }
    setErr(null); setLoading(true);
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      if (!r.ok) throw new Error();
      const j: Lookup = await r.json();
      form.setValue("razao_social", j.razao_social ?? form.getValues("razao_social"), { shouldValidate: true });
      form.setValue("nome_fantasia", j.nome_fantasia ?? form.getValues("nome_fantasia"));
      form.setValue("cep", j.cep ?? form.getValues("cep"));
      form.setValue("logradouro", j.logradouro ?? form.getValues("logradouro"));
      form.setValue("bairro", j.bairro ?? form.getValues("bairro"));
      form.setValue("cidade", j.municipio ?? form.getValues("cidade"));
      form.setValue("estado", j.uf ?? form.getValues("estado"));
    } catch {
      setErr("Falha na consulta. Preencha manualmente.");
    } finally { setLoading(false); }
  }

  const showLoaded = !!form.watch("razao_social");
  const errors = form.formState.errors;

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h3 className="font-semibold text-lg">Novo cliente</h3><p className="text-xs text-muted-foreground">Consulta automática via BrasilAPI</p></div>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
      </div>

      <form onSubmit={form.handleSubmit((v) => salvar.mutate(v))} className="space-y-5">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label>CNPJ</Label>
            <Input {...form.register("cnpj")} placeholder="00.000.000/0001-00" />
            {errors.cnpj && <p className="text-xs text-rose-500 mt-1">{errors.cnpj.message}</p>}
          </div>
          <Button type="button" onClick={consultar} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Consultar
          </Button>
        </div>
        {err && <div className="text-xs text-rose-500">{err}</div>}
        {showLoaded && (
          <div className="rounded-lg border-2 border-emerald-500/30 bg-emerald-500/5 p-2 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dados carregados. Revise antes de salvar.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <FieldRegister label="Razão social *" error={errors.razao_social?.message} {...form.register("razao_social")} />
          <FieldRegister label="Nome fantasia" {...form.register("nome_fantasia")} />
          <FieldRegister label="Segmento" {...form.register("segmento")} />
          <FieldRegister label="CEP" error={errors.cep?.message} {...form.register("cep")} />
          <FieldRegister label="Logradouro" {...form.register("logradouro")} />
          <FieldRegister label="Bairro" {...form.register("bairro")} />
          <FieldRegister label="Cidade" {...form.register("cidade")} />
          <FieldRegister label="Estado (UF)" error={errors.estado?.message} {...form.register("estado")} />
          <FieldRegister label="Contato — Nome" {...form.register("contato_nome")} />
          <FieldRegister label="Contato — E-mail" error={errors.contato_email?.message} {...form.register("contato_email")} />
          <FieldRegister label="Contato — Telefone" error={errors.contato_tel?.message} {...form.register("contato_tel")} />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={salvar.isPending}>
            {salvar.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Salvar cliente
          </Button>
        </div>
      </form>
    </Card>
  );
}

const FieldRegister = forwardRef<
  HTMLInputElement,
  { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>
>(function FieldRegister({ label, error, ...rest }, ref) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input ref={ref} {...rest} />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
});
