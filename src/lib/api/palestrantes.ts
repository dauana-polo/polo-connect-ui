import { supabase } from "@/integrations/supabase/client";
import type { Palestrante } from "@/lib/types";

const unwrap = <T>({ data, error }: { data: T | null; error: unknown }) => {
  if (error) throw error;
  return data as T;
};

export async function listPalestrantes() {
  return unwrap<Palestrante[]>(
    await supabase.from("palestrantes").select("*").order("nome"),
  );
}

export async function getPalestrante(id: string) {
  return unwrap<Palestrante>(
    await supabase.from("palestrantes").select("*").eq("id", id).single(),
  );
}

export async function updatePalestrante(id: string, patch: Partial<Palestrante>) {
  return unwrap<Palestrante>(
    await supabase.from("palestrantes").update(patch).eq("id", id).select("*").single(),
  );
}

export async function deletePalestrante(id: string) {
  const { error } = await supabase.from("palestrantes").delete().eq("id", id);
  if (error) throw error;
}
