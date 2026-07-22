import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/admin")({ component: Admin });

const ROLES: AppRole[] = ["admin", "gestor", "comercial", "pos_venda", "juridico", "financeiro", "logistica", "palestrante"];

type Usuario = { id: string; user_id: string; nome: string; email: string; ativo: boolean; created_at: string };
type UserRole = { user_id: string; role: AppRole };
type AuditLog = {
  id: string; user_id: string | null; acao: string; entidade: string;
  entidade_id: string | null; created_at: string;
};

function Admin() {
  const { isAdmin, isGestor, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [rolesMap, setRolesMap] = useState<Record<string, AppRole[]>>({});
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const [u, r, l] = await Promise.all([
      supabase.from("usuarios").select("id,user_id,nome,email,ativo,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("audit_logs").select("id,user_id,acao,entidade,entidade_id,created_at").order("created_at", { ascending: false }).limit(50),
    ]);
    setUsuarios((u.data as Usuario[]) ?? []);
    const map: Record<string, AppRole[]> = {};
    ((r.data as UserRole[]) ?? []).forEach((x) => {
      (map[x.user_id] ??= []).push(x.role);
    });
    setRolesMap(map);
    setLogs((l.data as AuditLog[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { if (!authLoading) refresh(); }, [authLoading]);

  async function addRole(userId: string, role: AppRole) {
    if (!userId) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error(error.message);
    toast.success("Papel adicionado");
    refresh();
  }

  async function removeRole(userId: string, role: AppRole) {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) return toast.error(error.message);
    toast.success("Papel removido");
    refresh();
  }

  if (authLoading) return <div className="p-6"><Loader2 className="animate-spin" /></div>;

  if (!isGestor) {
    return (
      <>
        <AppTopbar title="Administração" />
        <div className="p-6">
          <Card><CardContent className="p-8 text-center">
            <ShieldAlert className="h-10 w-10 mx-auto text-amber-500 mb-3" />
            <div className="font-semibold">Acesso restrito</div>
            <p className="text-sm text-muted-foreground mt-1">Apenas administradores e gestores podem acessar esta área.</p>
          </CardContent></Card>
        </div>
      </>
    );
  }

  const nomeUsuario = (uid: string | null) => uid ? (usuarios.find((u) => u.user_id === uid)?.nome ?? "—") : "sistema";

  return (
    <>
      <AppTopbar title="Administração" breadcrumb={["Home", "Sistema", "Administração"]} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">Usuários</div><div className="text-2xl font-semibold mt-1">{usuarios.length}</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">Administradores</div><div className="text-2xl font-semibold mt-1">{Object.values(rolesMap).filter((r) => r.includes("admin")).length}</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">Papéis totais</div><div className="text-2xl font-semibold mt-1">{Object.values(rolesMap).flat().length}</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground uppercase tracking-wider">Logs recentes</div><div className="text-2xl font-semibold mt-1">{logs.length}</div></CardContent></Card>
        </div>

        <Tabs defaultValue="usuarios">
          <TabsList>
            <TabsTrigger value="usuarios">Usuários & Papéis</TabsTrigger>
            <TabsTrigger value="logs">Auditoria</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-4">
            <Card><CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground"><tr>
                  <th className="text-left px-5 py-3 font-medium">Usuário</th>
                  <th className="text-left px-2 py-3 font-medium">Papéis atuais</th>
                  <th className="text-left px-2 py-3 font-medium w-56">Adicionar papel</th>
                </tr></thead>
                <tbody>
                  {loading && <tr><td colSpan={3} className="p-6 text-center"><Loader2 className="animate-spin inline" /></td></tr>}
                  {!loading && usuarios.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Nenhum usuário.</td></tr>}
                  {usuarios.map((u) => {
                    const userRoles = rolesMap[u.user_id] ?? [];
                    return (
                      <tr key={u.id} className="border-t hover:bg-muted/30">
                        <td className="px-5 py-3">
                          <div className="font-medium">{u.nome}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1">
                            {userRoles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                            {userRoles.map((r) => (
                              <Badge key={r} variant="secondary" className="capitalize cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => { if (isAdmin && confirm(`Remover papel "${r}"?`)) removeRole(u.user_id, r); }}>
                                {r.replace("_", " ")}
                                {isAdmin && " ×"}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          {isAdmin ? (
                            <Select onValueChange={(v) => addRole(u.user_id, v as AppRole)}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="+ papel" /></SelectTrigger>
                              <SelectContent>
                                {ROLES.filter((r) => !userRoles.includes(r)).map((r) => (
                                  <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : <span className="text-xs text-muted-foreground">Somente admin</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent></Card>
            {!isAdmin && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Gestores visualizam mas não editam papéis.</p>
            )}
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader><CardTitle>Logs de auditoria</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs text-muted-foreground"><tr>
                    <th className="text-left px-5 py-3 font-medium">Quando</th>
                    <th className="text-left px-2 py-3 font-medium">Quem</th>
                    <th className="text-left px-2 py-3 font-medium">Ação</th>
                    <th className="text-left px-2 py-3 font-medium">Entidade</th>
                    <th className="text-left px-5 py-3 font-medium">ID</th>
                  </tr></thead>
                  <tbody>
                    {logs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Sem registros.</td></tr>}
                    {logs.map((l) => (
                      <tr key={l.id} className="border-t hover:bg-muted/30">
                        <td className="px-5 py-3 text-xs text-muted-foreground">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true, locale: ptBR })}</td>
                        <td className="px-2 py-3">{nomeUsuario(l.user_id)}</td>
                        <td className="px-2 py-3">
                          <Badge variant={l.acao === "delete" ? "destructive" : l.acao === "insert" ? "default" : "secondary"}>{l.acao}</Badge>
                        </td>
                        <td className="px-2 py-3">{l.entidade}</td>
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground truncate max-w-[200px]">{l.entidade_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
