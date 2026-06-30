import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/AuthProvider";
import { useOptions } from "@/lib/crud";
import type { Profile } from "@/types/db";

export default function TeachersPage() {
  const { isAdmin } = useAuth();
  const subjectOpts = useOptions("subjects", "nama", { orderBy: "nama" });

  const config: CrudConfig<Profile> = {
    title: "Guru & Pengguna",
    subtitle: "Tambah nama guru (untuk dropdown semua tab) · akaun login tetap melalui Supabase Auth",
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
    // Tambah guru = cipta rekod nama sahaja (tiada akaun login).
    // Untuk beri akaun login sebenar, guna Supabase Auth → profil auto-link.
    fields: [
      { name: "nama", label: "Nama", required: true, full: true },
      { name: "email", label: "Emel (pilihan)" },
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
      { name: "panitia_subject_id", label: "Panitia (Mata Pelajaran)", type: "select" },
      { name: "is_ketua_panitia", label: "Ketua Panitia?", type: "checkbox" },
    ],
    // Pastikan nilai NOT NULL ada default supaya INSERT/UPDATE tak gagal
    fromForm: (v) => ({
      nama: (v.nama as string)?.trim(),
      email: (v.email as string)?.trim() || null,
      jawatan: (v.jawatan as string)?.trim() || null,
      no_telefon: (v.no_telefon as string)?.trim() || null,
      role: (v.role as string) || "guru",
      status: (v.status as string) || "aktif",
      panitia_subject_id: v.panitia_subject_id || null,
      is_ketua_panitia: !!v.is_ketua_panitia,
    }),
  };

  return <CrudPage config={config} canWrite={isAdmin} extraFieldOptions={{ panitia_subject_id: subjectOpts.data ?? [] }} />;
}
