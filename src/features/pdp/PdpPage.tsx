import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { useOptions } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";
import { formatTarikh } from "@/lib/utils";

type Row = {
  id: string;
  tarikh: string;
  tajuk: string;
  catatan: string | null;
  subjects?: { nama: string } | null;
  classes?: { nama: string } | null;
  profiles?: { nama: string } | null;
};

export default function PdpPage() {
  const { profile } = useAuth();
  const subjek = useOptions("subjects", "nama", { orderBy: "nama" });
  const kelas = useOptions("classes", "nama", { orderBy: "nama" });

  const config: CrudConfig<Row> = {
    title: "Pelaksanaan PdP",
    subtitle: "Log aktiviti pengajaran & pembelajaran",
    table: "pdp_logs",
    singular: "Log PdP",
    select: "*, subjects(nama), classes(nama), profiles!pdp_logs_guru_id_fkey(nama)",
    orderBy: "tarikh",
    searchKeys: ["tajuk"],
    columns: [
      { key: "tarikh", header: "Tarikh", render: (r) => formatTarikh(r.tarikh) },
      { key: "tajuk", header: "Tajuk", render: (r) => <span className="font-medium text-ink">{r.tajuk}</span> },
      { key: "subjek", header: "Mata Pelajaran", render: (r) => r.subjects?.nama ?? "—" },
      { key: "kelas", header: "Kelas", render: (r) => r.classes?.nama ?? "—" },
      { key: "guru", header: "Guru", render: (r) => r.profiles?.nama ?? "—" },
    ],
    fields: [
      { name: "tajuk", label: "Tajuk Aktiviti", required: true, full: true },
      { name: "subject_id", label: "Mata Pelajaran", type: "select" },
      { name: "kelas_id", label: "Kelas", type: "select" },
      { name: "tarikh", label: "Tarikh", type: "date", required: true },
      { name: "catatan", label: "Catatan", type: "textarea", full: true },
    ],
    fromForm: (v) => ({
      tajuk: v.tajuk || null,
      subject_id: v.subject_id || null,
      kelas_id: v.kelas_id || null,
      tarikh: v.tarikh || new Date().toISOString().slice(0, 10),
      catatan: v.catatan || null,
      guru_id: profile?.id,
    }),
  };

  return (
    <CrudPage
      config={config}
      canWrite={!!profile}
      extraFieldOptions={{ subject_id: subjek.data ?? [], kelas_id: kelas.data ?? [] }}
    />
  );
}
