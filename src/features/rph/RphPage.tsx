import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { Badge } from "@/components/ui/Badge";
import { useOptions } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";
import { formatTarikh } from "@/lib/utils";

type Row = {
  id: string;
  tarikh: string;
  tajuk: string;
  status: "selesai" | "dalam_proses" | "belum_mula";
  minggu: number | null;
  subjects?: { nama: string } | null;
  classes?: { nama: string } | null;
  profiles?: { nama: string } | null;
};

const STATUS: Record<string, { tone: "green" | "blue" | "red"; label: string }> = {
  selesai: { tone: "green", label: "Selesai" },
  dalam_proses: { tone: "blue", label: "Dalam Proses" },
  belum_mula: { tone: "red", label: "Belum Mula" },
};

export default function RphPage() {
  const { profile } = useAuth();
  const subjek = useOptions("subjects", "nama", { orderBy: "nama" });
  const kelas = useOptions("classes", "nama", { orderBy: "nama" });

  const config: CrudConfig<Row> = {
    title: "Rancangan Pengajaran Harian (RPH)",
    subtitle: "Sediakan & jejak status RPH harian",
    table: "rph",
    singular: "RPH",
    select: "*, subjects(nama), classes(nama), profiles!rph_guru_id_fkey(nama)",
    orderBy: "tarikh",
    searchKeys: ["tajuk"],
    columns: [
      { key: "tarikh", header: "Tarikh", render: (r) => formatTarikh(r.tarikh) },
      { key: "tajuk", header: "Tajuk", render: (r) => <span className="font-medium text-ink">{r.tajuk}</span> },
      { key: "subjek", header: "Mata Pelajaran", render: (r) => r.subjects?.nama ?? "—" },
      { key: "kelas", header: "Kelas", render: (r) => r.classes?.nama ?? "—" },
      { key: "minggu", header: "Minggu", render: (r) => (r.minggu ? `M${r.minggu}` : "—") },
      { key: "guru", header: "Guru", render: (r) => r.profiles?.nama ?? "—" },
      {
        key: "status",
        header: "Status",
        render: (r) => <Badge tone={STATUS[r.status]?.tone}>{STATUS[r.status]?.label}</Badge>,
      },
    ],
    fields: [
      { name: "tajuk", label: "Tajuk", required: true, full: true },
      { name: "subject_id", label: "Mata Pelajaran", type: "select", required: true },
      { name: "kelas_id", label: "Kelas", type: "select" },
      { name: "tarikh", label: "Tarikh", type: "date", required: true },
      { name: "minggu", label: "Minggu", type: "number" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "belum_mula", label: "Belum Mula" },
          { value: "dalam_proses", label: "Dalam Proses" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      { name: "objektif", label: "Objektif Pembelajaran", type: "textarea", full: true },
      { name: "aktiviti", label: "Aktiviti PdP", type: "textarea", full: true },
      { name: "refleksi", label: "Refleksi", type: "textarea", full: true },
    ],
    fromForm: (v) => ({
      tajuk: v.tajuk || null,
      subject_id: v.subject_id || null,
      kelas_id: v.kelas_id || null,
      tarikh: v.tarikh || new Date().toISOString().slice(0, 10),
      minggu: v.minggu ? Number(v.minggu) : null,
      status: v.status || "belum_mula",
      objektif: v.objektif || null,
      aktiviti: v.aktiviti || null,
      refleksi: v.refleksi || null,
      guru_id: profile?.id, // RPH milik pengguna semasa (RLS)
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
