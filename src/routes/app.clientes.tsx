import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clientes, clienteContatos, clienteDocs, formatBRL, leads, propostas, contratos, contasReceber, agendaEventos } from "@/lib/mock-data";
import { Building2, Mail, Phone, FileText, Receipt, Calendar, MessageSquare, TrendingUp, Star, Search, Loader2, CheckCircle2, Upload, Plus, MapPin } from "lucide-react";

export const Route = createFileRoute("/app/clientes")({ component: ClientesPage });

type Lookup = {
  razao_social?: string; nome_fantasia?: string; cep?: string; logradouro?: string;
  bairro?: string; municipio?: string; uf?: string; descricao_situacao_cadastral?: string;
};

function ClientesPage() {
  const [selectedId, setSelectedId] = useState(clientes[0].id);
  const [showNew, setShowNew] = useState(false);
  const c = clientes.find((x) => x.id === selectedId)!;
  const contatos = clienteContatos[selectedId] ?? [];
  const docs = clienteDocs[selectedId] ?? [];
  const cevents = agendaEventos.filter((p) => c.nome.toLowerCase().includes(p.cliente.toLowerCase().split(" ")[0]));
  const cpropostas = propostas.filter((p) => c.nome.toLowerCase().includes(p.cliente.toLowerCase().split(" ")[0]));
  const ccontratos = contratos.filter((p) => c.nome.toLowerCase().includes(p.cliente.toLowerCase().split(" ")[0]));
  const cnfs = contasReceber.filter((p) => c.nome.toLowerCase().includes(p.cliente.toLowerCase().split(" ")[0]));

  return (
    <>
      <AppTopbar title="Clientes — Cadastro 360°" breadcrumb={["Cadastros", "Clientes"]} />
      <div className="flex-1 overflow-auto p-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 space-y-2">
          <Button className="w-full" onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> Novo cliente</Button>
          <div className="text-xs uppercase font-semibold text-muted-foreground px-2 mt-3 mb-2">Base de clientes ({clientes.length})</div>
          {clientes.map((x) => (
            <button
              key={x.id}
              onClick={() => { setSelectedId(x.id); setShowNew(false); }}
              className={`w-full text-left p-3 rounded-lg border transition ${selectedId === x.id && !showNew ? "bg-primary/5 border-primary" : "bg-card hover:bg-muted"}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-white font-bold">{x.nome[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{x.nome}</div>
                  <div className="text-xs text-muted-foreground truncate">{x.segmento} · {formatBRL(x.ltv)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-5">
          {showNew ? <NovoClienteForm onClose={() => setShowNew(false)} /> : (
            <>
              <Card className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-white text-2xl font-bold">{c.nome[0]}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">{c.nome}</h2>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{c.status}</Badge>
                        <Badge variant="outline">Grande porte</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{c.segmento} · CNPJ {c.cnpj}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.telefone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Editar</Button>
                    <Button size="sm"><FileText className="h-4 w-4" /> Nova proposta</Button>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> LTV total</div><div className="text-2xl font-bold mt-1">{formatBRL(c.ltv)}</div></Card>
                <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Eventos</div><div className="text-2xl font-bold mt-1">{c.eventos}</div></Card>
                <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Propostas</div><div className="text-2xl font-bold mt-1">{c.propostas}</div></Card>
                <Card className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> NPS</div><div className="text-2xl font-bold mt-1 text-emerald-500">{c.nps}</div></Card>
              </div>

              <Tabs defaultValue="info">
                <TabsList className="flex-wrap">
                  <TabsTrigger value="info">Informações gerais</TabsTrigger>
                  <TabsTrigger value="contatos">Contatos ({contatos.length})</TabsTrigger>
                  <TabsTrigger value="eventos">Eventos</TabsTrigger>
                  <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                  <TabsTrigger value="contratos">Contratos</TabsTrigger>
                  <TabsTrigger value="docs">Documentos ({docs.length})</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                  <Card className="p-5 grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <Field label="Razão social">{c.nome}</Field>
                    <Field label="Nome fantasia">{c.nome.split(" ")[0]}</Field>
                    <Field label="CNPJ"><span className="font-mono">{c.cnpj}</span></Field>
                    <Field label="Situação"><Badge className="bg-emerald-500">Ativa</Badge></Field>
                    <Field label="Segmento">{c.segmento}</Field>
                    <Field label="Porte da empresa">Grande</Field>
                    <Field label="Origem do lead">Indicação</Field>
                    <Field label="Status">{c.status}</Field>
                    <div className="md:col-span-2 pt-3 border-t">
                      <div className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2"><MapPin className="h-3 w-3" /> Endereço (preenchimento automático via BrasilAPI)</div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Field label="CEP">01310-100</Field>
                        <Field label="Rua">Av. Paulista</Field>
                        <Field label="Bairro">Bela Vista</Field>
                        <Field label="Cidade">São Paulo</Field>
                        <Field label="Estado">SP</Field>
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-3 border-t">
                      <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Observações internas</div>
                      <p className="text-sm text-muted-foreground">Cliente estratégico. Preferência por palestrantes do segmento financeiro. SLA: resposta em até 4h úteis.</p>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="contatos">
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Contatos vinculados</h4>
                      <Button size="sm" variant="outline"><Plus className="h-4 w-4" /> Novo contato</Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {contatos.map((ct, i) => (
                        <div key={i} className="p-3 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-sm">{ct.nome}</div>
                              <div className="text-xs text-muted-foreground">{ct.cargo}</div>
                            </div>
                            <Badge variant="outline" className="text-[10px]">{ct.tipo}</Badge>
                          </div>
                          <div className="mt-2 text-xs space-y-0.5 text-muted-foreground">
                            <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {ct.email}</div>
                            <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {ct.telefone}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="eventos">
                  <Card className="p-5 space-y-2">
                    {(cevents.length ? cevents : [{ id: "x", data: "21 Mai", palestrante: "Dr. Ricardo Almeida", local: "São Paulo, SP", valor: 35000, status: "concluido", cliente: c.nome }]).map((e: any) => (
                      <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="text-center w-12"><div className="text-[10px] text-muted-foreground">{e.data.split(" ")[1]}</div><div className="font-bold">{e.data.split(" ")[0]}</div></div>
                        <div className="flex-1"><div className="text-sm font-medium">{e.palestrante}</div><div className="text-xs text-muted-foreground">{e.local}</div></div>
                        <div className="text-right"><div className="text-sm font-semibold">{formatBRL(e.valor)}</div><Badge variant="outline" className="text-[10px]">{e.status}</Badge></div>
                      </div>
                    ))}
                  </Card>
                </TabsContent>

                <TabsContent value="financeiro">
                  <Card className="p-5 space-y-2">
                    {(cnfs.length ? cnfs : contasReceber.slice(0, 2)).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded border">
                        <div><div className="text-sm">{p.evento}</div><div className="text-xs text-muted-foreground">Parc. {p.parcela} · vence {p.vencimento}</div></div>
                        <div className="text-right"><div className="text-sm font-semibold">{formatBRL(p.valor)}</div><Badge variant="outline" className="text-[10px]">{p.status}</Badge></div>
                      </div>
                    ))}
                  </Card>
                </TabsContent>

                <TabsContent value="contratos">
                  <Card className="p-5 space-y-2">
                    {(ccontratos.length ? ccontratos : contratos.slice(0, 2)).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded border">
                        <div><div className="text-sm font-mono">{p.numero}</div><div className="text-xs text-muted-foreground">{p.modelo}</div></div>
                        <div className="text-right"><div className="text-sm font-semibold">{formatBRL(p.valor)}</div><Badge variant="outline" className="text-[10px]">{p.status}</Badge></div>
                      </div>
                    ))}
                  </Card>
                </TabsContent>

                <TabsContent value="docs">
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Documentos</h4>
                      <Button size="sm" variant="outline"><Upload className="h-4 w-4" /> Enviar arquivo</Button>
                    </div>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center mb-3">
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <div className="text-sm">Arraste arquivos aqui ou clique para enviar</div>
                      <div className="text-xs text-muted-foreground">PDF, DOCX, XLSX até 20MB</div>
                    </div>
                    <div className="space-y-1.5">
                      {docs.length ? docs.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded border text-sm">
                          <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-violet-500" /><span>{d.nome}</span></div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{d.tipo}</span><span>{d.tamanho}</span><span>{d.data}</span>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">Baixar</Button>
                          </div>
                        </div>
                      )) : <div className="text-xs text-muted-foreground text-center py-4">Nenhum documento enviado</div>}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="historico">
                  <Card className="p-5">
                    <ol className="relative border-l border-border ml-2 space-y-4 pl-5">
                      {c.timeline.map((t, i) => {
                        const colors: Record<string, string> = { evento: "bg-emerald-500", pagamento: "bg-blue-500", contrato: "bg-violet-500", proposta: "bg-amber-500", reuniao: "bg-fuchsia-500", lead: "bg-slate-400" };
                        return (
                          <li key={i}>
                            <span className={`absolute -left-1.5 h-3 w-3 rounded-full ring-4 ring-card ${colors[t.tipo] ?? "bg-muted"}`} />
                            <div className="text-[11px] text-muted-foreground">{t.data}</div>
                            <div className="text-sm font-medium">{t.titulo}</div>
                            <div className="text-xs text-muted-foreground">por {t.autor}</div>
                          </li>
                        );
                      })}
                    </ol>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function NovoClienteForm({ onClose }: { onClose: () => void }) {
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Lookup | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function consultar() {
    const clean = cnpj.replace(/\D/g, "");
    if (clean.length !== 14) { setErr("CNPJ deve ter 14 dígitos"); return; }
    setErr(null); setLoading(true); setData(null);
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      if (!r.ok) throw new Error("Não encontrado");
      const j = await r.json();
      setData(j);
    } catch (e: any) {
      setErr("Falha na consulta. Você ainda pode preencher manualmente.");
    } finally { setLoading(false); }
  }

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h3 className="font-semibold text-lg">Novo cliente</h3><p className="text-xs text-muted-foreground">Consulta automática via BrasilAPI</p></div>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <div className="text-xs font-medium mb-1">CNPJ</div>
          <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="60.701.190/0001-04" />
        </div>
        <Button onClick={consultar} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Consultar
        </Button>
      </div>
      {err && <div className="text-xs text-rose-500">{err}</div>}
      {data && (
        <div className="rounded-lg border-2 border-emerald-500/30 bg-emerald-500/5 p-3 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dados encontrados e preenchidos automaticamente.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <InputField label="Razão social" value={data?.razao_social ?? ""} />
        <InputField label="Nome fantasia" value={data?.nome_fantasia ?? ""} />
        <InputField label="Situação cadastral" value={data?.descricao_situacao_cadastral ?? ""} />
        <InputField label="Segmento" placeholder="Ex: Financeiro" />
        <InputField label="CEP" value={data?.cep ?? ""} />
        <InputField label="Rua" value={data?.logradouro ?? ""} />
        <InputField label="Bairro" value={data?.bairro ?? ""} />
        <InputField label="Cidade" value={data?.municipio ?? ""} />
        <InputField label="Estado" value={data?.uf ?? ""} />
        <InputField label="Porte" placeholder="Pequeno/Médio/Grande" />
      </div>

      <div className="border-t pt-4">
        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Observações internas</div>
        <textarea className="w-full rounded-md border bg-background p-2 text-sm" rows={3} placeholder="Notas sobre o cliente, preferências, SLA..." />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button>Salvar cliente</Button>
      </div>
    </Card>
  );
}

function InputField({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase text-muted-foreground font-semibold mb-1">{label}</div>
      <Input defaultValue={value} placeholder={placeholder} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase text-muted-foreground font-semibold tracking-wider mb-1">{label}</div>
      <div className="font-medium">{children}</div>
    </div>
  );
}
