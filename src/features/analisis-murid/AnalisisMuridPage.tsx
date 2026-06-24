import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { many } from "@/lib/views";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { RankNo } from "@/components/panel/Bits";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
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
    <div>
      <PageTitle icon="🧑‍🎓" title="Analisis Murid" subtitle="Carian individu, prestasi & pencapaian murid" />

      <div className="relative mb-3.5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
        <Input className="pl-9" placeholder="🔍 Cari nama murid..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {q.trim() && (
        <Panel className="mb-3.5">
          <PanelBody className="divide-y divide-line/70 py-2">
            {found.map((r) => (
              <div key={r.student_id} className="flex items-center justify-between py-2 text-[12px]">
                <span><b className="text-ink">{r.nama}</b> <span className="text-ink-soft">· {r.kelas ?? "—"}</span></span>
                <Badge tone={r.purata >= 75 ? "green" : r.purata >= 50 ? "blue" : "red"}>{r.purata}</Badge>
              </div>
            ))}
            {found.length === 0 && <p className="py-2 text-[12px] text-ink-soft">Tiada padanan.</p>}
          </PanelBody>
        </Panel>
      )}

      <div className="flex flex-wrap gap-3.5">
        <Panel className="min-w-[300px] flex-1">
          <PanelHead variant="green" icon="🥇">Top 10 Murid Terbaik</PanelHead>
          <PanelBody className="px-3 py-2">
            <table className="data-table">
              <thead><tr><th>#</th><th>Nama</th><th>Kelas</th><th>Purata</th></tr></thead>
              <tbody>
                {top.map((r, i) => (
                  <tr key={r.student_id}>
                    <td><RankNo n={i + 1} /></td>
                    <td className="font-medium text-ink">{r.nama}</td>
                    <td>{r.kelas ?? "—"}</td>
                    <td><b>{r.purata}</b></td>
                  </tr>
                ))}
                {top.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-ink-soft">Tiada data.</td></tr>}
              </tbody>
            </table>
          </PanelBody>
        </Panel>
        <Panel className="min-w-[300px] flex-1">
          <PanelHead variant="orange" icon="⚠️">Murid Perlu Bimbingan</PanelHead>
          <PanelBody className="px-3 py-2">
            <table className="data-table">
              <thead><tr><th>Nama</th><th>Kelas</th><th>Purata</th><th>Status</th></tr></thead>
              <tbody>
                {bimbingan.map((r) => (
                  <tr key={r.student_id}>
                    <td className="font-medium text-ink">{r.nama}</td>
                    <td>{r.kelas ?? "—"}</td>
                    <td><b>{r.purata}</b></td>
                    <td><Badge tone={r.purata < 40 ? "red" : "amber"}>{r.purata < 40 ? "Pemulihan" : "Bimbingan"}</Badge></td>
                  </tr>
                ))}
                {bimbingan.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-ink-soft">Tiada murid perlu bimbingan.</td></tr>}
              </tbody>
            </table>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
