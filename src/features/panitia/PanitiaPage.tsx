import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { many, rpc } from "@/lib/views";
import { useYear } from "@/providers/YearProvider";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { MkBar, ModuleGrid } from "@/components/panel/Bits";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { driveFolderEmbed } from "@/lib/drive";
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
  const { yearId } = useYear();
  const prestasi = useQuery({ queryKey: ["fn_panitia_prestasi", yearId], queryFn: () => rpc<PanitiaPrestasi>("fn_panitia_prestasi", { p_year: yearId }) });
  const modular = useQuery({ queryKey: ["v_kssr_modular"], queryFn: () => many<KssrModular>("v_kssr_modular") });
  const drive = useQuery({
    queryKey: ["school_settings_drive"],
    queryFn: async () => {
      const { data } = await supabase.from("school_settings").select("drive_url").eq("id", 1).single();
      return (data?.drive_url ?? null) as string | null;
    },
  });
  const rows = prestasi.data ?? [];
  const folderEmbed = driveFolderEmbed(drive.data);

  return (
    <div>
      <PageTitle icon="📋" title="Panitia & Mata Pelajaran" subtitle="Prestasi panitia, ketua panitia & bilangan guru mengikut mata pelajaran" />

      <Panel className="mb-3.5">
        <PanelHead variant="blue" icon="📁" tag={drive.data ? <a href={drive.data} target="_blank" rel="noreferrer" className="text-white underline">Buka</a> : undefined}>Drive Sekolah (Semua Panitia)</PanelHead>
        <PanelBody>
          {folderEmbed ? (
            <iframe title="Drive Sekolah" src={folderEmbed} className="h-72 w-full rounded-xl border border-line" />
          ) : drive.data ? (
            <a href={drive.data} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full"><FolderOpen className="size-4" /> Buka Drive Sekolah</Button></a>
          ) : (
            <p className="py-6 text-center text-[11px] text-ink-soft">Belum ada pautan Drive sekolah. Admin boleh set di Tetapan.</p>
          )}
        </PanelBody>
      </Panel>

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
