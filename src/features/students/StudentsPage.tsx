import { useState } from "react";
import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { Badge } from "@/components/ui/Badge";
import { Field, Select } from "@/components/ui/Input";
import { useOptions } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";
import { formatTarikh } from "@/lib/utils";
import { ImportMuridDialog } from "./ImportMuridDialog";

type Row = {
  id: string;
  nama: string;
  no_sijil_lahir: string | null;
  jantina: "L" | "P";
  status: string;
  tarikh_masuk: string | null;
  kelas_id: string | null;
  classes?: { nama: string } | null;
};

// Susun ikut kelas (nombor tahun dikira betul: "2 Bestari" sebelum "10 ...") → nama murid
const sortByKelas = (a: Row, b: Row) => {
  const ka = a.classes?.nama ?? "~";
  const kb = b.classes?.nama ?? "~";
  const c = ka.localeCompare(kb, "ms", { numeric: true });
  return c !== 0 ? c : a.nama.localeCompare(b.nama, "ms");
};

export default function StudentsPage() {
  const { isAdmin } = useAuth();
  const kelas = useOptions("classes", "nama", { orderBy: "nama" });
  const [kelasFilter, setKelasFilter] = useState("");

  const config: CrudConfig<Row> = {
    title: "Murid",
    subtitle: "Pengurusan maklumat murid sekolah",
    table: "students",
    singular: "Murid",
    select: isAdmin ? "*, classes(nama)" : "id, nama, jantina, status, tarikh_masuk, kelas_id, classes(nama)",
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

  return (
    <CrudPage
      config={config}
      canWrite={isAdmin}
      extraFieldOptions={{ kelas_id: kelas.data ?? [] }}
      headerAction={isAdmin ? <ImportMuridDialog kelasOptions={kelas.data ?? []} /> : undefined}
      clientSort={sortByKelas}
      clientFilter={(r) => !kelasFilter || r.kelas_id === kelasFilter}
      toolbar={
        <div className="max-w-xs">
          <Field label="Tapis Kelas">
            <Select value={kelasFilter} onChange={(e) => setKelasFilter(e.target.value)}>
              <option value="">Semua Kelas</option>
              {(kelas.data ?? []).map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      }
    />
  );
}
