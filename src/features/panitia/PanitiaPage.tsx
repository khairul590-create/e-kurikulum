import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { many } from "@/lib/views";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { MkBar, ModuleGrid } from "@/components/panel/Bits";
import { Badge } from "@/components/ui/Badge";
import type { PanitiaPrestasi, KssrModular } from "@/types/db";

const STATUS_TONE: Record<string, "green" | "blue" | "amber"> = { Cemerlang: "green", Baik: "blue", "Perlu Fokus": "amber" };
const BAR_FILL = [
  "from-[#0fa968] to-[#66bb6a]",
  "from-[#1a73e8] to-[#42a5f5]",
  "from-[#ff6d00] to-[#ffa726]",
  "from-[#00bcd4] to-[#4dd0e1]",
  "from-[#7c4dff] to-[#ab47bc]",
  "from-[#e53935] to-[#ef5350]",
];

export default function PanitiaPage() {
  const prestasi = useQuery({ queryKey: ["v_panitia_prestasi"], queryFn: () => many<PanitiaPrestasi>("v_panitia_prestasi") });
  const modular = useQuery({ queryKey: ["v_kssr_modular"], queryFn: () => many<KssrModular>("v_kssr_modular") });
  const rows = prestasi.data ?? [];

  return (
    <div>
      <PageTitle icon="📋" title="Panitia & Mata Pelajaran" subtitle="Prestasi panitia, ketua panitia & bilangan guru mengikut mata pelajaran" />

      <Panel>
        <PanelHead variant="purple" icon="📊">Prestasi & Pengurusan Panitia</PanelHead>
        <PanelBody className="px-3 py-2">
          <table className="data-table">
            <thead><tr><th>Panitia</th><th>Ketua Panitia</th><th>Guru</th><th>Purata UASA</th><th>TP Purata</th><th>Status</th><th>Fail</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject_id}>
                  <td className="font-medium text-ink">
                    <Link to={`/panitia/${r.subject_id}`} className="inline-flex items-center gap-1.5 hover:text-brand hover:underline">
                      <span className="size-2.5 rounded-full" style={{ background: r.warna }} />{r.subjek}
                    </Link>
                  </td>
                  <td>{r.ketua ?? "—"}</td>
                  <td>{r.bil_guru}</td>
                  <td><b>{r.purata_uasa}</b></td>
                  <td>TP{r.purata_tp}</td>
                  <td><Badge tone={STATUS_TONE[r.status] ?? "slate"}>{r.status}</Badge></td>
                  <td><Link to={`/panitia/${r.subject_id}`} className="inline-flex items-center gap-1 text-brand hover:underline"><FolderOpen className="size-3.5" /> Buka</Link></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-ink-soft">Tiada data panitia.</td></tr>}
            </tbody>
          </table>
        </PanelBody>
      </Panel>

      <div className="mt-3.5 flex flex-wrap gap-3.5">
        <Panel className="min-w-[300px] flex-1">
          <PanelHead variant="indigo" icon="🧩">Struktur KSSR (Modular)</PanelHead>
          <PanelBody><ModuleGrid data={modular.data ?? []} /></PanelBody>
        </Panel>
        <Panel className="min-w-[300px] flex-1">
          <PanelHead variant="blue" icon="📊">Perbandingan Purata Panitia</PanelHead>
          <PanelBody className="flex flex-col gap-2.5">
            {rows.map((r, i) => <MkBar key={r.subject_id} label={r.subjek} value={r.purata_uasa} fill={BAR_FILL[i % BAR_FILL.length]} />)}
            {rows.length === 0 && <p className="text-[11px] text-ink-soft">Tiada data.</p>}
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
