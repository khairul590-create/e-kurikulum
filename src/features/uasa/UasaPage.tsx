import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { DonutChart } from "@/components/charts/Charts";
import { GredBar, GRED_COLOR } from "@/components/charts/Bars";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Misc";
import { PageHead, InfoNote } from "@/components/ui/PageHead";
import { useAuth } from "@/providers/AuthProvider";
import { useUasa } from "./useUasa";

export default function UasaPage() {
  const { isAdmin } = useAuth();
  const u = useUasa();

  const overall = u.overall.data ?? [];
  const donut = overall.map((g) => ({ name: `Gred ${g.gred}`, value: g.bilangan, color: GRED_COLOR[g.gred] }));
  const totalSkor = overall.reduce((s, g) => s + g.bilangan, 0);
  const passOverall = u.pass.data ?? [];
  const purataLulus = passOverall.length
    ? Math.round(passOverall.reduce((s, p) => s + p.peratus_lulus, 0) / passOverall.length)
    : 0;
  const gredABpct = totalSkor
    ? Math.round((100 * (overall.filter((g) => g.gred === "A" || g.gred === "B").reduce((s, g) => s + g.bilangan, 0))) / totalSkor)
    : 0;
  const gagalPct = overall.find((g) => g.gred === "F")?.peratus ?? 0;

  return (
    <div className="space-y-5">
      <PageHead
        title="📈 Analisis UASA"
        subtitle="Ujian Akhir Sesi Akademik · Tahun 4–6 · 5 Mata Pelajaran Teras"
        action={isAdmin && (
          <Link to="/uasa/entry"><Button><Plus className="size-4" /> Kemasukan Markah</Button></Link>
        )}
      />
      <InfoNote>
        Pelaporan UASA menggunakan <b>markah peratus &amp; gred A–F</b> (bukan TP). Markah penuh 100,
        markah lulus minimum <b>20%</b>. Gred: A≥90, B≥80, C≥65, D≥50, E≥40, F&lt;40.
      </InfoNote>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Agihan Gred Mengikut Mata Pelajaran" />
          <CardBody className="pt-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-2 py-2">Mata Pelajaran</th>
                  <th className="px-2 py-2 text-center">A</th>
                  <th className="px-2 py-2 text-center">B</th>
                  <th className="px-2 py-2 text-center">C</th>
                  <th className="px-2 py-2 text-center">D</th>
                  <th className="px-2 py-2 text-center">E</th>
                  <th className="px-2 py-2 text-center">F</th>
                  <th className="px-2 py-2 text-right">Purata</th>
                </tr>
              </thead>
              <tbody>
                {u.subjek.data?.map((r) => (
                  <tr key={r.subject_id} className="border-b border-line/70 last:border-0">
                    <td className="px-2 py-2.5 font-medium text-ink">{r.subjek}</td>
                    <td className="px-2 py-2.5 text-center">{r.gred_a}</td>
                    <td className="px-2 py-2.5 text-center">{r.gred_b}</td>
                    <td className="px-2 py-2.5 text-center">{r.gred_c}</td>
                    <td className="px-2 py-2.5 text-center">{r.gred_d}</td>
                    <td className="px-2 py-2.5 text-center">{r.gred_e}</td>
                    <td className="px-2 py-2.5 text-center">{r.gred_f}</td>
                    <td className="px-2 py-2.5 text-right font-bold text-ink">{r.purata}%</td>
                  </tr>
                ))}
                {(u.subjek.data ?? []).length === 0 && (
                  <tr><td colSpan={8} className="px-2 py-8 text-center text-ink-soft">Tiada data UASA. Mula dengan kemasukan markah.</td></tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card>
            <CardHeader title="Agihan Gred Keseluruhan" />
            <CardBody className="flex flex-col items-center gap-4 sm:flex-row">
              <DonutChart data={donut} centerLabel="Skor" centerValue={String(totalSkor)} />
              <div className="flex-1">
                {overall.length ? (
                  <GredBar counts={overall.map((g) => ({ gred: g.gred, bilangan: g.bilangan }))} />
                ) : (
                  <p className="text-sm text-ink-soft">Tiada data.</p>
                )}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Kadar Lulus" />
            <CardBody className="grid grid-cols-3 gap-3">
              <Gauge value={`${purataLulus}%`} label="Lulus (≥20%)" tone="green" />
              <Gauge value={`${gredABpct}%`} label="Gred A & B" tone="blue" />
              <Gauge value={`${gagalPct}%`} label="Gagal (F)" tone="red" />
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Kadar Lulus Mengikut Subjek" />
        <CardBody className="space-y-3 pt-1">
          {(u.pass.data ?? []).map((p) => (
            <div key={p.subject_id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-ink-muted">{p.subjek}</span>
                <span className="font-semibold text-ink">{p.peratus_lulus}%</span>
              </div>
              <Progress value={p.peratus_lulus} color="#16A34A" />
            </div>
          ))}
          {(u.pass.data ?? []).length === 0 && <p className="text-sm text-ink-soft">Tiada data.</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Senarai Murid Cemerlang UASA" subtitle="Purata markah tertinggi" />
        <CardBody className="pt-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Nama Murid</th>
                <th className="px-2 py-2">Kelas</th>
                <th className="px-2 py-2 text-center">Bil. Subjek</th>
                <th className="px-2 py-2 text-right">Purata</th>
              </tr>
            </thead>
            <tbody>
              {u.cemerlang.data?.map((m, i) => (
                <tr key={m.student_id} className="border-b border-line/70 last:border-0">
                  <td className="px-2 py-2.5 text-ink-soft">{i + 1}</td>
                  <td className="px-2 py-2.5 font-medium text-ink">{m.nama}</td>
                  <td className="px-2 py-2.5 text-ink-muted">{m.kelas ?? "—"}</td>
                  <td className="px-2 py-2.5 text-center">{m.bil_subjek}</td>
                  <td className="px-2 py-2.5 text-right"><Badge tone="green">{m.purata}</Badge></td>
                </tr>
              ))}
              {(u.cemerlang.data ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-2 py-8 text-center text-ink-soft">Tiada data.</td></tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

function Gauge({ value, label, tone }: { value: string; label: string; tone: "green" | "blue" | "red" }) {
  const cls = {
    green: "bg-green-50 text-green-700",
    blue: "bg-brand-50 text-brand-700",
    red: "bg-red-50 text-red-600",
  }[tone];
  return (
    <div className={`rounded-xl p-3 text-center ${cls}`}>
      <p className="text-xl font-black">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold leading-tight">{label}</p>
    </div>
  );
}
