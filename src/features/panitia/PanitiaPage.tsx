import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { many } from "@/lib/views";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PercentBar } from "@/components/charts/Bars";
import { ModularCards } from "@/components/charts/ModularCards";
import { Badge } from "@/components/ui/Badge";
import { PageHead } from "@/components/ui/PageHead";
import type { PanitiaPrestasi, KssrModular } from "@/types/db";

const STATUS_TONE: Record<string, "green" | "blue" | "amber" | "red"> = {
  Cemerlang: "green",
  Baik: "blue",
  "Perlu Fokus": "amber",
};

export default function PanitiaPage() {
  const prestasi = useQuery({ queryKey: ["v_panitia_prestasi"], queryFn: () => many<PanitiaPrestasi>("v_panitia_prestasi") });
  const modular = useQuery({ queryKey: ["v_kssr_modular"], queryFn: () => many<KssrModular>("v_kssr_modular") });
  const rows = prestasi.data ?? [];

  return (
    <div className="space-y-5">
      <PageHead title="📋 Panitia & Mata Pelajaran" subtitle="Prestasi panitia, ketua panitia & bilangan guru mengikut mata pelajaran" />

      <Card>
        <CardHeader title="Prestasi & Pengurusan Panitia" />
        <CardBody className="pt-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <th className="px-2 py-2">Panitia</th>
                <th className="px-2 py-2">Ketua Panitia</th>
                <th className="px-2 py-2 text-center">Guru</th>
                <th className="px-2 py-2 text-right">Purata UASA</th>
                <th className="px-2 py-2 text-center">TP Purata</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2 text-right">Fail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject_id} className="border-b border-line/70 last:border-0">
                  <td className="px-2 py-2.5 font-medium text-ink">
                    <Link to={`/panitia/${r.subject_id}`} className="inline-flex items-center gap-2 hover:text-brand hover:underline">
                      <span className="size-3 rounded-full" style={{ background: r.warna }} />{r.subjek}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-ink-muted">{r.ketua ?? "—"}</td>
                  <td className="px-2 py-2.5 text-center">{r.bil_guru}</td>
                  <td className="px-2 py-2.5 text-right font-bold text-ink">{r.purata_uasa}</td>
                  <td className="px-2 py-2.5 text-center text-ink-muted">TP{r.purata_tp}</td>
                  <td className="px-2 py-2.5"><Badge tone={STATUS_TONE[r.status] ?? "slate"}>{r.status}</Badge></td>
                  <td className="px-2 py-2.5 text-right">
                    <Link to={`/panitia/${r.subject_id}`} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                      <FolderOpen className="size-3.5" /> Buka
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-2 py-8 text-center text-ink-soft">Tiada data panitia.</td></tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Struktur KSSR (Modular)" />
          <CardBody className="pt-1"><ModularCards data={modular.data ?? []} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Perbandingan Purata Panitia" />
          <CardBody className="space-y-2.5 pt-1">
            {rows.map((r) => <PercentBar key={r.subject_id} label={r.subjek} value={r.purata_uasa} color={r.warna} />)}
            {rows.length === 0 && <p className="text-sm text-ink-soft">Tiada data.</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
