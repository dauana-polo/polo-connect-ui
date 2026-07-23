import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadInsert, LeadUpdate } from "@/lib/types";

const unwrap = <T>({ data, error }: { data: T | null; error: unknown }) => {
  if (error) throw error;
  return data as T;
};

export async function listLeads(opts: { limit?: number } = {}) {
  const q = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (opts.limit) q.limit(opts.limit);
  return unwrap<Lead[]>(await q);
}

export async function getLead(id: string) {
  return unwrap<Lead>(await supabase.from("leads").select("*").eq("id", id).single());
}

export async function createLead(input: LeadInsert) {
  return unwrap<Lead>(
    await supabase.from("leads").insert(input).select("*").single(),
  );
}

export async function updateLead(id: string, input: LeadUpdate) {
  return unwrap<Lead>(
    await supabase.from("leads").update(input).eq("id", id).select("*").single(),
  );
}

export async function updateLeadEtapa(id: string, etapa: Lead["etapa"]) {
  return updateLead(id, { etapa });
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}
