import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatBRL } from "@/lib/crm/constants";
import {
  Star, MapPin, Landmark, FileText, Calendar, Wallet, Briefcase, Crown, Search, Plus, Pencil, Trash2,
  Eye, Images, Plane, Mic2, ImageIcon, Video, Download, Hotel, Utensils, Car, Volume2,
  Monitor, Wifi, Lightbulb, Accessibility,
} from "lucide-react";
import { Can } from "@/components/shared/Can";
import { AsyncState } from "@/components/shared/AsyncState";

export const Route = createFileRoute("/app/palestrantes")({
  head: () => ({
    meta: [
      { title: "Cadastro de Palestrantes — Polo Connect" },
      { name: "description", content: "Painel interno com cadastro, materiais, agenda, logística e informações comerciais dos palestrantes." },
      { property: "og:title", content: "Cadastro de Palestrantes — Polo Connect" },
      { property: "og:description", content: "Gestão interna dos perfis e materiais dos palestrantes da Polo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PalestrantesPage,
});

type Palestrante = {
  id: string;
  nome: string;
  nome_artistico: string | null;
  email: string;
  telefone: string | null;
  bio: string | null;
  mini_bio: string | null;
  foto_url: string | null;
  video_url: string | null;
  tipo_pessoa: "PF" | "PJ" | null;
  cpf: string | null;
  cnpj: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  insc_municipal: string | null;
  regime: string | null;
  cep: string | null; logradouro: string | null; numero: string | null; bairro: string | null;
  cidade: string | null; estado: string | null;
  banco: string | null; agencia: string | null; conta: string | null; tipo_conta: string | null; pix: string | null;
  cache_min: number | null; cache_max: number | null; cache_padrao: number | null;
  exclusivo: boolean | null;
  temas: string[] | null;
  formatos: string[] | null;
  status: string | null;
  publicar_site: boolean | null;
  total_eventos: number | null;
  avaliacao_media: number | null;
};

const emptyForm: Partial<Palestrante> = {
  nome: "", email: "", tipo_pessoa: "PJ", regime: "simples", status: "ativo",
  exclusivo: false, publicar_site: false, temas: [], formatos: [],
};

function PalestrantesPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Partial<Palestrante> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [clientVisibility, setClientVisibility] = useState<Record<string, { valor: boolean; agenda: boolean }>>({});

  const { data: lista = [], isLoading } = useQuery({
    queryKey: ["palestrantes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("palestrantes").select("*").order("nome");
      if (error) throw error;
      return (data ?? []) as Palestrante[];
    },
  });

  const filtered = useMemo(
    () => lista.filter((p) => p.nome.toLowerCase().includes(q.toLowerCase())),
    [lista, q],
  );

  const p = lista.find((x) => x.id === selectedId) ?? lista[0] ?? null;

  // Load vinculos: vendas + agenda + contratos + contas_pagar do palestrante selecionado
  const { data: vinculos } = useQuery({
    queryKey: ["palestrante-vinculos", p?.id],
    enabled: !!p,
    queryFn: async () => {
      const palestranteId = p?.id;
      if (!palestranteId) throw new Error("Selecione um palestrante.");
      const [vendas, contratos, contasPagar, documentos] = await Promise.all([
        supabase.from("vendas").select("id,titulo,data_evento,cidade,valor_total,cache_palestr,status,cliente:clientes(razao_social)").eq("palestrante_id", palestranteId).order("data_evento", { ascending: false }),
        supabase.from("contratos").select("id,numero,status,tipo,cliente:clientes(razao_social)").in("venda_id", []),
        supabase.from("contas_pagar").select("id,descricao,valor,vencimento,status").eq("palestrante_id", palestranteId).order("vencimento", { ascending: false }),
        supabase.from("documentos").select("id,nome,tipo,url,tamanho_kb,created_at").eq("palestrante_id", palestranteId).order("created_at", { ascending: false }),
      ]);
      return {
        vendas: (vendas.data ?? []) as any[],
        contratos: (contratos.data ?? []) as any[],
        contasPagar: (contasPagar.data ?? []) as any[],
        documentos: (documentos.data ?? []) as any[],
      };
    },
  });

  const vendasAtivas = (vinculos?.vendas ?? []).filter((v) => v.status !== "cancelado");
  const visibility = p ? clientVisibility[p.id] ?? { valor: false, agenda: false } : { valor: false, agenda: false };
  const setVisibility = (field: "valor" | "agenda", value: boolean) => {
    if (!p) return;
    setClientVisibility((current) => ({
      ...current,
      [p.id]: { ...(current[p.id] ?? { valor: false, agenda: false }), [field]: value },
    }));
    toast.info("Prévia atualizada somente nesta tela; nenhuma informação foi salva.");
  };

  const save = useMutation({
    mutationFn: async (form: Partial<Palestrante>) => {
      if (!form.nome || !form.email) throw new Error("Nome e e-mail são obrigatórios.");
      const payload = { ...form } as any;
      // Sanitize numbers
      ["cache_min", "cache_max", "cache_padrao"].forEach((k) => {
        if (payload[k] === "" || payload[k] === undefined) payload[k] = null;
        else if (payload[k] !== null) payload[k] = Number(payload[k]);
      });
      if (payload.id) {
        const { error } = await supabase.from("palestrantes").update(payload).eq("id", payload.id);
        if (error) throw error;
        return payload.id as string;
      } else {
        const { data, error } = await supabase.from("palestrantes").insert(payload).select("id").single();
        if (error) throw error;
        return data.id as string;
      }
    },
    onSuccess: (id) => {
      toast.success("Palestrante salvo");
      setOpenForm(false); setEditing(null);
      setSelectedId(id);
      qc.invalidateQueries({ queryKey: ["palestrantes"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("palestrantes").delete().eq("id", id);
      if (error) {
        if (error.code === "23503" || /foreign key|violates/i.test(error.message)) {
          throw new Error("Não é possível excluir: o palestrante está vinculado a vendas/propostas/contratos ativos. Cancele ou remova esses vínculos primeiro.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Palestrante removido");
      setConfirmDelete(false); setSelectedId(null);
      qc.invalidateQueries({ queryKey: ["palestrantes"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => { setEditing({ ...emptyForm }); setOpenForm(true); };
  const openEdit = () => { if (p) { setEditing({ ...p }); setOpenForm(true); } };

  return (
    <>
      <AppTopbar title="Palestrantes — Cadastro completo" breadcrumb={["Cadastros", "Palestrantes"]} />
      <div className="flex-1 overflow-auto p-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="pl-8 h-9" />
            </div>
            <Can resource="palestrantes" action="edit">
              <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" /></Button>
            </Can>
          </div>
          <AsyncState
            loading={isLoading}
            data={filtered}
            emptyTitle="Nenhum palestrante"
            emptyDescription="Cadastre o primeiro palestrante clicando em +."
          >
            {(list) => (
              <>
                {list.map((x) => (
                  <button
                    key={x.id}
                    onClick={() => setSelectedId(x.id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${p?.id === x.id ? "bg-primary/5 border-primary" : "bg-card hover:bg-muted"}`}
                  >
                    <div className="flex items-center gap-3">
                      {x.foto_url ? (
                        <img src={x.foto_url} className="h-10 w-10 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted grid place-items-center text-xs font-semibold">
                          {x.nome[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate flex items-center gap-1">
                          {x.nome}
                          {x.exclusivo && <Crown className="h-3 w-3 text-amber-500" />}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {formatBRL(x.cache_padrao ?? 0)} · ⭐ {Number(x.avaliacao_media ?? 0).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </AsyncState>
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-5">
          {!p ? (
            <Card className="p-10 text-center text-muted-foreground">
              Selecione um palestrante ou cadastre um novo.
            </Card>
          ) : (
            <>
              <Card className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {p.foto_url ? (
                      <img src={p.foto_url} alt="" className="h-20 w-20 rounded-xl ring-2 ring-border object-cover" />
                    ) : (
                      <div className="h-20 w-20 rounded-xl ring-2 ring-border bg-muted grid place-items-center text-2xl font-bold">
                        {p.nome[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold">{p.nome}</h2>
                        {p.exclusivo && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"><Crown className="h-3 w-3 mr-1" /> Exclusivo</Badge>}
                        <Badge variant="outline">{p.tipo_pessoa ?? "—"}</Badge>
                        <Badge variant="outline">{p.status ?? "—"}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{p.mini_bio ?? p.bio?.slice(0, 120)}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(p.temas ?? []).map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {Number(p.avaliacao_media ?? 0).toFixed(1)}</span>
                        <span>{p.total_eventos ?? 0} eventos</span>
                        <span>Cachê padrão: <span className="font-semibold text-foreground">{formatBRL(p.cache_padrao ?? 0)}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Can resource="palestrantes" action="edit">
                      <Button variant="outline" size="sm" onClick={openEdit}><Pencil className="h-4 w-4 mr-1" /> Editar</Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmDelete(true)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </Can>
                  </div>
                </div>
                {vendasAtivas.length > 0 && (
                  <div className="mt-4 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded p-2">
                    Este palestrante possui {vendasAtivas.length} venda(s) ativa(s). A exclusão será bloqueada.
                  </div>
                )}
              </Card>

              <Card className="border-primary/20 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Eye className="h-4 w-4" /></div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">Cliente pode visualizar</h3>
                        <Badge variant="outline">Prévia interna</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Defina quais informações comerciais poderão ser mostradas ao cliente.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
                    <VisibilityControl label="Valor do palestrante" checked={visibility.valor} onCheckedChange={(checked) => setVisibility("valor", checked)} />
                    <VisibilityControl label="Agenda do palestrante" checked={visibility.agenda} onCheckedChange={(checked) => setVisibility("agenda", checked)} />
                  </div>
                </div>
              </Card>

              <Tabs defaultValue="conteudo">
                <TabsList className="h-auto flex-wrap justify-start">
                  <TabsTrigger value="conteudo"><Eye className="h-3.5 w-3.5 mr-1" /> Perfil</TabsTrigger>
                  <TabsTrigger value="materiais"><Images className="h-3.5 w-3.5 mr-1" /> Fotos e documentos</TabsTrigger>
                  <TabsTrigger value="rider"><Mic2 className="h-3.5 w-3.5 mr-1" /> Logística e rider</TabsTrigger>
                  <TabsTrigger value="fiscal"><Landmark className="h-3.5 w-3.5 mr-1" /> Fiscal & Endereço</TabsTrigger>
                  <TabsTrigger value="bancario"><Wallet className="h-3.5 w-3.5 mr-1" /> Bancário</TabsTrigger>
                  <TabsTrigger value="comercial"><Briefcase className="h-3.5 w-3.5 mr-1" /> Comercial</TabsTrigger>
                  <TabsTrigger value="agenda"><Calendar className="h-3.5 w-3.5 mr-1" /> Agenda / Vendas</TabsTrigger>
                  <TabsTrigger value="docs"><FileText className="h-3.5 w-3.5 mr-1" /> Financeiro</TabsTrigger>
                </TabsList>

                <TabsContent value="conteudo">
                  <Card className="overflow-hidden">
                    <div className="grid lg:grid-cols-[240px_1fr]">
                      <div className="min-h-64 bg-muted">
                        {p.foto_url ? <img src={p.foto_url} alt={`Foto de ${p.nome}`} className="h-full min-h-64 w-full object-cover" /> : <div className="grid h-full min-h-64 place-items-center text-muted-foreground"><ImageIcon className="h-10 w-10" /></div>}
                      </div>
                      <div className="space-y-5 p-6">
                        <div><div className="text-xs font-semibold uppercase text-muted-foreground">Mini bio</div><p className="mt-2 text-sm leading-6">{p.mini_bio ?? "Não informada pelo palestrante."}</p></div>
                        <div><div className="text-xs font-semibold uppercase text-muted-foreground">Bio completa</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{p.bio ?? "Não informada pelo palestrante."}</p></div>
                        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                          <Field label="Nome artístico">{p.nome_artistico ?? "—"}</Field>
                          <Field label="Formatos">{(p.formatos ?? []).join(", ") || "—"}</Field>
                        </div>
                        <div><div className="text-xs font-semibold uppercase text-muted-foreground">Temas</div><div className="mt-2 flex flex-wrap gap-1.5">{(p.temas ?? []).length ? p.temas?.map((tema) => <Badge key={tema} variant="secondary">{tema}</Badge>) : <span className="text-sm text-muted-foreground">Nenhum tema informado.</span>}</div></div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="materiais">
                  <div className="space-y-4">
                    <Card className="p-5">
                      <div className="mb-4 flex items-center justify-between"><div><h4 className="font-semibold">Fotos enviadas</h4><p className="text-xs text-muted-foreground">Materiais visuais disponíveis no cadastro.</p></div><Badge variant="outline">Somente visualização</Badge></div>
                      {p.foto_url ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><div className="overflow-hidden rounded-md border"><img src={p.foto_url} alt={`Material de ${p.nome}`} className="aspect-[4/3] w-full object-cover" /><div className="p-3 text-sm font-medium">Foto principal</div></div></div> : <EmptyPanel icon={<ImageIcon className="h-6 w-6" />} title="Nenhuma foto disponível" description="As fotos enviadas pelo palestrante aparecerão aqui." />}
                    </Card>
                    <Card className="p-5">
                      <div className="mb-4 flex items-center justify-between"><div><h4 className="font-semibold">Vídeo e documentos</h4><p className="text-xs text-muted-foreground">Arquivos vinculados a este palestrante.</p></div><Badge variant="outline">{(vinculos?.documentos.length ?? 0) + (p.video_url ? 1 : 0)} item(ns)</Badge></div>
                      <div className="space-y-2">
                        {p.video_url && <MaterialRow icon={<Video className="h-4 w-4" />} name="Vídeo de apresentação" type="Vídeo" url={p.video_url} />}
                        {(vinculos?.documentos ?? []).map((documento: any) => <MaterialRow key={documento.id} icon={<FileText className="h-4 w-4" />} name={documento.nome} type={documento.tipo ?? "Documento"} url={documento.url} detail={documento.tamanho_kb ? `${documento.tamanho_kb} KB` : undefined} />)}
                        {!p.video_url && (vinculos?.documentos.length ?? 0) === 0 && <EmptyPanel icon={<FileText className="h-6 w-6" />} title="Nenhum documento disponível" description="Documentos e vídeos enviados pelo palestrante aparecerão aqui." />}
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="rider">
                  <Card className="p-5">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-semibold">Informações de logística e rider técnico</h4><p className="mt-1 text-xs text-muted-foreground">Visão interna das preferências informadas pelo palestrante.</p></div><Badge variant="outline">Somente visualização</Badge></div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <InfoPanel icon={<Plane />} title="Viagem" text="Preferências de companhia, horários e aeroporto: não informado." />
                      <InfoPanel icon={<Hotel />} title="Hospedagem" text="Categoria, quarto e necessidades de hospedagem: não informado." />
                      <InfoPanel icon={<Car />} title="Traslados" text="Preferências de transporte e deslocamento local: não informado." />
                      <InfoPanel icon={<Utensils />} title="Alimentação" text="Restrições alimentares e preferências: não informado." />
                      <InfoPanel icon={<Volume2 />} title="Áudio e microfone" text="Microfone, retorno, mesa e demais requisitos: não informado." />
                      <InfoPanel icon={<Monitor />} title="Palco e vídeo" text="Tela, projeção, palco e formato de apresentação: não informado." />
                      <InfoPanel icon={<Lightbulb />} title="Iluminação" text="Necessidades de luz e ambientação: não informado." />
                      <InfoPanel icon={<Wifi />} title="Internet" text="Conectividade e recursos online: não informado." />
                      <InfoPanel icon={<Accessibility />} title="Acessibilidade e observações" text="Acompanhantes, mobilidade e outras necessidades: não informado." />
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="fiscal">
                  <Card className="p-5 grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <Field label="Tipo">{p.tipo_pessoa ?? "—"}</Field>
                    <Field label={p.tipo_pessoa === "PJ" ? "CNPJ" : "CPF"}>{p.tipo_pessoa === "PJ" ? p.cnpj ?? "—" : p.cpf ?? "—"}</Field>
                    <Field label="Razão social">{p.razao_social ?? "—"}</Field>
                    <Field label="Nome fantasia">{p.nome_fantasia ?? "—"}</Field>
                    <Field label="Inscrição municipal">{p.insc_municipal ?? "—"}</Field>
                    <Field label="Regime tributário"><Badge variant="outline">{p.regime ?? "—"}</Badge></Field>
                    <div className="md:col-span-2 mt-3 pt-3 border-t">
                      <div className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2"><MapPin className="h-3 w-3" /> Endereço</div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Field label="CEP">{p.cep ?? "—"}</Field>
                        <Field label="Logradouro">{p.logradouro ?? "—"}</Field>
                        <Field label="Número">{p.numero ?? "—"}</Field>
                        <Field label="Bairro">{p.bairro ?? "—"}</Field>
                        <Field label="Cidade">{p.cidade ?? "—"}</Field>
                        <Field label="Estado">{p.estado ?? "—"}</Field>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="bancario">
                  <Card className="p-5 grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <Field label="Banco">{p.banco ?? "—"}</Field>
                    <Field label="Agência">{p.agencia ?? "—"}</Field>
                    <Field label="Conta">{p.conta ?? "—"}</Field>
                    <Field label="Tipo de conta">{p.tipo_conta ?? "—"}</Field>
                    <Field label="Chave PIX"><span className="font-mono">{p.pix ?? "—"}</span></Field>
                  </Card>
                </TabsContent>

                <TabsContent value="comercial">
                  <Card className="p-5 grid md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                    <Field label="Exclusivo Polo">{p.exclusivo ? <Badge className="bg-amber-500">Sim</Badge> : <Badge variant="outline">Não</Badge>}</Field>
                    <Field label="Cachê mínimo">{formatBRL(p.cache_min ?? 0)}</Field>
                    <Field label="Cachê máximo">{formatBRL(p.cache_max ?? 0)}</Field>
                    <Field label="Publicar no site">{p.publicar_site ? "Sim" : "Não"}</Field>
                    <Field label="E-mail">{p.email}</Field>
                    <Field label="Telefone">{p.telefone ?? "—"}</Field>
                    <div className="md:col-span-3">
                      <div className="text-xs text-muted-foreground mb-1">Bio</div>
                      <p className="text-sm whitespace-pre-wrap">{p.bio ?? "—"}</p>
                    </div>
                    <div className="md:col-span-3">
                      <div className="text-xs text-muted-foreground mb-2">Temas</div>
                      <div className="flex flex-wrap gap-1.5">{(p.temas ?? []).map(t => <Badge key={t}>{t}</Badge>)}</div>
                    </div>
                    <div className="md:col-span-3">
                      <div className="text-xs text-muted-foreground mb-2">Formatos</div>
                      <div className="flex flex-wrap gap-1.5">{(p.formatos ?? []).map(t => <Badge key={t} variant="outline">{t}</Badge>)}</div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="agenda">
                  <Card className="p-5">
                    <h4 className="font-semibold mb-3">Vendas / eventos vinculados ({vinculos?.vendas.length ?? 0})</h4>
                    {(vinculos?.vendas ?? []).length === 0 ? (
                      <div className="text-sm text-muted-foreground">Nenhuma venda para este palestrante.</div>
                    ) : (
                      <div className="space-y-2">
                        {vinculos!.vendas.map((v: any) => (
                          <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border">
                            <div className="text-center w-16">
                              <div className="text-[10px] text-muted-foreground">{v.data_evento?.slice(5, 7) ?? "—"}</div>
                              <div className="font-bold">{v.data_evento?.slice(8, 10) ?? "?"}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{v.titulo}</div>
                              <div className="text-xs text-muted-foreground truncate">{v.cliente?.razao_social ?? "—"} · {v.cidade ?? "—"}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">{formatBRL(v.cache_palestr)}</div>
                              <Badge variant="outline" className="text-[10px]">{v.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="docs">
                  <Card className="p-5">
                    <h4 className="font-semibold mb-3">Cachês a pagar ({vinculos?.contasPagar.length ?? 0})</h4>
                    {(vinculos?.contasPagar ?? []).length === 0 ? (
                      <div className="text-sm text-muted-foreground">Nenhum lançamento financeiro.</div>
                    ) : vinculos!.contasPagar.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between border-b py-2 last:border-0">
                        <div>
                          <div className="text-sm">{c.descricao ?? "Cachê"}</div>
                          <div className="text-xs text-muted-foreground">vence {c.vencimento ?? "—"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{formatBRL(c.valor)}</div>
                          <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

      {/* Form dialog */}
      <Dialog open={openForm} onOpenChange={(v) => { setOpenForm(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar palestrante" : "Novo palestrante"}</DialogTitle>
          </DialogHeader>
          {editing && <PalestranteForm form={editing} setForm={setEditing} />}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenForm(false)}>Cancelar</Button>
            <Button onClick={() => editing && save.mutate(editing)} disabled={save.isPending || !editing}>
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir palestrante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Se houver vendas/propostas/contratos vinculados, a exclusão será bloqueada pelo banco.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => p && del.mutate(p.id)} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase text-muted-foreground font-semibold tracking-wider mb-1">{label}</div>
      <div className="font-medium">{children}</div>
    </div>
  );
}

function VisibilityControl({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return <div className="flex min-h-14 items-center justify-between gap-3 rounded-md border bg-muted/30 px-3"><div><div className="text-sm font-medium">{label}</div><div className="text-xs text-muted-foreground">{checked ? "Liberado na prévia" : "Não liberado"}</div></div><Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} /></div>;
}

function EmptyPanel({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="grid min-h-36 place-items-center rounded-md border border-dashed p-6 text-center"><div><div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-md bg-muted text-muted-foreground">{icon}</div><div className="text-sm font-medium">{title}</div><div className="mt-1 text-xs text-muted-foreground">{description}</div></div></div>;
}

function MaterialRow({ icon, name, type, url, detail }: { icon: ReactNode; name: string; type: string; url: string; detail?: string }) {
  return <div className="flex items-center gap-3 rounded-md border p-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">{icon}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{name}</div><div className="text-xs text-muted-foreground">{type}{detail ? ` · ${detail}` : ""}</div></div><Button asChild size="icon" variant="ghost"><a href={url} target="_blank" rel="noreferrer" aria-label={`Abrir ${name}`}><Download className="h-4 w-4" /></a></Button></div>;
}

function InfoPanel({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="min-h-32 rounded-md border p-4"><div className="mb-3 flex items-center gap-2 text-primary">{icon}<span className="text-sm font-semibold text-foreground">{title}</span></div><p className="text-xs leading-5 text-muted-foreground">{text}</p></div>;
}

function PalestranteForm({
  form, setForm,
}: { form: Partial<Palestrante>; setForm: (f: Partial<Palestrante>) => void }) {
  const set = (k: keyof Palestrante, v: any) => setForm({ ...form, [k]: v });
  const csv = (arr?: string[] | null) => (arr ?? []).join(", ");
  const parseCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  return (
    <Tabs defaultValue="basic" className="mt-2">
      <TabsList className="flex-wrap">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
        <TabsTrigger value="endereco">Endereço</TabsTrigger>
        <TabsTrigger value="bancario">Bancário</TabsTrigger>
        <TabsTrigger value="comercial">Comercial</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="grid md:grid-cols-2 gap-3">
        <F label="Nome *"><Input value={form.nome ?? ""} onChange={(e) => set("nome", e.target.value)} /></F>
        <F label="Nome artístico"><Input value={form.nome_artistico ?? ""} onChange={(e) => set("nome_artistico", e.target.value)} /></F>
        <F label="E-mail *"><Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></F>
        <F label="Telefone"><Input value={form.telefone ?? ""} onChange={(e) => set("telefone", e.target.value)} /></F>
        <F label="Foto URL"><Input value={form.foto_url ?? ""} onChange={(e) => set("foto_url", e.target.value)} /></F>
        <F label="Vídeo URL"><Input value={form.video_url ?? ""} onChange={(e) => set("video_url", e.target.value)} /></F>
        <div className="md:col-span-2">
          <F label="Mini bio"><Textarea rows={2} value={form.mini_bio ?? ""} onChange={(e) => set("mini_bio", e.target.value)} /></F>
        </div>
        <div className="md:col-span-2">
          <F label="Bio completa"><Textarea rows={4} value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} /></F>
        </div>
        <F label="Status">
          <Select value={form.status ?? "ativo"} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="validacao">Em validação</SelectItem>
            </SelectContent>
          </Select>
        </F>
        <F label="Publicar no site">
          <div className="flex items-center gap-2 pt-2"><Switch checked={!!form.publicar_site} onCheckedChange={(v) => set("publicar_site", v)} /><span className="text-sm text-muted-foreground">{form.publicar_site ? "Sim" : "Não"}</span></div>
        </F>
      </TabsContent>

      <TabsContent value="fiscal" className="grid md:grid-cols-2 gap-3">
        <F label="Tipo pessoa">
          <Select value={form.tipo_pessoa ?? "PJ"} onValueChange={(v) => set("tipo_pessoa", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PF">Pessoa Física</SelectItem>
              <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </F>
        <F label="Regime tributário">
          <Select value={form.regime ?? "simples"} onValueChange={(v) => set("regime", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mei">MEI</SelectItem>
              <SelectItem value="simples">Simples Nacional</SelectItem>
              <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
              <SelectItem value="lucro_real">Lucro Real</SelectItem>
              <SelectItem value="pf">PF</SelectItem>
            </SelectContent>
          </Select>
        </F>
        <F label="CPF"><Input value={form.cpf ?? ""} onChange={(e) => set("cpf", e.target.value)} /></F>
        <F label="CNPJ"><Input value={form.cnpj ?? ""} onChange={(e) => set("cnpj", e.target.value)} /></F>
        <F label="Razão social"><Input value={form.razao_social ?? ""} onChange={(e) => set("razao_social", e.target.value)} /></F>
        <F label="Nome fantasia"><Input value={form.nome_fantasia ?? ""} onChange={(e) => set("nome_fantasia", e.target.value)} /></F>
        <F label="Inscrição municipal"><Input value={form.insc_municipal ?? ""} onChange={(e) => set("insc_municipal", e.target.value)} /></F>
      </TabsContent>

      <TabsContent value="endereco" className="grid md:grid-cols-3 gap-3">
        <F label="CEP"><Input value={form.cep ?? ""} onChange={(e) => set("cep", e.target.value)} /></F>
        <div className="md:col-span-2"><F label="Logradouro"><Input value={form.logradouro ?? ""} onChange={(e) => set("logradouro", e.target.value)} /></F></div>
        <F label="Número"><Input value={form.numero ?? ""} onChange={(e) => set("numero", e.target.value)} /></F>
        <F label="Bairro"><Input value={form.bairro ?? ""} onChange={(e) => set("bairro", e.target.value)} /></F>
        <F label="Cidade"><Input value={form.cidade ?? ""} onChange={(e) => set("cidade", e.target.value)} /></F>
        <F label="Estado"><Input value={form.estado ?? ""} onChange={(e) => set("estado", e.target.value)} /></F>
      </TabsContent>

      <TabsContent value="bancario" className="grid md:grid-cols-2 gap-3">
        <F label="Banco"><Input value={form.banco ?? ""} onChange={(e) => set("banco", e.target.value)} /></F>
        <F label="Agência"><Input value={form.agencia ?? ""} onChange={(e) => set("agencia", e.target.value)} /></F>
        <F label="Conta"><Input value={form.conta ?? ""} onChange={(e) => set("conta", e.target.value)} /></F>
        <F label="Tipo de conta">
          <Select value={form.tipo_conta ?? ""} onValueChange={(v) => set("tipo_conta", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="corrente">Corrente</SelectItem>
              <SelectItem value="poupança">Poupança</SelectItem>
            </SelectContent>
          </Select>
        </F>
        <div className="md:col-span-2"><F label="Chave PIX"><Input value={form.pix ?? ""} onChange={(e) => set("pix", e.target.value)} /></F></div>
      </TabsContent>

      <TabsContent value="comercial" className="grid md:grid-cols-3 gap-3">
        <F label="Cachê mínimo"><Input type="number" value={form.cache_min ?? ""} onChange={(e) => set("cache_min", e.target.value)} /></F>
        <F label="Cachê padrão"><Input type="number" value={form.cache_padrao ?? ""} onChange={(e) => set("cache_padrao", e.target.value)} /></F>
        <F label="Cachê máximo"><Input type="number" value={form.cache_max ?? ""} onChange={(e) => set("cache_max", e.target.value)} /></F>
        <F label="Exclusivo Polo">
          <div className="flex items-center gap-2 pt-2"><Switch checked={!!form.exclusivo} onCheckedChange={(v) => set("exclusivo", v)} /><span className="text-sm text-muted-foreground">{form.exclusivo ? "Sim" : "Não"}</span></div>
        </F>
        <div className="md:col-span-3">
          <F label="Temas (separados por vírgula)"><Input value={csv(form.temas)} onChange={(e) => set("temas", parseCsv(e.target.value))} /></F>
        </div>
        <div className="md:col-span-3">
          <F label="Formatos (separados por vírgula: presencial, online, hibrido)"><Input value={csv(form.formatos)} onChange={(e) => set("formatos", parseCsv(e.target.value))} /></F>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function F({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
