import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FileText, Eye, Star } from "lucide-react";
import { many } from "@/lib/views";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { StatCard } from "@/components/charts/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Misc";
import { PageHead } from "@/components/ui/PageHead";
import type { RphGuruStatus } from "@/types/db";

export default function RekodRphPage() {
  const guru = useQuery({ queryKey: ["v_rph_guru_status"], queryFn: () => many<RphGuruStatus>("v_rph_guru_status") });
  const rows = (guru.data ?? []).filter((r) => r.jum_rph > 0 || r.rating_pencerapan != null);

  const totalGuru = rows.length;
  const purataHantar = rows.length ? Math.round(rows.reduce((s, r) => s + r.peratus_selesai, 0) / rows.length) : 0;
  const dicerap = rows.filter((r) => r.rating_pencerapan != null).length;
  const purataRating = (() => {
    const r = rows.filter((x) => x.rating_pencerapan != null);
    return r.length ? (r.reduce((s, x) => s + (x.rating_pencerapan ?? 0), 0) / r.length).toFixed(1) : "0";
  })();

  return (
    <div className="space-y-5">
      <PageHead title="📝 Rekod RPH & PdP" subtitle="Pemantauan Rancangan Pengajaran Harian & pelaksanaan PdP guru" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CheckCircle2} tint="ocean" label="Guru Ada RPH" value={totalGuru} hint="Guru aktif" />
        <StatCard icon={FileText} tint="blue" label="Kadar Penghantaran" value={`${purataHantar}%`} hint="Purata selesai" />
        <StatCard icon={Eye} tint="indigo" label="Pencerapan Selesai" value={dicerap} hint="Guru dicerap" />
        <StatCard icon={Star} tint="sun" label="Purata Pencerapan" value={`${purataRating}/5`} hint="Skor pemerhatian" />
      </div>

      <Card>
        <CardHeader title="Status Penghantaran RPH Mengikut Guru" />
        <CardBody className="pt-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <th className="px-2 py-2">Guru</th>
                <th className="px-2 py-2">Panitia</th>
                <th className="px-2 py-2 text-center">Jum. RPH</th>
                <th className="px-2 py-2 w-44">Penghantaran</th>
                <th className="px-2 py-2 text-center">Pencerapan</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.guru_id} className="border-b border-line/70 last:border-0">
                  <td className="px-2 py-2.5 font-medium text-ink">{r.guru}</td>
                  <td className="px-2 py-2.5 text-ink-muted">{r.subjek ?? "—"}</td>
                  <td className="px-2 py-2.5 text-center">{r.jum_rph}</td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2"><Progress value={r.peratus_selesai} /><span className="text-xs font-semibold text-ink">{r.peratus_selesai}%</span></div>
                  </td>
                  <td className="px-2 py-2.5 text-center">{r.rating_pencerapan != null ? `⭐ ${r.rating_pencerapan}/5` : <span className="text-ink-soft">Belum</span>}</td>
                  <td className="px-2 py-2.5">
                    <Badge tone={r.peratus_selesai >= 80 ? "green" : r.peratus_selesai >= 50 ? "blue" : "amber"}>
                      {r.peratus_selesai >= 80 ? "Cemerlang" : r.peratus_selesai >= 50 ? "Baik" : "Perlu Susulan"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-2 py-8 text-center text-ink-soft">Tiada rekod RPH.</td></tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
