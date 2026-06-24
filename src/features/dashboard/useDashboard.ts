import { useQuery } from "@tanstack/react-query";
import { one, many, rpc } from "@/lib/views";
import { useYear } from "@/providers/YearProvider";
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

interface DashUasa { purata_uasa: number; peratus_lulus_uasa: number }

export function useDashboard() {
  const { yearId } = useYear();
  const p = { p_year: yearId };

  const stats = useQuery({ queryKey: ["v_dashboard_stats"], queryFn: () => one<DashboardStats>("v_dashboard_stats") });
  const taburan = useQuery({ queryKey: ["v_pencapaian_taburan"], queryFn: () => many<PencapaianTaburan>("v_pencapaian_taburan") });
  const rphStatus = useQuery({ queryKey: ["v_rph_status"], queryFn: () => many<RphStatusRow>("v_rph_status") });
  const rphSubjek = useQuery({ queryKey: ["v_rph_per_subject"], queryFn: () => many<RphPerSubject>("v_rph_per_subject") });
  const trend = useQuery({ queryKey: ["v_trend_pencapaian"], queryFn: () => many<TrendRow>("v_trend_pencapaian", "bulan_no", true) });
  const pentaksiran = useQuery({ queryKey: ["v_pentaksiran_ringkasan"], queryFn: () => one<PentaksiranRingkasan>("v_pentaksiran_ringkasan") });
  const announcements = useQuery({ queryKey: ["announcements", "dash"], queryFn: () => many<Announcement>("announcements", "tarikh", false, 4) });
  const events = useQuery({ queryKey: ["calendar_events", "dash"], queryFn: () => many<CalendarEvent>("calendar_events", "tarikh_mula", true, 12) });
  const activities = useQuery({ queryKey: ["activities", "dash"], queryFn: () => many<Activity>("activities", "created_at", false, 5) });

  // UASA — ditapis ikut sesi (yearId)
  const dashUasa = useQuery({ queryKey: ["fn_dashboard_uasa", yearId], queryFn: () => rpc<DashUasa>("fn_dashboard_uasa", p) });
  const uasaGred = useQuery({ queryKey: ["fn_uasa_gred_overall", yearId], queryFn: () => rpc<UasaGredOverall>("fn_uasa_gred_overall", p) });
  const uasaSubjek = useQuery({ queryKey: ["fn_uasa_gred_subjek", yearId], queryFn: () => rpc<UasaGredSubjek>("fn_uasa_gred_subjek", p) });
  const panitia = useQuery({ queryKey: ["fn_panitia_prestasi", yearId], queryFn: () => rpc<PanitiaPrestasi>("fn_panitia_prestasi", p) });
  const topMurid = useQuery({ queryKey: ["fn_uasa_cemerlang", yearId, "top5"], queryFn: () => rpc<UasaCemerlangMurid>("fn_uasa_cemerlang", p) });

  // PBD/TP — tiada year_id dlm skema → kekal kumulatif
  const tpTaburan = useQuery({ queryKey: ["v_pbd_tp_taburan"], queryFn: () => many<PbdTpTaburan>("v_pbd_tp_taburan", "tp", true) });
  const modular = useQuery({ queryKey: ["v_kssr_modular"], queryFn: () => many<KssrModular>("v_kssr_modular") });

  return {
    stats, taburan, rphStatus, rphSubjek, trend, pentaksiran, announcements, events, activities,
    dashUasa, uasaGred, uasaSubjek, tpTaburan, modular, panitia, topMurid,
  };
}
