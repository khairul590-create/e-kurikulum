import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { useAuth } from "@/providers/AuthProvider";
import type { Subject } from "@/types/db";

const MODUL_LABEL: Record<string, string> = {
  teras_asas: "Teras Asas",
  teras_tema: "Teras Tema",
  elektif: "Elektif",
};

export default function SubjectsPage() {
  const { isAdmin } = useAuth();

  const config: CrudConfig<Subject> = {
    title: "Mata Pelajaran",
    subtitle: "Senarai mata pelajaran KSSR",
    table: "subjects",
    singular: "Mata Pelajaran",
    orderBy: "kod",
    ascending: true,
    searchKeys: ["kod", "nama"],
    columns: [
      { key: "kod", header: "Kod", render: (r) => <span className="font-semibold text-ink">{r.kod}</span> },
      { key: "nama", header: "Nama Mata Pelajaran" },
      {
        key: "warna",
        header: "Warna",
        render: (r) => (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 rounded-full" style={{ background: r.warna }} />
            <span className="text-ink-muted">{r.warna}</span>
          </span>
        ),
      },
      { key: "modul", header: "Modul KSSR", render: (r) => <span className="text-ink-muted">{MODUL_LABEL[r.modul ?? ""] ?? "—"}</span> },
      { key: "is_uasa", header: "UASA", render: (r) => (r.is_uasa ? "✅" : "—") },
    ],
    fields: [
      { name: "kod", label: "Kod", required: true },
      { name: "nama", label: "Nama", required: true },
      { name: "warna", label: "Warna (hex)", placeholder: "#2563EB" },
      {
        name: "modul", label: "Modul KSSR", type: "select",
        options: [
          { value: "teras_asas", label: "Teras Asas" },
          { value: "teras_tema", label: "Teras Tema" },
          { value: "elektif", label: "Elektif" },
        ],
      },
      { name: "is_uasa", label: "Subjek UASA (Tahun 4–6)?", type: "checkbox" },
    ],
  };

  return <CrudPage config={config} canWrite={isAdmin} />;
}
