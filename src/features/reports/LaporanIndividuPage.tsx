import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toCSV, downloadCSV } from "@/lib/csv";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { Field, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/toast";
import { GRED_COLOR } from "@/components/charts/Bars";
import type { Student, UasaGred } from "@/types/db";

interface ScoreRow {
  markah: number;
  gred: UasaGred;
  lulus: boolean;
  uasa_records: { subjects: { nama: string } | null } | null;
}

export default function LaporanIndividuPage() {
  const toast = useToast();
  const [studentId, setStudentId] = useState("");

  const students = useQuery({ queryKey: ["students", "all-lapor"], queryFn: async () => {
    const { data, error } = await supabase.from("students").select("id, nama, kelas_id").eq("status", "aktif").order("nama");
    if (error) throw error; return (data ?? []) as Pick<Student, "id" | "nama" | "kelas_id">[];
  }});

  const scores = useQuery({
    queryKey: ["uasa-individu", studentId], enabled: !!studentId,
    queryFn: async () => {
      const { data, error } = await supabase.from("uasa_scores")
        .select("markah, gred, lulus, uasa_records(subjects(nama))")
        .eq("student_id", studentId);
      if (error) throw error;
      return (data ?? []) as unknown as ScoreRow[];
    },
  });

  const rows = scores.data ?? [];
  const purata = rows.length ? (rows.reduce((s, r) => s + r.markah, 0) / rows.length).toFixed(1) : "—";
  const sel = students.data?.find((s) => s.id === studentId);

  function exportSlip() {
    if (!rows.length) { toast("info", "Tiada markah UASA"); return; }
    const d = rows.map((r) => ({ subjek: r.uasa_records?.subjects?.nama ?? "—", markah: r.markah, gred: r.gred, lulus: r.lulus ? "Lulus" : "Gagal" }));
    downloadCSV(`slip-${sel?.nama ?? studentId}.csv`, toCSV(d));
    toast("success", "Slip dijana");
  }

  return (
    <div>
      <PageTitle icon="📄" title="Laporan Individu" subtitle="Slip keputusan UASA & prestasi individu murid" />

      <Panel className="mb-3.5">
        <PanelBody>
          <Field label="Pilih Murid">
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">— Pilih Murid —</option>
              {students.data?.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </Select>
          </Field>
        </PanelBody>
      </Panel>

      {studentId && (
        <Panel>
          <PanelHead variant="blue" icon="📄" tag={<button onClick={exportSlip} className="text-white underline">Eksport</button>}>{`Slip Keputusan UASA — ${sel?.nama ?? ""}`}</PanelHead>
          <PanelBody className="px-3 py-2">
            {scores.isLoading ? <PageLoader /> : rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-soft">Tiada markah UASA untuk murid ini.</p>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      <th className="px-2 py-2">Mata Pelajaran</th><th className="px-2 py-2 text-right">Markah</th><th className="px-2 py-2 text-center">Gred</th><th className="px-2 py-2 text-center">Keputusan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-line/70 last:border-0">
                        <td className="px-2 py-2.5 font-medium text-ink">{r.uasa_records?.subjects?.nama ?? "—"}</td>
                        <td className="px-2 py-2.5 text-right font-bold text-ink">{r.markah}</td>
                        <td className="px-2 py-2.5 text-center">
                          <span className="inline-grid size-6 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: GRED_COLOR[r.gred] }}>{r.gred}</span>
                        </td>
                        <td className="px-2 py-2.5 text-center"><Badge tone={r.lulus ? "green" : "red"}>{r.lulus ? "Lulus" : "Gagal"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-line font-bold text-ink">
                      <td className="px-2 py-2.5">Purata</td><td className="px-2 py-2.5 text-right">{purata}</td><td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </>
            )}
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}
