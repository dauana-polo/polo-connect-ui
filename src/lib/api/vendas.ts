import { supabase } from "@/integrations/supabase/client";
import type { Venda, VendaInsert, VendaUpdate } from "@/lib/types";

const unwrap = <T>({ data, error }: { data: T | null; error: unknown }) => {
  if (error) throw error;
  return data as T;
};

export async function listVendas() {
  return unwrap<Venda[]>(
    await supabase.from("vendas").select("*").order("created_at", { ascending: false }),
  );
}

export async function getVenda(id: string) {
  return unwrap<Venda>(await supabase.from("vendas").select("*").eq("id", id).single());
}

export async function createVenda(input: VendaInsert) {
  return unwrap<Venda>(await supabase.from("vendas").insert(input).select("*").single());
}

export async function updateVenda(id: string, input: VendaUpdate) {
  return unwrap<Venda>(
    await supabase.from("vendas").update(input).eq("id", id).select("*").single(),
  );
}

/** Retorna true se o palestrante já tem venda ativa na data (excluindo a venda opcional). */
export async function palestranteTemConflito(
  palestranteId: string,
  dataEvento: string,
  excluirVendaId?: string,
) {
  const q = supabase
    .from("vendas")
    .select("id")
    .eq("palestrante_id", palestranteId)
    .eq("data_evento", dataEvento);
  if (excluirVendaId) q.neq("id", excluirVendaId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).length > 0;
}
