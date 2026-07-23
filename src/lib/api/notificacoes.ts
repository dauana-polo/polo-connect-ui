import { supabase } from "@/integrations/supabase/client";
import type { Notificacao } from "@/lib/types";

const unwrap = <T>({ data, error }: { data: T | null; error: unknown }) => {
  if (error) throw error;
  return data as T;
};

export async function listMyNotificacoes(userId: string, limit = 30) {
  return unwrap<Notificacao[]>(
    await supabase
      .from("notificacoes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
  );
}

export async function marcarComoLida(id: string) {
  const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
  if (error) throw error;
}

export async function marcarTodasLidas(userId: string) {
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("user_id", userId)
    .eq("lida", false);
  if (error) throw error;
}
