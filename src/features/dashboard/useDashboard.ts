import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  DashboardStats,
  PencapaianTaburan,
  RphStatusRow,
  RphPerSubject,
  TrendRow,
  PentaksiranRingkasan,
  Announcement,
  CalendarEvent,
  Activity,
} from "@/types/db";

async function one<T>(view: string): Promise<T | null> {
  const { data, error } = await supabase.from(view).select("*").single();
  if (error) throw error;
  return data as T;
}
async function many<T>(table: string, order?: string, asc = false, limit?: number): Promise<T[]> {
  let q = supabase.from(table).select("*");
  if (order) q = q.order(order, { ascending: asc });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as T[];
}

export function useDashboard() {
  const stats = useQuery({ queryKey: ["v_dashboard_stats"], queryFn: () => one<DashboardStats>("v_dashboard_stats") });
  const taburan = useQuery({ queryKey: ["v_pencapaian_taburan"], queryFn: () => many<PencapaianTaburan>("v_pencapaian_taburan") });
  const rphStatus = useQuery({ queryKey: ["v_rph_status"], queryFn: () => many<RphStatusRow>("v_rph_status") });
  const rphSubjek = useQuery({ queryKey: ["v_rph_per_subject"], queryFn: () => many<RphPerSubject>("v_rph_per_subject") });
  const trend = useQuery({ queryKey: ["v_trend_pencapaian"], queryFn: () => many<TrendRow>("v_trend_pencapaian", "bulan_no", true) });
  const pentaksiran = useQuery({ queryKey: ["v_pentaksiran_ringkasan"], queryFn: () => one<PentaksiranRingkasan>("v_pentaksiran_ringkasan") });
  const announcements = useQuery({ queryKey: ["announcements", "dash"], queryFn: () => many<Announcement>("announcements", "tarikh", false, 4) });
  const events = useQuery({ queryKey: ["calendar_events", "dash"], queryFn: () => many<CalendarEvent>("calendar_events", "tarikh_mula", true, 12) });
  const activities = useQuery({ queryKey: ["activities", "dash"], queryFn: () => many<Activity>("activities", "created_at", false, 5) });

  return { stats, taburan, rphStatus, rphSubjek, trend, pentaksiran, announcements, events, activities };
}
