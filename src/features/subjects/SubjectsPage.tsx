import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { useAuth } from "@/providers/AuthProvider";
import type { Subject } from "@/types/db";

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
    ],
    fields: [
      { name: "kod", label: "Kod", required: true },
      { name: "nama", label: "Nama", required: true },
      { name: "warna", label: "Warna (hex)", placeholder: "#2563EB" },
    ],
  };

  return <CrudPage config={config} canWrite={isAdmin} />;
}
