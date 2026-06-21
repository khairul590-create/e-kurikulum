import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { useOptions } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";

type Row = {
  id: string;
  tahun: number;
  minggu: number | null;
  tajuk: string;
  standard_kandungan: string | null;
  subjects?: { nama: string } | null;
};

export default function RptPage() {
  const { isAdmin } = useAuth();
  const subjek = useOptions("subjects", "nama", { orderBy: "nama" });

  const config: CrudConfig<Row> = {
    title: "Rancangan Pengajaran Tahunan (RPT)",
    subtitle: "Skema kerja tahunan mengikut mata pelajaran",
    table: "rpt",
    singular: "RPT",
    select: "*, subjects(nama)",
    orderBy: "tahun",
    ascending: true,
    searchKeys: ["tajuk"],
    columns: [
      { key: "subjek", header: "Mata Pelajaran", render: (r) => r.subjects?.nama ?? "—" },
      { key: "tahun", header: "Tahun" },
      { key: "minggu", header: "Minggu", render: (r) => (r.minggu ? `M${r.minggu}` : "—") },
      { key: "tajuk", header: "Tajuk", render: (r) => <span className="font-medium text-ink">{r.tajuk}</span> },
      { key: "standard_kandungan", header: "Standard Kandungan" },
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
      { name: "minggu", label: "Minggu", type: "number" },
      { name: "tajuk", label: "Tajuk", required: true, full: true },
      { name: "standard_kandungan", label: "Standard Kandungan", type: "textarea", full: true },
    ],
  };

  return <CrudPage config={config} canWrite={isAdmin} extraFieldOptions={{ subject_id: subjek.data ?? [] }} />;
}
