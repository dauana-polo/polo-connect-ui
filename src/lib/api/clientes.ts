import { supabase } from "@/integrations/supabase/client";
import type { Cliente } from "@/lib/types";

const unwrap = <T>({ data, error }: { data: T | null; error: unknown }) => {
  if (error) throw error;
  return data as T;
};

export async function listClientes() {
  return unwrap<Cliente[]>(
    await supabase.from("clientes").select("*").order("razao_social"),
  );
}

export async function searchClientes(term: string, limit = 10) {
  return unwrap<Cliente[]>(
    await supabase
      .from("clientes")
      .select("*")
      .or(`razao_social.ilike.%${term}%,nome_fantasia.ilike.%${term}%,cnpj.ilike.%${term}%`)
      .limit(limit),
  );
}

export async function getCliente(id: string) {
  return unwrap<Cliente>(await supabase.from("clientes").select("*").eq("id", id).single());
}

export async function upsertCliente(patch: Partial<Cliente> & { razao_social: string; id?: string }) {
  const { data, error } = await supabase
    .from("clientes")
    .upsert(patch as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as Cliente;
}
