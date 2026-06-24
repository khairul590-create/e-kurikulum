import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Panel, PanelHead, PanelBody, PageTitle, InfoNote } from "@/components/panel/Panel";
import { GaugeRow, GaugeBox } from "@/components/panel/Bits";
import { GRED_COLOR } from "@/components/charts/Bars";
import { DonutChart } from "@/components/charts/Charts";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { useYear } from "@/providers/YearProvider";
import { useUasa } from "./useUasa";

export default function UasaPage() {
  const { isAdmin } = useAuth();
  const { label } = useYear();
  const u = useUasa();

  const overall = u.overall.data ?? [];
  const donut = overall.map((g) => ({ name: `Gred ${g.gred}`, value: g.bilangan, color: GRED_COLOR[g.gred] }));
  const total = overall.reduce((s, g) => s + g.bilangan, 0);
  const pass = u.pass.data ?? [];
  const totSkor = pass.reduce((s, p) => s + p.jumlah, 0);
  const purataLulus = totSkor
    ? Math.round((100 * pass.reduce((s, p) => s + (p.peratus_lulus / 100) * p.jumlah, 0)) / totSkor)
    : 0;
  const gredAB = total
    ? Math.round((100 * overall.filter((g) => g.gred === "A" || g.gred === "B").reduce((s, g) => s + g.bilangan, 0)) / total)
    : 0;
  const gagal = overall.find((g) => g.gred === "F")?.peratus ?? 0;

  return (
    <div>
      <PageTitle
        icon="📈"
        title="Analisis UASA"
        subtitle={`Ujian Akhir Sesi Akademik · Tahun 4–6 · 5 Mata Pelajaran Teras · Sesi: ${label}`}
        action={isAdmin && <Link to="/uasa/entry"><Button><Plus className="size-4" /> Kemasukan Markah</Button></Link>}
      />
      <InfoNote>
        ℹ️ Pelaporan UASA menggunakan <b>markah peratus &amp; gred A–F</b>. Markah lulus minimum 20%.
        Gred: A≥90, B≥80, C≥65, D≥50, E≥40, F&lt;40. Tapis sesi guna pemilih di bar atas.
      </InfoNote>

      <div className="flex flex-wrap gap-3.5">
        <Panel className="min-w-[340px] flex-[1.35]">
          <PanelHead variant="blue" icon="📋">Agihan Gred Mengikut Mata Pelajaran</PanelHead>
          <PanelBody className="px-3 py-2">
            <table className="data-table">
              <thead><tr><th>Mata Pelajaran</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>Purata</th></tr></thead>
              <tbody>
                {u.subjek.data?.map((r) => (
                  <tr key={r.subject_id}>
                    <td className="font-medium text-ink">{r.subjek}</td>
                    <td>{r.gred_a}</td><td>{r.gred_b}</td><td>{r.gred_c}</td><td>{r.gred_d}</td><td>{r.gred_e}</td><td>{r.gred_f}</td>
                    <td><b>{r.purata}%</b></td>
                  </tr>
                ))}
                {(u.subjek.data ?? []).length === 0 && <tr><td colSpan={8} className="py-8 text-center text-ink-soft">Tiada data UASA. Mula dengan kemasukan markah.</td></tr>}
              </tbody>
            </table>
          </PanelBody>
        </Panel>

        <div className="flex min-w-[280px] flex-1 flex-col gap-3.5">
          <Panel>
            <PanelHead variant="green" icon="🍩">Agihan Gred Keseluruhan</PanelHead>
            <PanelBody className="flex flex-col items-center gap-4 sm:flex-row">
              {total > 0 ? (
                <DonutChart data={donut} centerLabel="Skor" centerValue={String(total)} />
              ) : (
                <div className="grid h-44 w-44 place-items-center text-[11px] text-ink-soft">Tiada data</div>
              )}
              <div className="flex flex-col gap-1.5">
                {overall.map((g) => (
                  <div key={g.gred} className="flex items-center gap-2 text-[11px]">
                    <span className="size-2.5 rounded-sm" style={{ background: GRED_COLOR[g.gred] }} />
                    {g.gred} — <b>{g.bilangan} ({g.peratus}%)</b>
                  </div>
                ))}
                {overall.length === 0 && <span className="text-[11px] text-ink-soft">Tiada data.</span>}
              </div>
            </PanelBody>
          </Panel>
          <Panel>
            <PanelHead variant="orange" icon="📊">Kadar Lulus</PanelHead>
            <PanelBody>
              <GaugeRow>
                <GaugeBox tone="green" value={`${purataLulus}%`} label="Lulus (≥20%)" />
                <GaugeBox tone="blue" value={`${gredAB}%`} label="Gred A & B" />
                <GaugeBox tone="red" value={`${gagal}%`} label="Gagal (F)" />
              </GaugeRow>
            </PanelBody>
          </Panel>
        </div>
      </div>

      <Panel className="mt-3.5">
        <PanelHead variant="purple" icon="🏅">Senarai Murid Cemerlang UASA</PanelHead>
        <PanelBody className="px-3 py-2">
          <table className="data-table">
            <thead><tr><th>#</th><th>Nama Murid</th><th>Kelas</th><th>Bil. Subjek</th><th>Purata</th></tr></thead>
            <tbody>
              {u.cemerlang.data?.map((m, i) => (
                <tr key={m.student_id}>
                  <td>{i + 1}</td>
                  <td className="font-medium text-ink">{m.nama}</td>
                  <td>{m.kelas ?? "—"}</td>
                  <td>{m.bil_subjek}</td>
                  <td><b>{m.purata}</b></td>
                </tr>
              ))}
              {(u.cemerlang.data ?? []).length === 0 && <tr><td colSpan={5} className="py-8 text-center text-ink-soft">Tiada data.</td></tr>}
            </tbody>
          </table>
        </PanelBody>
      </Panel>
    </div>
  );
}
