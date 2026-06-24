import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { many } from "@/lib/views";
import { toCSV, downloadCSV } from "@/lib/csv";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { Field, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/toast";
import type { KelasPrestasi } from "@/types/db";

interface Roster { nama: string; jantina: string; status: string }

export default function LaporanKelasPage() {
  const toast = useToast();
  const [kelasId, setKelasId] = useState("");
  const kelas = useQuery({ queryKey: ["v_kelas_prestasi"], queryFn: () => many<KelasPrestasi>("v_kelas_prestasi") });
  const roster = useQuery({
    queryKey: ["roster", kelasId], enabled: !!kelasId,
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("nama, jantina, status").eq("kelas_id", kelasId).order("nama");
      if (error) throw error; return (data ?? []) as Roster[];
    },
  });
  const sel = kelas.data?.find((k) => k.kelas_id === kelasId);

  function exportRoster() {
    const d = roster.data ?? [];
    if (!d.length) { toast("info", "Tiada murid"); return; }
    downloadCSV(`laporan-kelas-${sel?.kelas ?? kelasId}.csv`, toCSV(d as unknown as Record<string, unknown>[]));
    toast("success", "Laporan kelas dijana");
  }

  return (
    <div>
      <PageTitle icon="📋" title="Laporan Kelas" subtitle="Analisis & senarai murid mengikut kelas" />

      <Panel className="mb-3.5">
        <PanelBody>
          <Field label="Pilih Kelas">
            <Select value={kelasId} onChange={(e) => setKelasId(e.target.value)}>
              <option value="">— Pilih Kelas —</option>
              {kelas.data?.map((k) => <option key={k.kelas_id} value={k.kelas_id}>{k.kelas}</option>)}
            </Select>
          </Field>
        </PanelBody>
      </Panel>

      {sel && (
        <Panel>
          <PanelHead variant="blue" icon="📋" tag={<button onClick={exportRoster} className="text-white underline">Eksport CSV</button>}>{`Ringkasan — ${sel.kelas}`}</PanelHead>
          <PanelBody className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Mini lab="Bil. Murid" val={sel.bil_murid} />
              <Mini lab="Purata UASA" val={sel.tahun >= 4 ? sel.purata_uasa : "—"} />
              <Mini lab="TP Purata" val={`TP${sel.purata_tp}`} />
              <Mini lab="% Lulus" val={sel.tahun >= 4 ? `${sel.peratus_lulus}%` : "—"} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink-muted">Senarai Murid</p>
              {roster.isLoading ? <PageLoader /> : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      <th className="px-2 py-2">#</th><th className="px-2 py-2">Nama</th><th className="px-2 py-2">Jantina</th><th className="px-2 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.data?.map((r, i) => (
                      <tr key={i} className="border-b border-line/70 last:border-0">
                        <td className="px-2 py-2 text-ink-soft">{i + 1}</td>
                        <td className="px-2 py-2 font-medium text-ink">{r.nama}</td>
                        <td className="px-2 py-2 text-ink-muted">{r.jantina === "L" ? "Lelaki" : "Perempuan"}</td>
                        <td className="px-2 py-2"><Badge tone="green">{r.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}

function Mini({ lab, val }: { lab: string; val: string | number }) {
  return (
    <div className="rounded-xl bg-cream/60 p-3 text-center">
      <p className="text-xl font-black text-ink">{val}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-ink-muted">{lab}</p>
    </div>
  );
}
