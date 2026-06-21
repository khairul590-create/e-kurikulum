import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/AuthProvider";
import type { Profile } from "@/types/db";

export default function TeachersPage() {
  const { isAdmin } = useAuth();

  const config: CrudConfig<Profile> = {
    title: "Guru",
    subtitle: "Senarai guru & kakitangan akademik",
    table: "profiles",
    singular: "Guru",
    orderBy: "nama",
    ascending: true,
    searchKeys: ["nama", "email", "jawatan"],
    columns: [
      { key: "nama", header: "Nama", render: (r) => <span className="font-medium text-ink">{r.nama}</span> },
      { key: "email", header: "Emel" },
      { key: "jawatan", header: "Jawatan" },
      {
        key: "role",
        header: "Peranan",
        render: (r) => <Badge tone={r.role === "admin" ? "purple" : "blue"}>{r.role}</Badge>,
      },
      {
        key: "is_ketua_panitia",
        header: "Ketua Panitia",
        render: (r) => (r.is_ketua_panitia ? <Badge tone="green">Ya</Badge> : "—"),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => <Badge tone={r.status === "aktif" ? "green" : "slate"}>{r.status}</Badge>,
      },
    ],
    // Nota: cipta akaun guru sebenar perlu melalui Supabase Auth.
    // Borang ini mengemas kini profil sedia ada sahaja.
    fields: [
      { name: "nama", label: "Nama", required: true, full: true },
      { name: "jawatan", label: "Jawatan" },
      { name: "no_telefon", label: "No. Telefon" },
      {
        name: "role",
        label: "Peranan",
        type: "select",
        options: [
          { value: "guru", label: "Guru" },
          { value: "admin", label: "Admin" },
        ],
      },
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

  return <CrudPage config={config} canWrite={isAdmin} />;
}
