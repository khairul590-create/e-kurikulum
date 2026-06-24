import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { Badge } from "@/components/ui/Badge";
import { useOptions } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";
import { formatTarikh } from "@/lib/utils";

type Row = {
  id: string;
  nama: string;
  no_sijil_lahir: string | null;
  jantina: "L" | "P";
  status: string;
  tarikh_masuk: string | null;
  classes?: { nama: string } | null;
};

export default function StudentsPage() {
  const { isAdmin } = useAuth();
  const kelas = useOptions("classes", "nama", { orderBy: "nama" });

  const config: CrudConfig<Row> = {
    title: "Murid",
    subtitle: "Pengurusan maklumat murid sekolah",
    table: "students",
    singular: "Murid",
    select: isAdmin ? "*, classes(nama)" : "id, nama, jantina, status, tarikh_masuk, classes(nama)",
    orderBy: "nama",
    ascending: true,
    searchKeys: isAdmin ? ["nama", "no_sijil_lahir"] : ["nama"],
    columns: [
      { key: "nama", header: "Nama", render: (r) => <span className="font-medium text-ink">{r.nama}</span> },
      ...(isAdmin ? [{ key: "no_sijil_lahir" as keyof Row, header: "No. Sijil Lahir" }] : []),
      { key: "jantina", header: "Jantina", render: (r) => (r.jantina === "L" ? "Lelaki" : "Perempuan") },
      { key: "kelas", header: "Kelas", render: (r) => r.classes?.nama ?? "—" },
      { key: "tarikh_masuk", header: "Tarikh Masuk", render: (r) => formatTarikh(r.tarikh_masuk) },
      {
        key: "status",
        header: "Status",
        render: (r) => <Badge tone={r.status === "aktif" ? "green" : "slate"}>{r.status}</Badge>,
      },
    ],
    fields: [
      { name: "nama", label: "Nama Penuh", required: true, full: true },
      ...(isAdmin ? [{ name: "no_sijil_lahir" as keyof Row, label: "No. Sijil Lahir" }] : []),
      {
        name: "jantina",
        label: "Jantina",
        type: "select",
        required: true,
        options: [
          { value: "L", label: "Lelaki" },
          { value: "P", label: "Perempuan" },
        ],
      },
      { name: "kelas_id", label: "Kelas", type: "select" },
      { name: "tarikh_masuk", label: "Tarikh Masuk", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "aktif", label: "Aktif" },
          { value: "tidak_aktif", label: "Tidak Aktif" },
        ],
      },
    ],
  };

  return <CrudPage config={config} canWrite={isAdmin} extraFieldOptions={{ kelas_id: kelas.data ?? [] }} />;
}
