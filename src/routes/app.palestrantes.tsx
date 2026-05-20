import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { palestrantes, palestrantesDetalhe, formatBRL, agendaEventos, contratos, contasPagar } from "@/lib/mock-data";
import { Star, MapPin, Landmark, FileText, Calendar, Wallet, Briefcase, AlertCircle, Crown, Search, Plus } from "lucide-react";

export const Route = createFileRoute("/app/palestrantes")({ component: PalestrantesPage });

function PalestrantesPage() {
  const [selectedId, setSelectedId] = useState(palestrantes[0].id);
  const [q, setQ] = useState("");
  const p = palestrantes.find((x) => x.id === selectedId)!;
  const d = palestrantesDetalhe[selectedId];
  const eventos = agendaEventos.filter((e) => e.palestrante === p.nome);
  const ctos = contratos.filter((c) => true).slice(0, 2);
  const pag = contasPagar.filter((c) => c.fornecedor === p.nome);
  const lista = palestrantes.filter((x) => x.nome.toLowerCase().includes(q.toLowerCase()));

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
            <Button size="sm"><Plus className="h-4 w-4" /></Button>
          </div>
          {lista.map((x) => (
            <button
              key={x.id}
              onClick={() => setSelectedId(x.id)}
              className={`w-full text-left p-3 rounded-lg border transition ${selectedId === x.id ? "bg-primary/5 border-primary" : "bg-card hover:bg-muted"}`}
            >
              <div className="flex items-center gap-3">
                <img src={x.foto} className="h-10 w-10 rounded-full" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate flex items-center gap-1">
                    {x.nome}
                    {palestrantesDetalhe[x.id]?.comercial.exclusivo && <Crown className="h-3 w-3 text-amber-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{formatBRL(x.valor)} · ⭐ {x.avaliacao}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-5">
          <Card className="p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img src={p.foto} alt="" className="h-20 w-20 rounded-xl ring-2 ring-border" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{p.nome}</h2>
                    {d?.comercial.exclusivo && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"><Crown className="h-3 w-3 mr-1" /> Exclusivo</Badge>}
                    <Badge variant="outline">{d?.fiscal.tipo}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{d?.comercial.perfil}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.temas.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.avaliacao}</span>
                    <span>{p.eventos} eventos realizados</span>
                    <span>Cachê padrão: <span className="font-semibold text-foreground">{formatBRL(d?.operacional.cachePadrao ?? p.valor)}</span></span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Editar</Button>
                <Button size="sm">Nova proposta</Button>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="fiscal">
            <TabsList className="flex-wrap">
              <TabsTrigger value="fiscal"><Landmark className="h-3.5 w-3.5 mr-1" /> Fiscal & Endereço</TabsTrigger>
              <TabsTrigger value="bancario"><Wallet className="h-3.5 w-3.5 mr-1" /> Bancário</TabsTrigger>
              <TabsTrigger value="operacional"><AlertCircle className="h-3.5 w-3.5 mr-1" /> Operacional</TabsTrigger>
              <TabsTrigger value="comercial"><Briefcase className="h-3.5 w-3.5 mr-1" /> Comercial</TabsTrigger>
              <TabsTrigger value="agenda"><Calendar className="h-3.5 w-3.5 mr-1" /> Agenda</TabsTrigger>
              <TabsTrigger value="docs"><FileText className="h-3.5 w-3.5 mr-1" /> Contratos & $</TabsTrigger>
            </TabsList>

            <TabsContent value="fiscal">
              <Card className="p-5 grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <Field label="Tipo">{d?.fiscal.tipo}</Field>
                <Field label={d?.fiscal.tipo === "PJ" ? "CNPJ" : "CPF"}>{d?.fiscal.documento}</Field>
                {d?.fiscal.razaoSocial && <Field label="Razão social">{d.fiscal.razaoSocial}</Field>}
                {d?.fiscal.nomeFantasia && <Field label="Nome fantasia">{d.fiscal.nomeFantasia}</Field>}
                {d?.fiscal.inscricaoMunicipal && <Field label="Inscrição municipal">{d.fiscal.inscricaoMunicipal}</Field>}
                {d?.fiscal.regime && <Field label="Regime tributário"><Badge variant="outline">{d.fiscal.regime}</Badge></Field>}
                <div className="md:col-span-2 mt-3 pt-3 border-t">
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2"><MapPin className="h-3 w-3" /> Endereço</div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Field label="CEP">{d?.endereco.cep}</Field>
                    <Field label="Rua">{d?.endereco.rua}</Field>
                    <Field label="Número">{d?.endereco.numero}</Field>
                    <Field label="Bairro">{d?.endereco.bairro}</Field>
                    <Field label="Cidade">{d?.endereco.cidade}</Field>
                    <Field label="Estado">{d?.endereco.estado}</Field>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="bancario">
              <Card className="p-5 grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <Field label="Banco">{d?.banco.banco}</Field>
                <Field label="Agência">{d?.banco.agencia}</Field>
                <Field label="Conta">{d?.banco.conta}</Field>
                <Field label="Chave PIX"><span className="font-mono">{d?.banco.pix}</span></Field>
                <Field label="Favorecido">{d?.banco.favorecido}</Field>
              </Card>
            </TabsContent>

            <TabsContent value="operacional">
              <div className="grid md:grid-cols-2 gap-5">
                <Card className="p-5">
                  <h4 className="font-semibold mb-3">Exigências especiais</h4>
                  <ul className="space-y-1.5 text-sm">
                    {d?.operacional.exigencias.map((e, i) => <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> {e}</li>)}
                  </ul>
                  <h4 className="font-semibold mt-5 mb-3">Restrições alimentares</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {d?.operacional.restricoes.length ? d.operacional.restricoes.map((r) => <Badge key={r} variant="secondary">{r}</Badge>) : <span className="text-xs text-muted-foreground">Nenhuma</span>}
                  </div>
                </Card>
                <Card className="p-5">
                  <h4 className="font-semibold mb-3">Necessidades técnicas</h4>
                  <ul className="space-y-1.5 text-sm">
                    {d?.operacional.tecnicas.map((e, i) => <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> {e}</li>)}
                  </ul>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <Field label="Acompanhantes">{d?.operacional.acompanhantes}</Field>
                    <Field label="Cachê padrão">{formatBRL(d?.operacional.cachePadrao ?? 0)}</Field>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comercial">
              <Card className="p-5 grid md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                <Field label="Exclusivo Polo">{d?.comercial.exclusivo ? <Badge className="bg-amber-500">Sim</Badge> : <Badge variant="outline">Não</Badge>}</Field>
                <Field label="Valor médio">{formatBRL(d?.comercial.valorMedio ?? 0)}</Field>
                <Field label="Perfil">{d?.comercial.perfil}</Field>
                <div className="md:col-span-3">
                  <div className="text-xs text-muted-foreground mb-1">Bio resumida</div>
                  <p className="text-sm">{p.bio}</p>
                </div>
                <div className="md:col-span-3">
                  <div className="text-xs text-muted-foreground mb-2">Temas</div>
                  <div className="flex flex-wrap gap-1.5">{p.temas.map(t => <Badge key={t}>{t}</Badge>)}</div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="agenda">
              <Card className="p-5">
                <h4 className="font-semibold mb-3">Próximos eventos & histórico</h4>
                <div className="space-y-2">
                  {(eventos.length ? eventos : [{ id: "x", data: "21 Mai", cliente: "Itaú", palestrante: p.nome, local: "São Paulo, SP", valor: p.valor, status: "concluido" }]).map((e: any) => (
                    <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="text-center w-12">
                        <div className="text-[10px] text-muted-foreground">{e.data.split(" ")[1]}</div>
                        <div className="font-bold">{e.data.split(" ")[0]}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{e.cliente}</div>
                        <div className="text-xs text-muted-foreground">{e.local}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatBRL(e.valor)}</div>
                        <Badge variant="outline" className="text-[10px]">{e.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="docs">
              <div className="grid md:grid-cols-2 gap-5">
                <Card className="p-5">
                  <h4 className="font-semibold mb-3">Contratos vinculados</h4>
                  {ctos.map((c) => (
                    <div key={c.id} className="flex items-center justify-between border-b py-2 last:border-0">
                      <div>
                        <div className="text-sm font-mono">{c.numero}</div>
                        <div className="text-xs text-muted-foreground">{c.cliente} · {c.modelo}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                    </div>
                  ))}
                </Card>
                <Card className="p-5">
                  <h4 className="font-semibold mb-3">Financeiro / cachês a pagar</h4>
                  {(pag.length ? pag : [{ id: "x", fornecedor: p.nome, descricao: "Cachê padrão", valor: d?.operacional.cachePadrao ?? p.valor, vencimento: "—", status: "em aberto" }]).map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between border-b py-2 last:border-0">
                      <div>
                        <div className="text-sm">{c.descricao}</div>
                        <div className="text-xs text-muted-foreground">vence {c.vencimento}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatBRL(c.valor)}</div>
                        <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
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
