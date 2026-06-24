import { useQuery } from "@tanstack/react-query";
import { many } from "@/lib/views";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { MkStatCard, StatRow } from "@/components/panel/MkStatCard";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Misc";
import type { RphGuruStatus } from "@/types/db";

export default function RekodRphPage() {
  const guru = useQuery({ queryKey: ["v_rph_guru_status"], queryFn: () => many<RphGuruStatus>("v_rph_guru_status") });
  const rows = (guru.data ?? []).filter((r) => r.jum_rph > 0 || r.rating_pencerapan != null);
  const purataHantar = rows.length ? Math.round(rows.reduce((s, r) => s + r.peratus_selesai, 0) / rows.length) : 0;
  const dicerap = rows.filter((r) => r.rating_pencerapan != null).length;
  const rated = rows.filter((r) => r.rating_pencerapan != null);
  const purataRating = rated.length ? (rated.reduce((s, r) => s + (r.rating_pencerapan ?? 0), 0) / rated.length).toFixed(1) : "0";

  return (
    <div>
      <PageTitle icon="📝" title="Rekod RPH & PdP" subtitle="Pemantauan Rancangan Pengajaran Harian & pelaksanaan PdP guru" />

      <StatRow>
        <MkStatCard sc={2} icon="✅" value={rows.length} label="Guru Ada RPH" />
        <MkStatCard sc={1} icon="📊" value={`${purataHantar}%`} label="Kadar Penghantaran" />
        <MkStatCard sc={3} icon="👁️" value={dicerap} label="Pencerapan Selesai" />
        <MkStatCard sc={5} icon="⭐" value={`${purataRating}/5`} label="Purata Pencerapan" />
      </StatRow>

      <Panel className="mt-3.5">
        <PanelHead variant="indigo" icon="📋">Status Penghantaran RPH Mengikut Guru</PanelHead>
        <PanelBody className="px-3 py-2">
          <table className="data-table">
            <thead><tr><th>Guru</th><th>Panitia</th><th>Jum. RPH</th><th className="w-44">Penghantaran</th><th>Pencerapan</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.guru_id}>
                  <td className="font-medium text-ink">{r.guru}</td>
                  <td>{r.subjek ?? "—"}</td>
                  <td className="text-center">{r.jum_rph}</td>
                  <td><div className="flex items-center gap-2"><Progress value={r.peratus_selesai} /><span className="text-[11px] font-semibold">{r.peratus_selesai}%</span></div></td>
                  <td className="text-center">{r.rating_pencerapan != null ? `⭐ ${r.rating_pencerapan}/5` : <span className="text-ink-soft">Belum</span>}</td>
                  <td><Badge tone={r.peratus_selesai >= 80 ? "green" : r.peratus_selesai >= 50 ? "blue" : "amber"}>{r.peratus_selesai >= 80 ? "Cemerlang" : r.peratus_selesai >= 50 ? "Baik" : "Perlu Susulan"}</Badge></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-ink-soft">Tiada rekod RPH.</td></tr>}
            </tbody>
          </table>
        </PanelBody>
      </Panel>
    </div>
  );
}
