import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { useOptions } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";

type Row = {
  id: string;
  nama: string;
  tahun: number;
  guru_kelas_id: string | null;
  profiles?: { nama: string } | null;
};

export default function ClassesPage() {
  const { isAdmin } = useAuth();
  const guru = useOptions("profiles", "nama", { orderBy: "nama" });

  const config: CrudConfig<Row> = {
    title: "Kelas",
    subtitle: "Pengurusan kelas mengikut tahun",
    table: "classes",
    singular: "Kelas",
    select: "*, profiles!classes_guru_kelas_id_fkey(nama)",
    orderBy: "tahun",
    ascending: true,
    searchKeys: ["nama"],
    columns: [
      { key: "nama", header: "Kelas", render: (r) => <span className="font-medium text-ink">{r.nama}</span> },
      { key: "tahun", header: "Tahun" },
      { key: "guru", header: "Guru Kelas", render: (r) => r.profiles?.nama ?? "—" },
    ],
    fields: [
      { name: "nama", label: "Nama Kelas", required: true, placeholder: "5 Bestari" },
      {
        name: "tahun",
        label: "Tahun",
        type: "select",
        required: true,
        options: [1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `Tahun ${n}` })),
      },
      { name: "guru_kelas_id", label: "Guru Kelas", type: "select" },
    ],
  };

  return <CrudPage config={config} canWrite={isAdmin} extraFieldOptions={{ guru_kelas_id: guru.data ?? [] }} />;
}
