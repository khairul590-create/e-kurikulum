import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { Badge } from "@/components/ui/Badge";
import { useOptions } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";
import { formatTarikh } from "@/lib/utils";

type Row = {
  id: string;
  jenis: string;
  tajuk: string;
  tarikh: string;
  catatan: string | null;
  profiles?: { nama: string } | null;
};

export default function SbdPlcPage() {
  const { isAdmin } = useAuth();
  const guru = useOptions("profiles", "nama", { orderBy: "nama" });

  const config: CrudConfig<Row> = {
    title: "SBD & PLC",
    subtitle: "Sekolah Berasaskan Data & Professional Learning Community",
    table: "sbd_plc",
    singular: "Rekod",
    select: "*, profiles!sbd_plc_guru_id_fkey(nama)",
    orderBy: "tarikh",
    searchKeys: ["tajuk"],
    columns: [
      { key: "jenis", header: "Jenis", render: (r) => <Badge tone={r.jenis === "SBD" ? "purple" : "blue"}>{r.jenis}</Badge> },
      { key: "tajuk", header: "Tajuk", render: (r) => <span className="font-medium text-ink">{r.tajuk}</span> },
      { key: "tarikh", header: "Tarikh", render: (r) => formatTarikh(r.tarikh) },
      { key: "guru", header: "Guru", render: (r) => r.profiles?.nama ?? "—" },
      { key: "catatan", header: "Catatan" },
    ],
    fields: [
      {
        name: "jenis",
        label: "Jenis",
        type: "select",
        required: true,
        options: [
          { value: "PLC", label: "PLC" },
          { value: "SBD", label: "SBD" },
        ],
      },
      { name: "tajuk", label: "Tajuk", required: true, full: true },
      { name: "tarikh", label: "Tarikh", type: "date", required: true },
      { name: "guru_id", label: "Guru", type: "select" },
      { name: "catatan", label: "Catatan", type: "textarea", full: true },
    ],
  };

  return <CrudPage config={config} canWrite={isAdmin} extraFieldOptions={{ guru_id: guru.data ?? [] }} />;
}
