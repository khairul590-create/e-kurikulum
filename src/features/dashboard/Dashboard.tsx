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
  School,
  Award,
  Trophy,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { StatCard } from "@/components/charts/StatCard";
import { DonutChart, TrendLine } from "@/components/charts/Charts";
import { ColumnChart } from "@/components/charts/ColumnChart";
import { PercentBar, GredBar } from "@/components/charts/Bars";
import { ModularCards } from "@/components/charts/ModularCards";
import { Badge } from "@/components/ui/Badge";
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

const TP_COLOR = ["#EF4444", "#F97316", "#F59E0B", "#16A34A", "#2563EB", "#7C3AED"];

const STATUS_TONE: Record<string, "green" | "blue" | "amber" | "red"> = {
  Cemerlang: "green",
  Baik: "blue",
  "Perlu Fokus": "amber",
  Sederhana: "amber",
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

  const tpCols = (d.tpTaburan.data ?? []).map((t) => ({
    label: `TP${t.tp}`,
    value: t.bilangan,
    color: TP_COLOR[t.tp - 1] ?? "#94A3B8",
  }));

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-ink lg:text-3xl">
          {salam}, {profile?.nama ?? "Cikgu"}! 👋
        </h2>
        <p className="text-sm font-semibold text-ink-muted">Berikut ringkasan pengurusan kurikulum sekolah.</p>
      </div>

      {/* Stat cards — 7 metrik mockup */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        <StatCard icon={GraduationCap} tint="light" label="Jumlah Murid" value={formatNombor(s?.jum_murid)} hint="Murid aktif" />
        <StatCard icon={School} tint="ocean" label="Jumlah Kelas" value={s?.jum_kelas ?? 0} hint="Kelas keseluruhan" />
        <StatCard icon={BarChart3} tint="sun" label="Purata UASA" value={`${s?.purata_uasa ?? 0}%`} hint="Markah purata" />
        <StatCard icon={TrendingUp} tint="indigo" label="Purata TP (PBD)" value={s?.purata_tp ?? 0} hint="Tahap penguasaan" />
        <StatCard icon={BookMarked} tint="blue" label="Mata Pelajaran" value={s?.jum_subjek ?? 0} hint="Jumlah subjek" />
        <StatCard icon={ClipboardCheck} tint="sky" label="% Lulus UASA" value={`${s?.peratus_lulus_uasa ?? 0}%`} hint="Markah ≥ 20%" />
        <StatCard icon={Users} tint="ocean" label="Guru Akademik" value={s?.jum_guru ?? 0} hint="Guru aktif" />
      </div>

      {/* Row UASA + PBD */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Analisis UASA Mengikut Subjek" subtitle="Tahun 4–6 · Lulus ≥ 20%"
            action={<Link to="/uasa" className="text-xs font-medium text-brand">Lihat Penuh</Link>} />
          <CardBody className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-ink-muted">Agihan Gred Keseluruhan</p>
              {(d.uasaGred.data ?? []).length > 0 ? (
                <GredBar counts={(d.uasaGred.data ?? []).map((g) => ({ gred: g.gred, bilangan: g.bilangan }))} />
              ) : (
                <p className="py-3 text-sm text-ink-soft">Tiada data UASA lagi.</p>
              )}
            </div>
            <div className="space-y-2.5">
              <p className="text-sm font-semibold text-ink-muted">Purata Peratus Mengikut Mata Pelajaran</p>
              {(d.uasaSubjek.data ?? []).map((sub) => (
                <PercentBar key={sub.subject_id} label={sub.subjek} value={sub.purata} color={sub.warna} />
              ))}
              {(d.uasaSubjek.data ?? []).length === 0 && <p className="text-sm text-ink-soft">Tiada data.</p>}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader title="Analisis PBD — Tahap Penguasaan" subtitle="Tahun 1–6 · TP1–TP6"
            action={<Link to="/pbd" className="text-xs font-medium text-brand">Lihat Penuh</Link>} />
          <CardBody>
            {tpCols.length > 0 ? (
              <ColumnChart data={tpCols} valueLabel="Bilangan murid" />
            ) : (
              <p className="py-16 text-center text-sm text-ink-soft">Tiada data PBD.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Row Panitia + KSSR + Top murid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader title="Prestasi Panitia" action={<Link to="/panitia" className="text-xs font-medium text-brand">Lihat Semua</Link>} />
          <CardBody className="pt-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-2 py-2">Panitia</th>
                  <th className="px-2 py-2">UASA</th>
                  <th className="px-2 py-2">TP</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(d.panitia.data ?? []).slice(0, 6).map((p) => (
                  <tr key={p.subject_id} className="border-b border-line/70 last:border-0">
                    <td className="px-2 py-2.5 font-medium text-ink">{p.subjek}</td>
                    <td className="px-2 py-2.5 font-bold text-ink">{p.purata_uasa}</td>
                    <td className="px-2 py-2.5 text-ink-muted">TP{p.purata_tp}</td>
                    <td className="px-2 py-2.5"><Badge tone={STATUS_TONE[p.status] ?? "slate"}>{p.status}</Badge></td>
                  </tr>
                ))}
                {(d.panitia.data ?? []).length === 0 && (
                  <tr><td colSpan={4} className="px-2 py-6 text-center text-ink-soft">Tiada data panitia.</td></tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Struktur KSSR (Modular)" />
          <CardBody className="pt-1">
            <ModularCards data={d.modular.data ?? []} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Top 5 Murid" action={<Trophy className="size-4 text-sun-deep" />} />
          <CardBody className="space-y-2.5 pt-1">
            {(d.topMurid.data ?? []).map((m, i) => (
              <div key={m.student_id} className="flex items-center gap-2.5">
                <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${
                  i === 0 ? "bg-sun-deep" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-slate-300"
                }`}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{m.nama}</p>
                  <p className="text-[11px] text-ink-soft">{m.kelas ?? "—"}</p>
                </div>
                <span className="text-sm font-bold text-ink">{m.purata}</span>
              </div>
            ))}
            {(d.topMurid.data ?? []).length === 0 && <p className="text-sm text-ink-soft">Tiada data.</p>}
          </CardBody>
        </Card>
      </div>

      {/* Row: Pencapaian donut | Trend | Pengumuman */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader title="Tahap Pencapaian Murid (PBD)" />
          <CardBody className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <DonutChart data={taburan} centerLabel="Purata TP" centerValue={`${s?.purata_tp ?? 0}`} />
            <div className="flex-1 space-y-3 self-stretch">
              {taburan.map((t) => (
                <div key={t.tahap} className="flex items-center gap-2 text-sm">
                  <span style={{ background: t.color }} className="size-2.5 rounded-full" />
                  <span className="flex-1 text-ink-muted">{t.name}</span>
                  <span className="font-semibold text-ink">{t.peratus}%</span>
                  <span className="w-12 text-right text-ink-soft">({formatNombor(t.value)})</span>
                </div>
              ))}
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
            {(d.announcements.data ?? []).length === 0 && <p className="text-sm text-ink-soft">Tiada pengumuman.</p>}
          </CardBody>
        </Card>
      </div>

      {/* Row: Aktiviti + Pintasan */}
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
              <Pintasan to="/uasa" icon={BarChart3} label="UASA" tint="bg-amber-50 text-amber-600" />
              <Pintasan to="/pbd" icon={Award} label="PBD" tint="bg-green-50 text-green-600" />
              <Pintasan to="/intervensi" icon={ClipboardCheck} label="Intervensi" tint="bg-red-50 text-red-600" />
              <Pintasan to="/rph" icon={ClipboardList} label="RPH" tint="bg-brand-50 text-brand" />
              <Pintasan to="/analisis-murid" icon={Users} label="Murid" tint="bg-pink-50 text-pink-600" />
              <Pintasan to="/laporan-kelas" icon={FileText} label="Laporan" tint="bg-purple-50 text-purple-600" />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* KPI mini */}
      <Card>
        <CardHeader title="Dashboard KPI" action={<Link to="/kpi" className="text-xs font-medium text-brand">Lihat KPI</Link>} />
        <CardBody className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiBar label="Penyediaan RPH" value={s?.peratus_rph ?? 0} />
          <KpiBar label="Lulus UASA" value={s?.peratus_lulus_uasa ?? 0} />
          <KpiBar label="Pelaksanaan Pentaksiran" value={d.pentaksiran.data?.peratus_tp4_atas ?? 0} />
          <KpiBar label="Purata UASA" value={s?.purata_uasa ?? 0} />
        </CardBody>
      </Card>
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

function KpiBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-ink-muted">{label}</span>
        <span className="font-semibold text-ink">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
