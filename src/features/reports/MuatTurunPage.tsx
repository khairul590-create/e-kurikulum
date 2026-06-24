import { useState } from "react";
import { Download, Users, ClipboardList, BarChart3, HeartPulse, GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toCSV, downloadCSV } from "@/lib/csv";
import { Panel, PageTitle } from "@/components/panel/Panel";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";

const SOURCES = [
  { key: "students", title: "Senarai Murid", desc: "Semua murid, kelas & status", icon: Users, table: "students", select: "nama, no_sijil_lahir, jantina, status" },
  { key: "uasa", title: "Markah UASA", desc: "Markah & gred UASA murid", icon: BarChart3, table: "uasa_scores", select: "markah, gred, lulus" },
  { key: "pbd", title: "Pentaksiran (PBD)", desc: "Markah & tahap penguasaan", icon: GraduationCap, table: "assessment_scores", select: "markah, tp_level, tahap" },
  { key: "rph", title: "Status RPH", desc: "Rekod & status pelaksanaan RPH", icon: ClipboardList, table: "rph", select: "tarikh, tajuk, status, minggu" },
  { key: "panitia", title: "Prestasi Panitia", desc: "Ringkasan prestasi panitia", icon: BarChart3, table: "v_panitia_prestasi", select: "subjek, ketua, bil_guru, purata_uasa, purata_tp, status" },
  { key: "intervensi", title: "Program Intervensi", desc: "Senarai program & kemajuan", icon: HeartPulse, table: "v_intervensi_ringkasan", select: "nama, jenis, sasaran, bil_murid, kemajuan, status" },
];

export default function MuatTurunPage() {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function gen(s: (typeof SOURCES)[number]) {
    setBusy(s.key);
    try {
      const { data, error } = await supabase.from(s.table).select(s.select).limit(5000);
      if (error) throw error;
      if (!data || data.length === 0) { toast("info", "Tiada data untuk dieksport"); return; }
      downloadCSV(`${s.key}-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(data as unknown as Record<string, unknown>[]));
      toast("success", `${s.title} dijana`);
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageTitle icon="📥" title="Muat Turun" subtitle="Eksport data kurikulum dalam format CSV (Excel)" />
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {SOURCES.map((s) => {
          const Icon = s.icon;
          return (
            <Panel key={s.key} className="p-5">
              <div className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand"><Icon className="size-5" /></div>
              <h3 className="mt-3 font-bold text-ink">{s.title}</h3>
              <p className="mt-0.5 text-sm text-ink-muted">{s.desc}</p>
              <Button className="mt-4 w-full" variant="outline" loading={busy === s.key} onClick={() => gen(s)}>
                <Download className="size-4" /> Muat Turun CSV
              </Button>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
