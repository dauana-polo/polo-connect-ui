import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileDown,
  FileText,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  Send,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppTopbar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/consultas")({
  head: () => ({
    meta: [
      { title: "Consulta e Negociação — Polo Palestrantes" },
      { name: "description", content: "Protótipo do fluxo de consulta e negociação com palestrantes." },
      { property: "og:title", content: "Consulta e Negociação — Polo Palestrantes" },
      { property: "og:description", content: "Protótipo do fluxo de consulta e negociação com palestrantes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsultasPrototype,
});

type ConsultationStatus = "nova" | "contato" | "disponivel" | "indisponivel" | "concluida";

type Speaker = {
  id: string;
  nome: string;
  tema: string;
  cache: string;
  status: ConsultationStatus;
  initials: string;
};

type Consultation = {
  id: string;
  cliente: string;
  evento: string;
  data: string;
  cidade: string;
  comercial: string;
  prioridade: string;
  status: ConsultationStatus;
  speakers: Speaker[];
};

const STATUS: Array<{ id: ConsultationStatus; label: string; icon: typeof Clock3 }> = [
  { id: "nova", label: "Novas solicitações", icon: Sparkles },
  { id: "contato", label: "Em contato", icon: Phone },
  { id: "disponivel", label: "Disponíveis", icon: CheckCircle2 },
  { id: "indisponivel", label: "Indisponíveis", icon: XCircle },
  { id: "concluida", label: "Concluídas", icon: Trophy },
];

const CONSULTAS: Consultation[] = [
  {
    id: "CON-1048",
    cliente: "Nexa Tecnologia",
    evento: "Convenção Liderança 2026",
    data: "18 nov 2026",
    cidade: "São Paulo, SP",
    comercial: "Marina Costa",
    prioridade: "Alta",
    status: "nova",
    speakers: [
      { id: "sp1", nome: "Camila Farani", tema: "Inovação e liderança", cache: "R$ 48.000", status: "nova", initials: "CF" },
      { id: "sp2", nome: "Arthur Igreja", tema: "Futuro e tecnologia", cache: "R$ 42.000", status: "nova", initials: "AI" },
      { id: "sp3", nome: "Tallis Gomes", tema: "Empreendedorismo", cache: "R$ 38.000", status: "nova", initials: "TG" },
    ],
  },
  {
    id: "CON-1047",
    cliente: "Grupo Horizonte",
    evento: "Encontro Nacional de Vendas",
    data: "04 dez 2026",
    cidade: "Curitiba, PR",
    comercial: "Rafael Nunes",
    prioridade: "Média",
    status: "contato",
    speakers: [
      { id: "sp4", nome: "Martha Gabriel", tema: "Transformação digital", cache: "R$ 36.000", status: "contato", initials: "MG" },
      { id: "sp5", nome: "Gustavo Caetano", tema: "Cultura de inovação", cache: "R$ 34.000", status: "disponivel", initials: "GC" },
    ],
  },
  {
    id: "CON-1046",
    cliente: "Instituto Aurora",
    evento: "Fórum de Pessoas",
    data: "26 out 2026",
    cidade: "Belo Horizonte, MG",
    comercial: "Marina Costa",
    prioridade: "Alta",
    status: "disponivel",
    speakers: [
      { id: "sp6", nome: "Rossandro Klinjey", tema: "Saúde emocional", cache: "R$ 45.000", status: "disponivel", initials: "RK" },
      { id: "sp7", nome: "Ana Paula Padrão", tema: "Diversidade e carreira", cache: "R$ 52.000", status: "indisponivel", initials: "AP" },
    ],
  },
  {
    id: "CON-1045",
    cliente: "Lumina Energia",
    evento: "Semana da Segurança",
    data: "09 out 2026",
    cidade: "Recife, PE",
    comercial: "João Vitor",
    prioridade: "Normal",
    status: "indisponivel",
    speakers: [
      { id: "sp8", nome: "Amyr Klink", tema: "Risco e planejamento", cache: "R$ 58.000", status: "indisponivel", initials: "AK" },
    ],
  },
  {
    id: "CON-1044",
    cliente: "Mobi Bank",
    evento: "Leadership Summit",
    data: "20 set 2026",
    cidade: "Rio de Janeiro, RJ",
    comercial: "Marina Costa",
    prioridade: "Normal",
    status: "concluida",
    speakers: [
      { id: "sp9", nome: "Walter Longo", tema: "Liderança exponencial", cache: "R$ 44.000", status: "concluida", initials: "WL" },
    ],
  },
];

const PEOPLE = ["Marina Costa", "Rafael Nunes", "Bianca Souza"];
const CLIENTS = [
  { id: "cl1", name: "Nexa Tecnologia", phone: "(11) 98765-4321", cnpj: "12.345.678/0001-90" },
  { id: "cl2", name: "Nexa Consultoria", phone: "(11) 3022-4455", cnpj: "" },
  { id: "cl3", name: "Nexar Eventos", phone: "(21) 99872-1040", cnpj: "48.210.765/0001-12" },
];

function statusLabel(status: ConsultationStatus) {
  return STATUS.find((item) => item.id === status)?.label ?? status;
}

function statusBadge(status: ConsultationStatus) {
  if (status === "disponivel" || status === "concluida") return "bg-success/15 text-success border-success/30";
  if (status === "indisponivel") return "bg-destructive/10 text-destructive border-destructive/25";
  if (status === "contato") return "bg-info/10 text-info border-info/25";
  return "bg-warning/15 text-warning-foreground border-warning/30";
}

function ConsultasPrototype() {
  const [tab, setTab] = useState("consultas");
  const [filter, setFilter] = useState<ConsultationStatus | "todas">("todas");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Consultation | null>(null);

  const filtered = useMemo(() => CONSULTAS.filter((item) => {
    const matchesStatus = filter === "todas" || item.status === filter;
    const text = `${item.cliente} ${item.evento} ${item.comercial}`.toLowerCase();
    return matchesStatus && text.includes(search.toLowerCase());
  }), [filter, search]);

  return (
    <>
      <AppTopbar title="Consulta / Negociação" breadcrumb={["Produtividade", "Consulta / Negociação"]} />
      <main className="flex-1 overflow-auto p-4 md:p-6 space-y-5">
        <div className="flex flex-col gap-3 border-b pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">Protótipo</Badge>
              <span className="text-xs text-muted-foreground">Dados fictícios · nenhuma ação será salva</span>
            </div>
            <h2 className="text-2xl font-semibold">Central de consultas</h2>
            <p className="mt-1 text-sm text-muted-foreground">Da indicação ao retorno do palestrante, com visibilidade para o comercial.</p>
          </div>
          <Button onClick={() => toast.success("Solicitação demonstrativa enviada para o setor de consultas.")}>
            <Send className="h-4 w-4" /> Nova solicitação
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-5">
          <TabsList className="h-auto w-full justify-start overflow-x-auto bg-transparent p-0">
            <TabsTrigger value="consultas">Painel de consultas</TabsTrigger>
            <TabsTrigger value="documentos">Recomendação e proposta</TabsTrigger>
            <TabsTrigger value="cliente">Cliente e contato</TabsTrigger>
            <TabsTrigger value="fechamento">Fechamento</TabsTrigger>
          </TabsList>

          <TabsContent value="consultas" className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {STATUS.map(({ id, label, icon: Icon }) => {
                const count = CONSULTAS.filter((item) => item.status === id).length;
                return (
                  <button key={id} type="button" onClick={() => setFilter(filter === id ? "todas" : id)} className={`rounded-md border bg-card p-4 text-left transition-colors hover:border-primary/40 ${filter === id ? "border-primary ring-1 ring-primary/20" : ""}`}>
                    <div className="flex items-center justify-between"><Icon className="h-4 w-4 text-muted-foreground" /><span className="text-2xl font-semibold">{count}</span></div>
                    <div className="mt-3 text-xs font-medium">{label}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex h-10 flex-1 items-center gap-2 rounded-md border bg-card px-3 sm:max-w-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Buscar cliente, evento ou comercial…" />
              </div>
              {filter !== "todas" && <Button variant="ghost" onClick={() => setFilter("todas")}>Limpar filtro</Button>}
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filtered.map((item) => (
                    <button key={item.id} type="button" onClick={() => setSelected(item)} className="grid w-full gap-3 p-4 text-left transition-colors hover:bg-muted/40 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2"><span className="font-semibold">{item.cliente}</span><Badge variant="outline" className="text-[10px]">{item.id}</Badge></div>
                        <div className="mt-1 truncate text-sm text-muted-foreground">{item.evento}</div>
                      </div>
                      <div className="text-sm"><div>{item.data}</div><div className="text-xs text-muted-foreground">{item.cidade}</div></div>
                      <div className="text-sm"><div>{item.speakers.length} palestrante(s)</div><div className="text-xs text-muted-foreground">Comercial: {item.comercial}</div></div>
                      <div className="flex items-center justify-between gap-2 md:justify-end">
                        <Badge variant="outline" className={statusBadge(item.status)}>{statusLabel(item.status)}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos">
            <DocumentsPrototype />
          </TabsContent>
          <TabsContent value="cliente">
            <ClientPrototype />
          </TabsContent>
          <TabsContent value="fechamento">
            <ClosingPrototype />
          </TabsContent>
        </Tabs>
      </main>
      <ConsultationDrawer item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function ConsultationDrawer({ item, onClose }: { item: Consultation | null; onClose: () => void }) {
  const [speakerStatus, setSpeakerStatus] = useState<Record<string, ConsultationStatus>>({});
  const [note, setNote] = useState("");
  const [mention, setMention] = useState("Marina Costa");
  if (!item) return null;

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-2"><Badge variant="outline">Protótipo</Badge><span className="text-xs text-muted-foreground">{item.id}</span></div>
          <SheetTitle>{item.cliente}</SheetTitle>
          <p className="text-sm text-muted-foreground">{item.evento} · {item.data} · {item.cidade}</p>
        </SheetHeader>
        <div className="space-y-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            <Info label="Comercial" value={item.comercial} />
            <Info label="Prioridade" value={item.prioridade} />
          </div>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Palestrantes em consulta</h3>
            <div className="space-y-2">
              {item.speakers.map((speaker) => {
                const currentStatus = speakerStatus[speaker.id] ?? speaker.status;
                return (
                  <div key={speaker.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-xs font-semibold">{speaker.initials}</div>
                      <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{speaker.nome}</div><div className="text-xs text-muted-foreground">{speaker.tema} · {speaker.cache}</div></div>
                      <Select value={currentStatus} onValueChange={(value) => setSpeakerStatus((old) => ({ ...old, [speaker.id]: value as ConsultationStatus }))}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contato">Em contato</SelectItem>
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="indisponivel">Indisponível</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Input placeholder="Cachê confirmado" defaultValue={speaker.cache} />
                      <Input placeholder="Condições / prazo de resposta" />
                    </div>
                    {(currentStatus === "disponivel" || currentStatus === "indisponivel") && (
                      <div className="mt-3 flex items-center gap-2 rounded-md bg-muted p-2 text-xs">
                        <BellRing className="h-4 w-4 text-primary" /> Marina será notificada: {speaker.nome} está {currentStatus}.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
          <section className="space-y-2 border-t pt-4">
            <Label>Nota interna e marcação</Label>
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Digite a atualização da negociação…" />
            <div className="flex flex-wrap gap-2">
              {PEOPLE.map((person) => <Button key={person} size="sm" variant={mention === person ? "secondary" : "outline"} onClick={() => { setMention(person); setNote((old) => `${old}${old ? " " : ""}@${person.replace(" ", "")} `); }}>@{person.split(" ")[0]}</Button>)}
            </div>
          </section>
        </div>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => toast.success(`Atualização demonstrativa pronta. ${mention} receberia uma notificação.`)}><BellRing className="h-4 w-4" /> Salvar e notificar</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DocumentsPrototype() {
  const recommended = CONSULTAS[0].speakers;
  const [included, setIncluded] = useState<Record<string, boolean>>({ sp1: true, sp2: true });
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader className="border-b"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-base">Recomendação de palestrantes</CardTitle><p className="mt-1 text-xs text-muted-foreground">Nexa Tecnologia · Convenção Liderança 2026</p></div><Badge variant="outline">Etapa 1</Badge></div></CardHeader>
        <CardContent className="space-y-4 p-5">
          {recommended.map((speaker) => (
            <div key={speaker.id} className="flex gap-3 border-b pb-4 last:border-0 last:pb-0">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold">{speaker.initials}</div>
              <div><div className="font-semibold">{speaker.nome}</div><div className="text-xs text-muted-foreground">{speaker.tema} · {speaker.cache}</div><p className="mt-2 text-sm">Perfil alinhado ao desafio de liderança e transformação apresentado no briefing.</p></div>
            </div>
          ))}
          <Button className="w-full" variant="outline" onClick={() => toast.info("Botão demonstrativo: o PDF não será gerado nesta fase.")}><FileDown className="h-4 w-4" /> Gerar PDF de recomendações</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-base">Proposta comercial</CardTitle><p className="mt-1 text-xs text-muted-foreground">Somente os nomes recomendados podem entrar</p></div><Badge variant="outline">Etapa 2</Badge></div></CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm"><AlertCircle className="mr-2 inline h-4 w-4" />A seleção está limitada à recomendação acima.</div>
          <div className="space-y-2">
            {recommended.map((speaker) => (
              <label key={speaker.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3">
                <Checkbox checked={!!included[speaker.id]} onCheckedChange={(checked) => setIncluded((old) => ({ ...old, [speaker.id]: !!checked }))} />
                <div className="flex-1"><div className="text-sm font-medium">{speaker.nome}</div><div className="text-xs text-muted-foreground">{speaker.tema}</div></div>
                <span className="text-sm font-semibold">{speaker.cache}</span>
              </label>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2"><Input placeholder="Condições comerciais" defaultValue="50% na assinatura + 50% antes do evento" /><Input placeholder="Validade" defaultValue="10 dias" /></div>
          <Button className="w-full" onClick={() => toast.info("Botão demonstrativo: o PDF não será gerado nesta fase.")}><FileDown className="h-4 w-4" /> Gerar PDF da proposta</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientPrototype() {
  const [query, setQuery] = useState("Nexa");
  const [selected, setSelected] = useState(CLIENTS[1]);
  const [newClient, setNewClient] = useState(false);
  const [withoutCnpj, setWithoutCnpj] = useState(true);
  const results = CLIENTS.filter((client) => `${client.name} ${client.phone}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader><CardTitle className="text-base">Localizar cliente</CardTitle><p className="text-xs text-muted-foreground">Busque pelo nome ou telefone antes de criar.</p></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex h-10 items-center gap-2 rounded-md border px-3"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="flex-1 bg-transparent text-sm outline-none" /></div>
          <div className="divide-y rounded-md border">
            {results.map((client) => <button type="button" key={client.id} onClick={() => { setSelected(client); setNewClient(false); }} className={`flex w-full items-center gap-3 p-3 text-left hover:bg-muted/40 ${selected.id === client.id && !newClient ? "bg-primary/5" : ""}`}><Building2 className="h-4 w-4 text-muted-foreground" /><div className="flex-1"><div className="text-sm font-medium">{client.name}</div><div className="text-xs text-muted-foreground">{client.phone} · {client.cnpj || "Sem CNPJ"}</div></div>{selected.id === client.id && !newClient && <Check className="h-4 w-4 text-primary" />}</button>)}
          </div>
          <Button variant="outline" className="w-full" onClick={() => setNewClient(true)}><UserPlus className="h-4 w-4" /> Criar novo cliente</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">{newClient ? "Cadastro rápido" : "Cliente selecionado"}</CardTitle><Badge variant="outline">Protótipo</Badge></div></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2"><div><Label>Nome do cliente *</Label><Input defaultValue={newClient ? "" : selected.name} placeholder="Empresa ou pessoa" /></div><div><Label>Telefone *</Label><Input defaultValue={newClient ? "" : selected.phone} placeholder="(00) 00000-0000" /></div></div>
          <div className="space-y-2"><div className="flex items-center gap-2"><Checkbox checked={withoutCnpj} onCheckedChange={(checked) => setWithoutCnpj(!!checked)} /><Label>Salvar cliente sem CNPJ por enquanto</Label></div>{!withoutCnpj && <Input placeholder="00.000.000/0001-00" defaultValue={newClient ? "" : selected.cnpj} />}</div>
          <div className="border-t pt-4"><div className="mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Contato principal</h3></div><div className="grid gap-3 sm:grid-cols-2"><Input placeholder="Nome" defaultValue="Fernanda Lima" /><Input placeholder="Cargo" defaultValue="Gerente de Pessoas" /><Input placeholder="E-mail" defaultValue="fernanda@nexa.com.br" /><Input placeholder="Telefone" defaultValue="(11) 98888-1122" /></div></div>
          <Button className="w-full" onClick={() => toast.success("Cadastro demonstrativo preenchido. Nenhuma informação foi salva.")}>Salvar cliente</Button>
          {withoutCnpj && <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs"><AlertCircle className="mr-2 inline h-4 w-4" />O cliente pode ser salvo agora, mas o CNPJ será obrigatório para concluir a venda.</div>}
        </CardContent>
      </Card>
    </div>
  );
}

function ClosingPrototype() {
  const speakers = CONSULTAS[0].speakers;
  const [winner, setWinner] = useState("sp1");
  const [cnpjComplete, setCnpjComplete] = useState(false);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const losers = speakers.filter((speaker) => speaker.id !== winner);
  const ready = cnpjComplete && losers.every((speaker) => (reasons[speaker.id] ?? "").trim().length > 0);
  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">Resultado da negociação</CardTitle><Badge variant="outline">Nexa Tecnologia</Badge></div></CardHeader>
        <CardContent className="space-y-5">
          <div><Label className="mb-2 block">Palestrante fechado *</Label><RadioGroup value={winner} onValueChange={setWinner} className="space-y-2">{speakers.map((speaker) => <label key={speaker.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3"><RadioGroupItem value={speaker.id} /><div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-xs font-semibold">{speaker.initials}</div><div className="flex-1"><div className="text-sm font-medium">{speaker.nome}</div><div className="text-xs text-muted-foreground">{speaker.cache}</div></div>{winner === speaker.id && <Badge className="bg-success text-success-foreground">Ganho</Badge>}</label>)}</RadioGroup></div>
          <div className="border-t pt-4"><Label className="mb-2 block">Motivo de perda dos demais *</Label><div className="space-y-3">{losers.map((speaker) => <div key={speaker.id} className="rounded-md border border-destructive/20 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">{speaker.nome}</span><Badge variant="outline" className="border-destructive/25 text-destructive">Perdido</Badge></div><Textarea value={reasons[speaker.id] ?? ""} onChange={(event) => setReasons((old) => ({ ...old, [speaker.id]: event.target.value }))} placeholder="Digite por que esta indicação não avançou…" rows={2} /></div>)}</div></div>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3"><Checkbox checked={cnpjComplete} onCheckedChange={(checked) => setCnpjComplete(!!checked)} /><div><div className="text-sm font-medium">CNPJ do cliente conferido</div><div className="text-xs text-muted-foreground">Obrigatório antes de criar a venda.</div></div></label>
          <Button className="w-full" disabled={!ready} onClick={() => toast.success("Fechamento demonstrativo validado.")}><Trophy className="h-4 w-4" /> Confirmar ganho e registrar perdas</Button>
          {!ready && <p className="text-center text-xs text-muted-foreground">Preencha os motivos de perda e confirme o CNPJ para continuar.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Como ficará no histórico</CardTitle><p className="text-xs text-muted-foreground">Prévia do cadastro de cada palestrante.</p></CardHeader>
        <CardContent className="space-y-4">
          {speakers.map((speaker) => {
            const won = speaker.id === winner;
            return <div key={speaker.id} className="flex gap-3"><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${won ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>{won ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}</div><div className="flex-1 border-b pb-4"><div className="text-sm font-semibold">{speaker.nome}</div><div className="text-xs text-muted-foreground">Nexa Tecnologia · Convenção Liderança 2026</div><p className="mt-2 text-sm">{won ? "Contratado para o evento — negociação ganha." : reasons[speaker.id] || "O motivo da indicação não avançar aparecerá aqui."}</p></div></div>;
          })}
          <div className="rounded-md bg-muted p-3 text-xs"><FileText className="mr-2 inline h-4 w-4" />Esse registro ajuda a entender por que cada indicação ganhou ou perdeu.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border p-3"><div className="text-[11px] uppercase text-muted-foreground">{label}</div><div className="mt-1 text-sm font-medium">{value}</div></div>;
}