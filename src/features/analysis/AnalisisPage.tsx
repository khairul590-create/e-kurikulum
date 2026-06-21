import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { DonutChart, TrendLine, HBar } from "@/components/charts/Charts";
import { StatCard } from "@/components/charts/StatCard";
import { PageLoader, Progress } from "@/components/ui/Misc";
import { useDashboard } from "@/features/dashboard/useDashboard";
import { formatNombor } from "@/lib/utils";
import { GraduationCap, Award, TrendingUp, BookMarked } from "lucide-react";

const TAHAP_META: Record<string, { label: string; color: string }> = {
  cemerlang: { label: "Cemerlang", color: "#16A34A" },
  baik: { label: "Baik", color: "#2563EB" },
  memuaskan: { label: "Memuaskan", color: "#F59E0B" },
  perlu_bimbingan: { label: "Perlu Bimbingan", color: "#EF4444" },
};

export default function AnalisisPage() {
  const d = useDashboard();
  const s = d.stats.data;
  if (d.stats.isLoading) return <PageLoader />;

  const taburan = (d.taburan.data ?? []).map((t) => ({
    name: TAHAP_META[t.tahap]?.label ?? t.tahap,
    value: t.bilangan,
    color: TAHAP_META[t.tahap]?.color ?? "#94A3B8",
    peratus: t.peratus,
    tahap: t.tahap,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Analisis Pencapaian</h1>
        <p className="text-sm text-ink-muted">Taburan & trend pencapaian murid sekolah</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={GraduationCap} tint="blue" label="Purata Sekolah" value={`${s?.purata_pencapaian ?? 0}%`} />
        <StatCard icon={Award} tint="ocean" label="Murid Cemerlang" value={`${taburan.find((t) => t.tahap === "cemerlang")?.peratus ?? 0}%`} />
        <StatCard icon={TrendingUp} tint="sun" label="TP4 ke atas" value={`${d.pentaksiran.data?.peratus_tp4_atas ?? 0}%`} />
        <StatCard icon={BookMarked} tint="light" label="RPH Selesai" value={`${s?.peratus_rph ?? 0}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Taburan Tahap Pencapaian" />
          <CardBody className="flex flex-col items-center gap-6 sm:flex-row">
            <DonutChart data={taburan} centerLabel="Purata" centerValue={`${s?.purata_pencapaian ?? 0}%`} />
            <div className="flex-1 space-y-3">
              {taburan.map((t) => (
                <div key={t.tahap}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-muted">
                      <span className="size-2.5 rounded-full" style={{ background: t.color }} />
                      {t.name}
                    </span>
                    <span className="font-semibold text-ink">
                      {t.peratus}% ({formatNombor(t.value)})
                    </span>
                  </div>
                  <Progress value={t.peratus} color={t.color} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Trend Pencapaian Bulanan" />
          <CardBody>
            {d.trend.data && d.trend.data.length > 0 ? (
              <TrendLine data={d.trend.data} />
            ) : (
              <p className="py-16 text-center text-sm text-ink-soft">Tiada data.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Penyediaan RPH Mengikut Mata Pelajaran" />
        <CardBody>
          <HBar data={(d.rphSubjek.data ?? []).map((r) => ({ subjek: r.subjek, peratus: r.peratus_selesai, warna: r.warna }))} />
        </CardBody>
      </Card>
    </div>
  );
}
