import { useQuery } from "@tanstack/react-query";
import { one, many } from "@/lib/views";
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
  UasaGredOverall,
  UasaGredSubjek,
  UasaCemerlangMurid,
  PbdTpTaburan,
  KssrModular,
  PanitiaPrestasi,
} from "@/types/db";

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

  // V2
  const uasaGred = useQuery({ queryKey: ["v_uasa_gred_overall"], queryFn: () => many<UasaGredOverall>("v_uasa_gred_overall") });
  const uasaSubjek = useQuery({ queryKey: ["v_uasa_gred_subjek"], queryFn: () => many<UasaGredSubjek>("v_uasa_gred_subjek") });
  const tpTaburan = useQuery({ queryKey: ["v_pbd_tp_taburan"], queryFn: () => many<PbdTpTaburan>("v_pbd_tp_taburan", "tp", true) });
  const modular = useQuery({ queryKey: ["v_kssr_modular"], queryFn: () => many<KssrModular>("v_kssr_modular") });
  const panitia = useQuery({ queryKey: ["v_panitia_prestasi"], queryFn: () => many<PanitiaPrestasi>("v_panitia_prestasi") });
  const topMurid = useQuery({ queryKey: ["v_uasa_cemerlang_murid", "top5"], queryFn: () => many<UasaCemerlangMurid>("v_uasa_cemerlang_murid", "purata", false, 5) });

  return {
    stats, taburan, rphStatus, rphSubjek, trend, pentaksiran, announcements, events, activities,
    uasaGred, uasaSubjek, tpTaburan, modular, panitia, topMurid,
  };
}
