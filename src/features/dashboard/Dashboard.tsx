import { Link } from "react-router-dom";
import {
  BookMarked,
  Users,
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  CalendarDays,
  FileText,
  ClipboardList,
  BarChart3,
  Megaphone,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { StatCard } from "@/components/charts/StatCard";
import { DonutChart, TrendLine, HBar } from "@/components/charts/Charts";
import { PageLoader, Progress } from "@/components/ui/Misc";
import { useAuth } from "@/providers/AuthProvider";
import { formatNombor, formatTarikh } from "@/lib/utils";
import { useDashboard } from "./useDashboard";

const TAHAP_META: Record<string, { label: string; color: string }> = {
  cemerlang: { label: "Cemerlang (90% ke atas)", color: "#16A34A" },
  baik: { label: "Baik (75% – 89%)", color: "#2563EB" },
  memuaskan: { label: "Memuaskan (60% – 74%)", color: "#F59E0B" },
  perlu_bimbingan: { label: "Perlu Bimbingan (59% ke bawah)", color: "#EF4444" },
};
const RPH_META: Record<string, { label: string; color: string }> = {
  selesai: { label: "Selesai", color: "#16A34A" },
  dalam_proses: { label: "Dalam Proses", color: "#2563EB" },
  belum_mula: { label: "Belum Mula", color: "#EF4444" },
};

export default function Dashboard() {
  const { profile } = useAuth();
  const d = useDashboard();
  const s = d.stats.data;

  const hour = new Date().getHours();
  const salam = hour < 12 ? "Selamat pagi" : hour < 19 ? "Selamat petang" : "Selamat malam";

  if (d.stats.isLoading) return <PageLoader />;

  const taburan = (d.taburan.data ?? []).map((t) => ({
    name: TAHAP_META[t.tahap]?.label ?? t.tahap,
    value: t.bilangan,
    color: TAHAP_META[t.tahap]?.color ?? "#94A3B8",
    peratus: t.peratus,
    tahap: t.tahap,
  }));
  const rphStatus = (d.rphStatus.data ?? []).map((r) => ({
    name: RPH_META[r.status]?.label ?? r.status,
    value: r.bilangan,
    color: RPH_META[r.status]?.color ?? "#94A3B8",
    peratus: r.peratus,
    status: r.status,
  }));

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-ink lg:text-3xl">
          {salam}, {profile?.nama ?? "Cikgu"}! 👋
        </h2>
        <p className="text-sm font-semibold text-ink-muted">Berikut ringkasan pelaksanaan kurikulum di sekolah.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={BookMarked} tint="blue" label="Mata Pelajaran" value={s?.jum_subjek ?? 0} hint="Jumlah mata pelajaran" />
        <StatCard icon={Users} tint="ocean" label="Guru Aktif" value={s?.jum_guru ?? 0} hint="Jumlah guru aktif" />
        <StatCard icon={GraduationCap} tint="light" label="Murid Aktif" value={formatNombor(s?.jum_murid)} hint="Jumlah murid" />
        <StatCard icon={ClipboardCheck} tint="sky" label="RPH Disediakan" value={`${s?.peratus_rph ?? 0}%`} hint="Daripada keseluruhan RPH" />
        <StatCard icon={BarChart3} tint="sun" label="Tahap Pencapaian" value={`${s?.purata_pencapaian ?? 0}%`} hint="Purata keseluruhan sekolah" />
      </div>

      {/* Row 1: Pencapaian donut | Trend | Pengumuman */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader title="Tahap Pencapaian Murid (Keseluruhan)" />
          <CardBody className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <DonutChart data={taburan} centerLabel="Purata" centerValue={`${s?.purata_pencapaian ?? 0}%`} />
            <div className="flex-1 space-y-3 self-stretch">
              {taburan.map((t) => (
                <div key={t.tahap} className="flex items-center gap-2 text-sm">
                  <span style={{ background: t.color }} className="size-2.5 rounded-full" />
                  <span className="flex-1 text-ink-muted">{t.name}</span>
                  <span className="font-semibold text-ink">{t.peratus}%</span>
                  <span className="w-12 text-right text-ink-soft">({formatNombor(t.value)})</span>
                </div>
              ))}
              <div className="border-t border-line pt-2 text-right text-sm text-ink-muted">
                Jumlah Murid: <span className="font-semibold text-ink">{formatNombor(s?.jum_murid)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Trend Pencapaian (Purata %)" subtitle="Tahun semasa" />
          <CardBody>
            {d.trend.data && d.trend.data.length > 0 ? (
              <TrendLine data={d.trend.data} />
            ) : (
              <p className="py-16 text-center text-sm text-ink-soft">Tiada data trend.</p>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Pengumuman" action={<Link to="/kalendar" className="text-xs font-medium text-brand">Lihat Semua</Link>} />
          <CardBody className="space-y-3 pt-2">
            {(d.announcements.data ?? []).map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand">
                  <Megaphone className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{a.tajuk}</p>
                  <p className="text-xs text-ink-muted">{a.kandungan}</p>
                  <p className="mt-0.5 text-[11px] text-ink-soft">{formatTarikh(a.tarikh)}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Row 2: RPH donut | RPH per subjek | Pentaksiran */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-3">
          <CardHeader title="Pelaksanaan RPH" />
          <CardBody className="flex flex-col items-center gap-4">
            <DonutChart
              data={rphStatus}
              centerLabel="Selesai"
              centerValue={`${rphStatus.find((r) => r.status === "selesai")?.peratus ?? 0}%`}
            />
            <div className="w-full space-y-2">
              {rphStatus.map((r) => (
                <div key={r.status} className="flex items-center gap-2 text-sm">
                  <span style={{ background: r.color }} className="size-2.5 rounded-full" />
                  <span className="flex-1 text-ink-muted">{r.name}</span>
                  <span className="font-semibold text-ink">{r.peratus}%</span>
                  <span className="text-ink-soft">({formatNombor(r.value)})</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader
            title="RPH Mengikut Mata Pelajaran"
            action={<Link to="/rph" className="text-xs font-medium text-brand">Lihat Semua</Link>}
          />
          <CardBody>
            <HBar data={(d.rphSubjek.data ?? []).slice(0, 5).map((r) => ({ subjek: r.subjek, peratus: r.peratus_selesai, warna: r.warna }))} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Pentaksiran & Pencapaian" />
          <CardBody className="space-y-4 pt-1">
            <RingkasanRow icon={ClipboardCheck} tint="bg-brand-50 text-brand" label="Pentaksiran Formatif" value={formatNombor(d.pentaksiran.data?.formatif)} sub="Dilaksanakan" />
            <RingkasanRow icon={ClipboardList} tint="bg-purple-50 text-purple-600" label="Pentaksiran Sumatif" value={formatNombor(d.pentaksiran.data?.sumatif)} sub="Dilaksanakan" />
            <RingkasanRow icon={FileText} tint="bg-green-50 text-green-600" label="Murid TP4 ke atas" value={`${d.pentaksiran.data?.peratus_tp4_atas ?? 0}%`} sub="Daripada keseluruhan" />
            <RingkasanRow icon={TrendingUp} tint="bg-amber-50 text-amber-600" label="Purata Pencapaian" value={`${s?.purata_pencapaian ?? 0}%`} sub="Sekolah keseluruhan" />
          </CardBody>
        </Card>
      </div>

      {/* Row 3: Aktiviti + Pintasan */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader title="Aktiviti Terbaru" action={<Link to="/laporan" className="text-xs font-medium text-brand">Lihat Semua</Link>} />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    <th className="px-2 py-2.5">Tarikh</th>
                    <th className="px-2 py-2.5">Aktiviti</th>
                    <th className="px-2 py-2.5">Perincian</th>
                    <th className="px-2 py-2.5">Oleh</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.activities.data ?? []).map((a) => (
                    <tr key={a.id} className="border-b border-line/70 last:border-0">
                      <td className="whitespace-nowrap px-2 py-3 text-ink-muted">{formatTarikh(a.created_at)}</td>
                      <td className="px-2 py-3 font-medium text-ink">{a.action}</td>
                      <td className="px-2 py-3 text-ink-muted">{a.detail}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-ink-muted">{a.actor_nama}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4 lg:col-span-4">
          <Card>
            <CardHeader title="Kalendar Akademik" action={<Link to="/kalendar" className="text-xs font-medium text-brand">Penuh</Link>} />
            <CardBody className="space-y-2.5 pt-1">
              {(d.events.data ?? []).slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
                    <CalendarDays className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{e.tajuk}</p>
                    <p className="text-xs text-ink-soft">{formatTarikh(e.tarikh_mula)}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pintasan Pantas" />
            <CardBody className="grid grid-cols-3 gap-3">
              <Pintasan to="/rph" icon={ClipboardList} label="RPH" tint="bg-brand-50 text-brand" />
              <Pintasan to="/pdp" icon={GraduationCap} label="PdP" tint="bg-green-50 text-green-600" />
              <Pintasan to="/pentaksiran" icon={ClipboardCheck} label="Pentaksiran" tint="bg-amber-50 text-amber-600" />
              <Pintasan to="/laporan" icon={FileText} label="Laporan" tint="bg-purple-50 text-purple-600" />
              <Pintasan to="/murid" icon={Users} label="Murid" tint="bg-pink-50 text-pink-600" />
              <Pintasan to="/analisis" icon={BarChart3} label="Analisis" tint="bg-sky-50 text-sky-600" />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* KPI mini */}
      <Card>
        <CardHeader title="Dashboard KPI" action={<Link to="/kpi" className="text-xs font-medium text-brand">Lihat KPI</Link>} />
        <CardBody className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiBar label="Penyediaan RPH" value={s?.peratus_rph ?? 0} />
          <KpiBar label="Pencapaian Murid" value={s?.purata_pencapaian ?? 0} />
          <KpiBar label="Pelaksanaan Pentaksiran" value={d.pentaksiran.data?.peratus_tp4_atas ?? 0} />
          <KpiBar label="Jumlah Kelas" value={s?.jum_kelas ?? 0} raw />
        </CardBody>
      </Card>
    </div>
  );
}

function RingkasanRow({
  icon: Icon,
  tint,
  label,
  value,
  sub,
}: {
  icon: typeof ClipboardCheck;
  tint: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${tint}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-soft">{sub}</p>
      </div>
      <p className="text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function Pintasan({ to, icon: Icon, label, tint }: { to: string; icon: typeof Users; label: string; tint: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 rounded-xl border border-line p-3 transition hover:bg-slate-50">
      <div className={`grid size-10 place-items-center rounded-xl ${tint}`}>
        <Icon className="size-5" />
      </div>
      <span className="text-xs font-medium text-ink">{label}</span>
    </Link>
  );
}

function KpiBar({ label, value, raw }: { label: string; value: number; raw?: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-ink-muted">{label}</span>
        <span className="font-semibold text-ink">{raw ? value : `${value}%`}</span>
      </div>
      {!raw && <Progress value={value} />}
    </div>
  );
}
