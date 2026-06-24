import { supabase } from "@/lib/supabase";

/** Panggil SQL function (rpc) → pulang array baris. */
export async function rpc<T>(fn: string, params: Record<string, unknown> = {}): Promise<T[]> {
  const { data, error } = await supabase.rpc(fn, params);
  if (error) throw error;
  return (data ?? []) as T[];
}

/** Ambil satu baris dari view/table (cth view ringkasan). */
export async function one<T>(view: string): Promise<T | null> {
  const { data, error } = await supabase.from(view).select("*").single();
  if (error) throw error;
  return data as T;
}

/** Ambil banyak baris dari view/table dgn susunan & had pilihan. */
export async function many<T>(
  table: string,
  order?: string,
  asc = false,
  limit?: number,
): Promise<T[]> {
  let q = supabase.from(table).select("*");
  if (order) q = q.order(order, { ascending: asc });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as T[];
}
