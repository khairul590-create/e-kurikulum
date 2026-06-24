import { useQuery } from "@tanstack/react-query";
import { many } from "@/lib/views";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { TrendLine } from "@/components/charts/Charts";
import { PercentBar } from "@/components/charts/Bars";
import { Badge } from "@/components/ui/Badge";
import { PageHead } from "@/components/ui/PageHead";
import type { TahunPrestasi, TahunTrendGps } from "@/types/db";

const BAR_COLOR = ["#16A34A", "#2563EB", "#F59E0B", "#7C3AED", "#0EA5E9", "#EF4444"];

export default function AnalisisTahunPage() {
  const tahun = useQuery({ queryKey: ["v_tahun_prestasi"], queryFn: () => many<TahunPrestasi>("v_tahun_prestasi") });
  const trend = useQuery({ queryKey: ["v_tahun_trend_gps"], queryFn: () => many<TahunTrendGps>("v_tahun_trend_gps") });

  const rows = tahun.data ?? [];
  const uasaRows = rows.filter((r) => r.tahun >= 4);
  const trendData = (trend.data ?? []).map((t) => ({ bulan: t.sesi, purata: t.purata }));

  return (
    <div className="space-y-5">
      <PageHead title="📅 Analisis Tahun" subtitle="Perbandingan prestasi mengikut tahun (darjah)" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Purata UASA Mengikut Tahun" subtitle="Tahun 4–6" />
          <CardBody className="space-y-2.5 pt-1">
            {uasaRows.map((r, i) => <PercentBar key={r.tahun} label={`Tahun ${r.tahun}`} value={r.purata_uasa} color={BAR_COLOR[i % BAR_COLOR.length]} />)}
            {uasaRows.length === 0 && <p className="text-sm text-ink-soft">Tiada data UASA.</p>}
            <div className="pt-3">
              <p className="mb-1 text-sm font-semibold text-ink-muted">Trend GPS Sekolah Mengikut Sesi</p>
              {trendData.length ? <TrendLine data={trendData} /> : <p className="py-8 text-center text-sm text-ink-soft">Tiada data trend merentas sesi.</p>}
            </div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-5">
          <CardHeader title="Bilangan Murid" />
          <CardBody className="pt-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-2 py-2">Tahun</th>
                  <th className="px-2 py-2 text-center">Kelas</th>
                  <th className="px-2 py-2 text-center">Murid</th>
                  <th className="px-2 py-2">Penilaian</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.tahun} className="border-b border-line/70 last:border-0">
                    <td className="px-2 py-2.5 font-medium text-ink">Tahun {r.tahun}</td>
                    <td className="px-2 py-2.5 text-center">{r.bil_kelas}</td>
                    <td className="px-2 py-2.5 text-center">{r.bil_murid}</td>
                    <td className="px-2 py-2.5">
                      <Badge tone={r.tahun >= 4 ? "blue" : "green"}>{r.tahun >= 4 ? "UASA + PBD" : "PBD"}</Badge>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={4} className="px-2 py-8 text-center text-ink-soft">Tiada data.</td></tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
