import { Link } from "react-router-dom";
import { Panel, PanelHead, PanelBody } from "@/components/panel/Panel";
import { MkStatCard, StatRow } from "@/components/panel/MkStatCard";
import { MkBar, GredRow, GaugeRow, GaugeBox, RankNo, ColChart, ModuleGrid } from "@/components/panel/Bits";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Misc";
import { formatNombor, formatTarikh } from "@/lib/utils";
import { useDashboard } from "./useDashboard";

const TP_GRAD = [
  "from-[#e53935] to-[#ef5350]",
  "from-[#ff6d00] to-[#ffa726]",
  "from-[#f9a825] to-[#ffca28]",
  "from-[#0fa968] to-[#66bb6a]",
  "from-[#1a73e8] to-[#42a5f5]",
  "from-[#7c4dff] to-[#ab47bc]",
];
const BAR_FILL = [
  "from-[#1a73e8] to-[#42a5f5]",
  "from-[#7c4dff] to-[#ab47bc]",
  "from-[#e53935] to-[#ef5350]",
  "from-[#0fa968] to-[#66bb6a]",
  "from-[#ff6d00] to-[#ffa726]",
  "from-[#00bcd4] to-[#4dd0e1]",
];
const STATUS_TONE: Record<string, "green" | "blue" | "amber"> = {
  Cemerlang: "green",
  Baik: "blue",
  "Perlu Fokus": "amber",
  Sederhana: "amber",
};
const ACT_DOT = ["#0fa968", "#1a73e8", "#7c4dff", "#f9a825"];

export default function Dashboard() {
  const d = useDashboard();
  const s = d.stats.data;
  const du = d.dashUasa.data?.[0];
  if (d.stats.isLoading) return <PageLoader />;

  const rows = d.tpTaburan.data ?? [];
  const tpCols = rows.map((t) => ({ label: `TP${t.tp}`, value: t.bilangan, grad: TP_GRAD[t.tp - 1] ?? TP_GRAD[0] }));
  const total = rows.reduce((a, t) => a + t.bilangan, 0);
  const rendah = rows.filter((t) => t.tp <= 2).reduce((a, t) => a + t.bilangan, 0);
  const sederhana = rows.filter((t) => t.tp === 3 || t.tp === 4).reduce((a, t) => a + t.bilangan, 0);
  const tinggi = rows.filter((t) => t.tp >= 5).reduce((a, t) => a + t.bilangan, 0);

  return (
    <div className="space-y-3.5">
      {/* Stat cards */}
      <StatRow>
        <MkStatCard sc={1} icon="👨‍🎓" value={formatNombor(s?.jum_murid)} label="Jumlah Murid" />
        <MkStatCard sc={2} icon="🏫" value={s?.jum_kelas ?? 0} label="Jumlah Kelas" />
        <MkStatCard sc={3} icon="📈" value={`${du?.purata_uasa ?? s?.purata_uasa ?? 0}%`} label="Purata UASA" />
        <MkStatCard sc={4} icon="📊" value={s?.purata_tp ?? 0} label="Purata TP (PBD)" />
        <MkStatCard sc={5} icon="📚" value={s?.jum_subjek ?? 0} label="Mata Pelajaran" />
        <MkStatCard sc={6} icon="✅" value={`${du?.peratus_lulus_uasa ?? s?.peratus_lulus_uasa ?? 0}%`} label="% Lulus UASA" />
        <MkStatCard sc={7} icon="👨‍🏫" value={s?.jum_guru ?? 0} label="Guru Akademik" />
      </StatRow>

      {/* Mid row */}
      <div className="flex flex-wrap gap-3.5">
        <Panel className="min-w-[340px] flex-[1.35]">
          <PanelHead variant="blue" icon="📊" tag="Tahun 4–6">Analisis UASA Mengikut Subjek</PanelHead>
          <PanelBody className="space-y-3">
            <p className="text-[11px] font-semibold text-[#555]">📋 Agihan Gred Keseluruhan (Markah /100 · Lulus 20%)</p>
            {(d.uasaGred.data ?? []).length > 0 ? (
              <GredRow data={(d.uasaGred.data ?? []).map((g) => ({ gred: g.gred, bil: g.bilangan }))} />
            ) : (
              <p className="text-[11px] text-ink-soft">Tiada data UASA.</p>
            )}
            <p className="pt-1 text-[11px] font-semibold text-[#555]">📈 Purata Peratus Mengikut Mata Pelajaran</p>
            <div className="flex flex-col gap-2.5">
              {(d.uasaSubjek.data ?? []).slice(0, 6).map((sub, i) => (
                <MkBar key={sub.subject_id} label={sub.subjek} value={sub.purata} fill={BAR_FILL[i % BAR_FILL.length]} />
              ))}
              {(d.uasaSubjek.data ?? []).length === 0 && <p className="text-[11px] text-ink-soft">Tiada data.</p>}
            </div>
          </PanelBody>
        </Panel>

        <div className="flex min-w-[280px] flex-1 flex-col gap-3.5">
          <Panel>
            <PanelHead variant="green" icon="📊" tag="Tahun 1–6">Analisis PBD — Tahap Penguasaan</PanelHead>
            <PanelBody>
              <p className="mb-1 text-[11px] font-semibold text-[#555]">Bilangan Murid Mengikut TP1–TP6</p>
              {tpCols.length > 0 ? <ColChart data={tpCols} /> : <p className="py-8 text-center text-[11px] text-ink-soft">Tiada data PBD.</p>}
              <GaugeRow className="mt-3">
                <GaugeBox tone="red" value={rendah} label={<>Rendah<br />TP1–TP2</>} />
                <GaugeBox tone="yellow" value={sederhana} label={<>Sederhana<br />TP3–TP4</>} />
                <GaugeBox tone="green" value={tinggi} label={<>Tinggi<br />TP5–TP6</>} />
              </GaugeRow>
              {total === 0 && null}
            </PanelBody>
          </Panel>
          <Panel>
            <PanelHead variant="indigo" icon="🧩">Struktur KSSR (Modular)</PanelHead>
            <PanelBody><ModuleGrid data={d.modular.data ?? []} /></PanelBody>
          </Panel>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex flex-wrap gap-3.5">
        <Panel className="min-w-[300px] flex-[1.2]">
          <PanelHead variant="purple" icon="🏆">Prestasi Panitia Mata Pelajaran</PanelHead>
          <PanelBody className="px-3 py-2">
            <table className="data-table">
              <thead><tr><th>#</th><th>Panitia</th><th>Purata</th><th>TP</th><th>Status</th></tr></thead>
              <tbody>
                {(d.panitia.data ?? []).slice(0, 6).map((p, i) => (
                  <tr key={p.subject_id}>
                    <td>{i + 1}</td>
                    <td className="font-medium text-ink">{p.subjek}</td>
                    <td><b>{p.purata_uasa}</b></td>
                    <td>TP{p.purata_tp}</td>
                    <td><Badge tone={STATUS_TONE[p.status] ?? "slate"}>{p.status}</Badge></td>
                  </tr>
                ))}
                {(d.panitia.data ?? []).length === 0 && <tr><td colSpan={5} className="py-6 text-center text-ink-soft">Tiada data.</td></tr>}
              </tbody>
            </table>
          </PanelBody>
        </Panel>

        <Panel className="min-w-[260px] flex-1">
          <PanelHead variant="orange" icon="🥇">Top 5 Murid Terbaik</PanelHead>
          <PanelBody className="px-3 py-2">
            <table className="data-table">
              <thead><tr><th>#</th><th>Nama</th><th>Kelas</th><th>Purata</th></tr></thead>
              <tbody>
                {(d.topMurid.data ?? []).slice(0, 5).map((m, i) => (
                  <tr key={m.student_id}>
                    <td><RankNo n={i + 1} /></td>
                    <td className="font-medium text-ink">{m.nama}</td>
                    <td>{m.kelas ?? "—"}</td>
                    <td><b>{m.purata}</b></td>
                  </tr>
                ))}
                {(d.topMurid.data ?? []).length === 0 && <tr><td colSpan={4} className="py-6 text-center text-ink-soft">Tiada data.</td></tr>}
              </tbody>
            </table>
          </PanelBody>
        </Panel>

        <Panel className="min-w-[240px] flex-[0.85]">
          <PanelHead variant="teal" icon="🔔">Aktiviti Terkini</PanelHead>
          <PanelBody className="space-y-2">
            {(d.activities.data ?? []).map((a, i) => (
              <div key={a.id} className="flex items-start gap-2.5 rounded-[10px] bg-[#f8f9ff] px-2.5 py-2">
                <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: ACT_DOT[i % ACT_DOT.length] }} />
                <div>
                  <div className="text-[11px] leading-snug text-ink">{a.action}</div>
                  <div className="text-[10px] text-[#999]">🕐 {formatTarikh(a.created_at)}</div>
                </div>
              </div>
            ))}
            {(d.activities.data ?? []).length === 0 && <p className="text-[11px] text-ink-soft">Tiada aktiviti.</p>}
          </PanelBody>
        </Panel>
      </div>

      <p className="px-1 text-[11px] text-ink-soft">
        Lihat analisis penuh: <Link to="/uasa" className="font-semibold text-brand">UASA</Link> ·{" "}
        <Link to="/pbd" className="font-semibold text-brand">PBD</Link> ·{" "}
        <Link to="/panitia" className="font-semibold text-brand">Panitia</Link>
      </p>
    </div>
  );
}
