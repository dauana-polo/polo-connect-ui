import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Event = "INSERT" | "UPDATE" | "DELETE" | "*";

/**
 * Subscribe to Supabase Realtime changes on a public table.
 * Callback fires for every matching event; use it to refetch or update local state.
 * Cleans up on unmount and when deps change.
 */
export function useRealtimeTable(
  table: string,
  onChange: () => void,
  opts: { event?: Event; filter?: string; enabled?: boolean } = {},
) {
  const { event = "*", filter, enabled = true } = opts;

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes" as never,
        { event, schema: "public", table, filter } as never,
        () => onChange(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, event, filter, enabled]);
}
