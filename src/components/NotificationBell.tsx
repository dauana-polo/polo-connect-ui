import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "@tanstack/react-router";

type Notif = {
  id: string;
  titulo: string;
  mensagem: string | null;
  tipo: string;
  link: string | null;
  lida: boolean;
  created_at: string;
};

export function NotificationBell() {
  const [items, setItems] = useState<Notif[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data } = await supabase
        .from("notificacoes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      setItems((data as Notif[]) ?? []);
    };
    load();
    const ch = supabase
      .channel("notif-" + userId)
      .on("postgres_changes", { event: "*", schema: "public", table: "notificacoes", filter: `user_id=eq.${userId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId]);

  const unread = items.filter((i) => !i.lida).length;

  async function marcarTodas() {
    if (!userId) return;
    await supabase.from("notificacoes").update({ lida: true }).eq("user_id", userId).eq("lida", false);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative h-10 w-10 grid place-items-center rounded-lg hover:bg-muted" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-card">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold text-sm">Notificações</div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={marcarTodas} className="h-7 text-xs">
              <Check className="h-3 w-3 mr-1" />Marcar todas
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">Sem notificações.</div>
          )}
          {items.map((n) => {
            const content = (
              <div className={`px-4 py-3 border-b last:border-0 hover:bg-muted/40 cursor-pointer ${!n.lida ? "bg-primary/5" : ""}`}>
                <div className="flex items-start gap-2">
                  {!n.lida && <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{n.titulo}</div>
                    {n.mensagem && <div className="text-xs text-muted-foreground line-clamp-2">{n.mensagem}</div>}
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                    </div>
                  </div>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link as string} onClick={() => supabase.from("notificacoes").update({ lida: true }).eq("id", n.id).then()}>
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
