import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { palestrantes, usuarios } from "@/lib/mock-data";
import { Check, ShieldCheck, UserPlus, X } from "lucide-react";

export const Route = createFileRoute("/app/admin")({
  component: Admin,
});

const logs = [
  { quando: "Hoje, 10:42", quem: "Ana Silva", acao: "Criou nova proposta PROP-2025-0142" },
  { quando: "Hoje, 09:30", quem: "Roberto Dias", acao: "Aprovou cadastro do palestrante Beatriz Lima" },
  { quando: "Hoje, 08:15", quem: "Pedro Souza", acao: "Atualizou lead Bradesco para 'Contato realizado'" },
  { quando: "Ontem, 18:22", quem: "Camila Ferreira", acao: "Marcou conta CR-0142 como paga" },
  { quando: "Ontem, 16:00", quem: "Lucas Martins", acao: "Login realizado" },
];

const perfis = [
  { nome: "Administrador", usuarios: 2, permissoes: 28 },
  { nome: "Gerente Comercial", usuarios: 3, permissoes: 22 },
  { nome: "Consultor Comercial", usuarios: 8, permissoes: 14 },
  { nome: "Financeiro", usuarios: 4, permissoes: 12 },
  { nome: "Jurídico", usuarios: 2, permissoes: 10 },
];

function Admin() {
  return (
    <>
      <AppTopbar title="Administração" breadcrumb={["Home", "Sistema", "Administração"]} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">Usuários ativos</div><div className="text-2xl font-semibold mt-1">19</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">Perfis</div><div className="text-2xl font-semibold mt-1">5</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">Palestrantes</div><div className="text-2xl font-semibold mt-1">87</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">Aprovações pendentes</div><div className="text-2xl font-semibold mt-1 text-amber-600">3</div></CardContent></Card>
        </div>

        <Tabs defaultValue="usuarios">
          <TabsList>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="perfis">Perfis & Permissões</TabsTrigger>
            <TabsTrigger value="aprovacoes">Aprovações</TabsTrigger>
            <TabsTrigger value="logs">Logs de atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-4">
            <div className="flex justify-end"><Button><UserPlus className="h-4 w-4 mr-1.5" />Convidar usuário</Button></div>
            <Card><CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground"><tr>
                  <th className="text-left px-5 py-3 font-medium">Usuário</th>
                  <th className="text-left px-2 py-3 font-medium">Perfil</th>
                  <th className="text-left px-2 py-3 font-medium">Último login</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {usuarios.map((u, i) => (
                    <tr key={u.id} className="border-t hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={`https://i.pravatar.cc/64?img=${i + 20}`} className="h-8 w-8 rounded-full" alt="" />
                          <div>
                            <div className="font-medium">{u.nome}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">{u.perfil}</td>
                      <td className="px-2 py-3 text-muted-foreground">{u.ultimoLogin}</td>
                      <td className="px-5 py-3">
                        <Badge className={u.status === "ativo" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-zinc-500"}>{u.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="perfis">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {perfis.map((p) => (
                <Card key={p.nome}>
                  <CardContent className="p-5">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-3"><ShieldCheck className="h-5 w-5 text-primary" /></div>
                    <div className="font-semibold">{p.nome}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.usuarios} usuários · {p.permissoes} permissões</div>
                    <Button size="sm" variant="outline" className="mt-3 w-full">Configurar</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="aprovacoes">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {palestrantes.slice(3).map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.foto} alt="" className="h-12 w-12 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{p.nome}</div>
                        <div className="text-xs text-muted-foreground">{p.temas.join(", ")}</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{p.bio}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1"><X className="h-3.5 w-3.5 mr-1" />Recusar</Button>
                      <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700"><Check className="h-3.5 w-3.5 mr-1" />Aprovar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader><CardTitle>Atividade recente</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {logs.map((l, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <div className="text-sm"><b>{l.quem}</b> — {l.acao}</div>
                      <div className="text-xs text-muted-foreground">{l.quando}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
