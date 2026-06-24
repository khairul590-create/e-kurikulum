import { useQuery } from "@tanstack/react-query";
import { many } from "@/lib/views";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PercentBar } from "@/components/charts/Bars";
import { Badge } from "@/components/ui/Badge";
import { PageHead } from "@/components/ui/PageHead";
import type { KelasPrestasi } from "@/types/db";

const STATUS_TONE: Record<string, "green" | "blue" | "amber"> = {
  Cemerlang: "green",
  Baik: "blue",
  Sederhana: "amber",
};

export default function AnalisisKelasPage() {
  const kelas = useQuery({ queryKey: ["v_kelas_prestasi"], queryFn: () => many<KelasPrestasi>("v_kelas_prestasi") });
  const rows = kelas.data ?? [];
  const withUasa = rows.filter((r) => r.purata_uasa > 0);
  const best = [...withUasa].sort((a, b) => b.purata_uasa - a.purata_uasa).slice(0, 3);
  const worst = [...withUasa].sort((a, b) => a.purata_uasa - b.purata_uasa).slice(0, 3);

  return (
    <div className="space-y-5">
      <PageHead title="🏫 Analisis Kelas" subtitle={`Prestasi akademik mengikut kelas · ${rows.length} kelas`} />

      <Card>
        <CardHeader title="Prestasi Keseluruhan Mengikut Kelas" />
        <CardBody className="pt-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Kelas</th>
                <th className="px-2 py-2 text-center">Bil. Murid</th>
                <th className="px-2 py-2 text-right">Purata UASA</th>
                <th className="px-2 py-2 text-center">TP Purata</th>
                <th className="px-2 py-2 text-center">% Lulus</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.kelas_id} className="border-b border-line/70 last:border-0">
                  <td className="px-2 py-2.5 text-ink-soft">{i + 1}</td>
                  <td className="px-2 py-2.5 font-medium text-ink">{r.kelas}</td>
                  <td className="px-2 py-2.5 text-center">{r.bil_murid}</td>
                  <td className="px-2 py-2.5 text-right font-bold text-ink">{r.tahun >= 4 ? r.purata_uasa : "—"}</td>
                  <td className="px-2 py-2.5 text-center text-ink-muted">TP{r.purata_tp}</td>
                  <td className="px-2 py-2.5 text-center">{r.tahun >= 4 ? `${r.peratus_lulus}%` : "—"}</td>
                  <td className="px-2 py-2.5"><Badge tone={STATUS_TONE[r.status] ?? "slate"}>{r.status}</Badge></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-2 py-8 text-center text-ink-soft">Tiada data kelas.</td></tr>
              )}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-ink-soft">* UASA hanya untuk Tahun 4–6. Tahun 1–3 dinilai melalui PBD sahaja.</p>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="🥇 3 Kelas Terbaik" />
          <CardBody className="space-y-2.5 pt-1">
            {best.map((r) => <PercentBar key={r.kelas_id} label={r.kelas} value={r.purata_uasa} color="#16A34A" />)}
            {best.length === 0 && <p className="text-sm text-ink-soft">Tiada data UASA.</p>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="⚠️ Kelas Perlu Perhatian" />
          <CardBody className="space-y-2.5 pt-1">
            {worst.map((r) => <PercentBar key={r.kelas_id} label={r.kelas} value={r.purata_uasa} color="#F59E0B" />)}
            {worst.length === 0 && <p className="text-sm text-ink-soft">Tiada data UASA.</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
