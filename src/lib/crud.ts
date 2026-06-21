import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ListOpts {
  select?: string;
  orderBy?: string;
  ascending?: boolean;
}

export function useList<T = Record<string, unknown>>(table: string, opts: ListOpts = {}) {
  return useQuery({
    queryKey: [table, opts],
    queryFn: async (): Promise<T[]> => {
      let q = supabase.from(table).select(opts.select ?? "*");
      if (opts.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? false });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useCreate(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { data, error } = await supabase.from(table).insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

export function useUpdate(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from(table)
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

export function useRemove(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

export function useOptions(
  table: string,
  labelKey: string,
  opts: { filter?: { col: string; val: unknown }; orderBy?: string } = {},
) {
  return useQuery({
    queryKey: ["options", table, labelKey, opts],
    queryFn: async () => {
      let q = supabase.from(table).select(`id, ${labelKey}`);
      if (opts.filter) q = q.eq(opts.filter.col, opts.filter.val as string);
      if (opts.orderBy) q = q.order(opts.orderBy, { ascending: true });
      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as unknown as Record<string, unknown>[];
      return rows.map((r) => ({
        value: String(r.id),
        label: String(r[labelKey] ?? ""),
      }));
    },
  });
}

export async function logActivity(p: {
  actor_id?: string | null;
  actor_nama?: string | null;
  action: string;
  modul?: string;
  detail?: string;
}) {
  await supabase.from("activities").insert(p);
}
