import { useQuery } from "@tanstack/react-query";
import { many } from "@/lib/views";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { MkBar } from "@/components/panel/Bits";
import { Badge } from "@/components/ui/Badge";
import type { KelasPrestasi } from "@/types/db";

const STATUS_TONE: Record<string, "green" | "blue" | "amber"> = { Cemerlang: "green", Baik: "blue", Sederhana: "amber" };

export default function AnalisisKelasPage() {
  const kelas = useQuery({ queryKey: ["v_kelas_prestasi"], queryFn: () => many<KelasPrestasi>("v_kelas_prestasi") });
  const rows = kelas.data ?? [];
  const withUasa = rows.filter((r) => r.purata_uasa > 0);
  const best = [...withUasa].sort((a, b) => b.purata_uasa - a.purata_uasa).slice(0, 3);
  const worst = [...withUasa].sort((a, b) => a.purata_uasa - b.purata_uasa).slice(0, 3);

  return (
    <div>
      <PageTitle icon="🏫" title="Analisis Kelas" subtitle={`Prestasi akademik mengikut kelas · ${rows.length} kelas`} />

      <Panel>
        <PanelHead variant="blue" icon="🏫">Prestasi Keseluruhan Mengikut Kelas</PanelHead>
        <PanelBody className="px-3 py-2">
          <table className="data-table">
            <thead><tr><th>#</th><th>Kelas</th><th>Bil. Murid</th><th>Purata UASA</th><th>TP Purata</th><th>% Lulus</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.kelas_id}>
                  <td>{i + 1}</td>
                  <td className="font-medium text-ink">{r.kelas}</td>
                  <td>{r.bil_murid}</td>
                  <td><b>{r.tahun >= 4 ? r.purata_uasa : "—"}</b></td>
                  <td>TP{r.purata_tp}</td>
                  <td>{r.tahun >= 4 ? `${r.peratus_lulus}%` : "—"}</td>
                  <td><Badge tone={STATUS_TONE[r.status] ?? "slate"}>{r.status}</Badge></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-ink-soft">Tiada data kelas.</td></tr>}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] text-[#999]">* UASA hanya untuk Tahun 4–6. Tahun 1–3 dinilai melalui PBD sahaja.</p>
        </PanelBody>
      </Panel>

      <div className="mt-3.5 flex flex-wrap gap-3.5">
        <Panel className="min-w-[300px] flex-1">
          <PanelHead variant="green" icon="🥇">3 Kelas Terbaik</PanelHead>
          <PanelBody className="flex flex-col gap-2.5">
            {best.map((r) => <MkBar key={r.kelas_id} label={r.kelas} value={r.purata_uasa} fill="from-[#0fa968] to-[#66bb6a]" />)}
            {best.length === 0 && <p className="text-[11px] text-ink-soft">Tiada data UASA.</p>}
          </PanelBody>
        </Panel>
        <Panel className="min-w-[300px] flex-1">
          <PanelHead variant="orange" icon="⚠️">Kelas Perlu Perhatian</PanelHead>
          <PanelBody className="flex flex-col gap-2.5">
            {worst.map((r) => <MkBar key={r.kelas_id} label={r.kelas} value={r.purata_uasa} fill="from-[#ff6d00] to-[#ffa726]" />)}
            {worst.length === 0 && <p className="text-[11px] text-ink-soft">Tiada data UASA.</p>}
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
