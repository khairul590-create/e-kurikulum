import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/AuthProvider";
import type { Room } from "@/types/db";

const STATUS_TONE: Record<string, "green" | "amber" | "slate"> = {
  aktif: "green",
  penyelenggaraan: "amber",
  tidak_aktif: "slate",
};

export default function RoomsPage() {
  const { isAdmin } = useAuth();

  const config: CrudConfig<Room> = {
    title: "Bilik & Kemudahan",
    subtitle: "Inventori bilik khas & kemudahan sekolah",
    table: "rooms",
    singular: "Bilik",
    orderBy: "nama",
    ascending: true,
    searchKeys: ["nama", "jenis"],
    columns: [
      { key: "nama", header: "Nama", render: (r) => <span className="font-medium text-ink">{r.nama}</span> },
      { key: "jenis", header: "Jenis" },
      { key: "kapasiti", header: "Kapasiti" },
      {
        key: "status",
        header: "Status",
        render: (r) => <Badge tone={STATUS_TONE[r.status] ?? "slate"}>{r.status.replace("_", " ")}</Badge>,
      },
    ],
    fields: [
      { name: "nama", label: "Nama Bilik", required: true, full: true },
      { name: "jenis", label: "Jenis", placeholder: "Makmal / Bilik Khas" },
      { name: "kapasiti", label: "Kapasiti", type: "number" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "aktif", label: "Aktif" },
          { value: "penyelenggaraan", label: "Penyelenggaraan" },
          { value: "tidak_aktif", label: "Tidak Aktif" },
        ],
      },
    ],
  };

  return <CrudPage config={config} canWrite={isAdmin} />;
}
