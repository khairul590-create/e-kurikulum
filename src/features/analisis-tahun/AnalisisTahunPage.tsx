import { useQuery } from "@tanstack/react-query";
import { many, rpc } from "@/lib/views";
import { useYear } from "@/providers/YearProvider";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { MkBar } from "@/components/panel/Bits";
import { TrendLine } from "@/components/charts/Charts";
import { Badge } from "@/components/ui/Badge";
import type { TahunPrestasi, TahunTrendGps } from "@/types/db";

const BAR_FILL = ["from-[#0fa968] to-[#66bb6a]", "from-[#1a73e8] to-[#42a5f5]", "from-[#ff6d00] to-[#ffa726]"];

export default function AnalisisTahunPage() {
  const { yearId } = useYear();
  const tahun = useQuery({ queryKey: ["fn_tahun_prestasi", yearId], queryFn: () => rpc<TahunPrestasi>("fn_tahun_prestasi", { p_year: yearId }) });
  const trend = useQuery({ queryKey: ["v_tahun_trend_gps"], queryFn: () => many<TahunTrendGps>("v_tahun_trend_gps") });
  const rows = tahun.data ?? [];
  const uasaRows = rows.filter((r) => r.tahun >= 4);
  const trendData = (trend.data ?? []).map((t) => ({ bulan: t.sesi, purata: t.purata }));

  return (
    <div>
      <PageTitle icon="📅" title="Analisis Tahun" subtitle="Perbandingan prestasi mengikut tahun (darjah)" />

      <div className="flex flex-wrap gap-3.5">
        <Panel className="min-w-[340px] flex-[1.35]">
          <PanelHead variant="blue" icon="📊">Purata UASA Mengikut Tahun</PanelHead>
          <PanelBody className="space-y-3">
            <div className="flex flex-col gap-2.5">
              {uasaRows.map((r, i) => <MkBar key={r.tahun} label={`Tahun ${r.tahun}`} value={r.purata_uasa} fill={BAR_FILL[i % BAR_FILL.length]} />)}
              {uasaRows.length === 0 && <p className="text-[11px] text-ink-soft">Tiada data UASA.</p>}
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold text-[#555]">📈 Trend GPS Sekolah Mengikut Sesi</p>
              {trendData.length > 0 ? <TrendLine data={trendData} /> : <p className="py-8 text-center text-[11px] text-ink-soft">Tiada data trend merentas sesi.</p>}
            </div>
          </PanelBody>
        </Panel>
        <div className="min-w-[280px] flex-1">
          <Panel>
            <PanelHead variant="green" icon="📋">Bilangan Murid</PanelHead>
            <PanelBody className="px-3 py-2">
              <table className="data-table">
                <thead><tr><th>Tahun</th><th>Kelas</th><th>Murid</th><th>Penilaian</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.tahun}>
                      <td className="font-medium text-ink">Tahun {r.tahun}</td>
                      <td>{r.bil_kelas}</td>
                      <td>{r.bil_murid}</td>
                      <td><Badge tone={r.tahun >= 4 ? "blue" : "green"}>{r.tahun >= 4 ? "UASA + PBD" : "PBD"}</Badge></td>
                    </tr>
                  ))}
                  {rows.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-ink-soft">Tiada data.</td></tr>}
                </tbody>
              </table>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
}
