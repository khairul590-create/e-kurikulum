import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { Button } from "@/components/ui/Button";
import { useOptions } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";
import { useYear } from "@/providers/YearProvider";
import type { JadualRow } from "@/types/db";

const HARI = ["", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
const fmt = (t?: string | null) => (t ? t.slice(0, 5) : "");

const HARI_OPTS = [1, 2, 3, 4, 5].map((d) => ({ value: String(d), label: HARI[d] }));

export default function JadualUrusPage() {
  const { isAdmin } = useAuth();
  const { yearId } = useYear();

  const guru = useOptions("profiles", "nama", { orderBy: "nama" });
  const kelas = useOptions("classes", "nama", { orderBy: "nama" });
  const subjek = useOptions("subjects", "nama", { orderBy: "nama" });

  const config: CrudConfig<JadualRow> = {
    title: "Urus Jadual Waktu",
    subtitle: "Tambah / kemaskini slot mengajar guru",
    table: "jadual_waktu",
    singular: "Slot",
    select: "*, guru:profiles(nama), kelas:classes(nama), subjek:subjects(nama,warna)",
    orderBy: "masa_mula",
    ascending: true,
    searchKeys: ["bilik", "sesi"],
    columns: [
      { key: "guru", header: "Guru", render: (r) => <span className="font-medium text-ink">{r.guru?.nama ?? "—"}</span> },
      { key: "hari", header: "Hari", render: (r) => HARI[r.hari] ?? r.hari },
      { key: "masa", header: "Waktu", render: (r) => `${fmt(r.masa_mula)}–${fmt(r.masa_akhir)}` },
      { key: "kelas", header: "Kelas", render: (r) => r.kelas?.nama ?? "—" },
      {
        key: "subjek",
        header: "Subjek",
        render: (r) =>
          r.subjek ? (
            <span
              className="inline-block rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white"
              style={{ background: r.subjek.warna || "#2563EB" }}
            >
              {r.subjek.nama}
            </span>
          ) : (
            "—"
          ),
      },
      { key: "bilik", header: "Bilik", render: (r) => r.bilik ?? "—" },
      { key: "sesi", header: "Sesi", render: (r) => (r.sesi === "petang" ? "Petang" : "Pagi") },
    ],
    fields: [
      { name: "guru_id", label: "Guru", type: "select", required: true, full: true },
      { name: "hari", label: "Hari", type: "select", required: true, options: HARI_OPTS },
      { name: "sesi", label: "Sesi", type: "select", options: [{ value: "pagi", label: "Pagi" }, { value: "petang", label: "Petang" }] },
      { name: "masa_mula", label: "Masa Mula", type: "time", required: true },
      { name: "masa_akhir", label: "Masa Akhir", type: "time", required: true },
      { name: "kelas_id", label: "Kelas", type: "select" },
      { name: "subject_id", label: "Subjek", type: "select" },
      { name: "bilik", label: "Bilik", placeholder: "cth: 5 Bestari / Makmal Sains" },
    ],
    toForm: (r) => ({
      guru_id: r.guru_id ?? "",
      hari: String(r.hari ?? ""),
      sesi: r.sesi ?? "pagi",
      masa_mula: fmt(r.masa_mula),
      masa_akhir: fmt(r.masa_akhir),
      kelas_id: r.kelas_id ?? "",
      subject_id: r.subject_id ?? "",
      bilik: r.bilik ?? "",
    }),
    fromForm: (v) => ({
      guru_id: v.guru_id || null,
      hari: v.hari ? Number(v.hari) : null,
      sesi: v.sesi || "pagi",
      masa_mula: v.masa_mula || null,
      masa_akhir: v.masa_akhir || null,
      kelas_id: v.kelas_id || null,
      subject_id: v.subject_id || null,
      bilik: (v.bilik as string)?.trim() || null,
      year_id: yearId,
    }),
  };

  return (
    <div className="space-y-3">
      <Link to="/jadual" className="inline-flex">
        <Button variant="ghost" className="px-2">
          <ArrowLeft className="size-4" /> Kembali ke Jadual
        </Button>
      </Link>
      <CrudPage
        config={config}
        canWrite={isAdmin}
        extraFieldOptions={{
          guru_id: guru.data ?? [],
          kelas_id: kelas.data ?? [],
          subject_id: subjek.data ?? [],
        }}
      />
    </div>
  );
}
