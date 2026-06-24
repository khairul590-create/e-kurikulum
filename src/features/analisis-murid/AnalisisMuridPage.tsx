import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { many } from "@/lib/views";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageHead } from "@/components/ui/PageHead";
import type { UasaCemerlangMurid } from "@/types/db";

export default function AnalisisMuridPage() {
  const murid = useQuery({ queryKey: ["v_uasa_cemerlang_murid", "all"], queryFn: () => many<UasaCemerlangMurid>("v_uasa_cemerlang_murid", "purata", false) });
  const [q, setQ] = useState("");

  const rows = murid.data ?? [];
  const top = rows.slice(0, 10);
  const bimbingan = useMemo(() => [...rows].filter((r) => r.purata < 50).sort((a, b) => a.purata - b.purata).slice(0, 10), [rows]);
  const found = useMemo(() => {
    if (!q.trim()) return [];
    const t = q.toLowerCase();
    return rows.filter((r) => r.nama.toLowerCase().includes(t)).slice(0, 20);
  }, [q, rows]);

  return (
    <div className="space-y-5">
      <PageHead title="🧑‍🎓 Analisis Murid" subtitle="Carian individu, prestasi & pencapaian murid" />

      <Card>
        <CardBody className="pt-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <Input className="pl-9" placeholder="Cari nama murid..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {q.trim() && (
            <div className="mt-3 divide-y divide-line/70">
              {found.map((r) => (
                <div key={r.student_id} className="flex items-center justify-between py-2 text-sm">
                  <div><span className="font-medium text-ink">{r.nama}</span> <span className="text-ink-soft">· {r.kelas ?? "—"}</span></div>
                  <Badge tone={r.purata >= 75 ? "green" : r.purata >= 50 ? "blue" : "red"}>{r.purata}</Badge>
                </div>
              ))}
              {found.length === 0 && <p className="py-3 text-sm text-ink-soft">Tiada padanan.</p>}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="🥇 Top 10 Murid Terbaik" />
          <CardBody className="pt-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-2 py-2">#</th><th className="px-2 py-2">Nama</th><th className="px-2 py-2">Kelas</th><th className="px-2 py-2 text-right">Purata</th>
                </tr>
              </thead>
              <tbody>
                {top.map((r, i) => (
                  <tr key={r.student_id} className="border-b border-line/70 last:border-0">
                    <td className="px-2 py-2.5 text-ink-soft">{i + 1}</td>
                    <td className="px-2 py-2.5 font-medium text-ink">{r.nama}</td>
                    <td className="px-2 py-2.5 text-ink-muted">{r.kelas ?? "—"}</td>
                    <td className="px-2 py-2.5 text-right font-bold text-ink">{r.purata}</td>
                  </tr>
                ))}
                {top.length === 0 && <tr><td colSpan={4} className="px-2 py-8 text-center text-ink-soft">Tiada data.</td></tr>}
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="⚠️ Murid Perlu Bimbingan" />
          <CardBody className="pt-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-2 py-2">Nama</th><th className="px-2 py-2">Kelas</th><th className="px-2 py-2 text-right">Markah</th><th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bimbingan.map((r) => (
                  <tr key={r.student_id} className="border-b border-line/70 last:border-0">
                    <td className="px-2 py-2.5 font-medium text-ink">{r.nama}</td>
                    <td className="px-2 py-2.5 text-ink-muted">{r.kelas ?? "—"}</td>
                    <td className="px-2 py-2.5 text-right font-bold text-ink">{r.purata}</td>
                    <td className="px-2 py-2.5"><Badge tone={r.purata < 40 ? "red" : "amber"}>{r.purata < 40 ? "Pemulihan" : "Bimbingan"}</Badge></td>
                  </tr>
                ))}
                {bimbingan.length === 0 && <tr><td colSpan={4} className="px-2 py-8 text-center text-ink-soft">Tiada murid perlu bimbingan.</td></tr>}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
