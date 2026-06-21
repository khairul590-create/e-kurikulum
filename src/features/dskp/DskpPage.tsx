import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { useOptions } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";

type Row = {
  id: string;
  tahun: number;
  tajuk: string;
  dokumen_url: string | null;
  subjects?: { nama: string } | null;
};

export default function DskpPage() {
  const { isAdmin } = useAuth();
  const subjek = useOptions("subjects", "nama", { orderBy: "nama" });

  const config: CrudConfig<Row> = {
    title: "DSKP",
    subtitle: "Dokumen Standard Kurikulum & Pentaksiran",
    table: "dskp",
    singular: "DSKP",
    select: "*, subjects(nama)",
    orderBy: "tahun",
    ascending: true,
    searchKeys: ["tajuk"],
    columns: [
      { key: "subjek", header: "Mata Pelajaran", render: (r) => r.subjects?.nama ?? "—" },
      { key: "tahun", header: "Tahun" },
      { key: "tajuk", header: "Tajuk", render: (r) => <span className="font-medium text-ink">{r.tajuk}</span> },
      {
        key: "dokumen_url",
        header: "Dokumen",
        render: (r) =>
          r.dokumen_url ? (
            <a href={r.dokumen_url} target="_blank" className="text-brand hover:underline">
              Buka
            </a>
          ) : (
            "—"
          ),
      },
    ],
    fields: [
      { name: "subject_id", label: "Mata Pelajaran", type: "select", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "select",
        required: true,
        options: [1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `Tahun ${n}` })),
      },
      { name: "tajuk", label: "Tajuk", required: true, full: true },
      { name: "dokumen_url", label: "Pautan Dokumen (URL)", full: true },
    ],
  };

  return <CrudPage config={config} canWrite={isAdmin} extraFieldOptions={{ subject_id: subjek.data ?? [] }} />;
}
