import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Users, HeartPulse } from "lucide-react";
import { many } from "@/lib/views";
import { useCreate, useUpdate, useRemove, useOptions, logActivity } from "@/lib/crud";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { StatCard } from "@/components/charts/StatCard";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Progress, PageLoader } from "@/components/ui/Misc";
import { PageHead, InfoNote } from "@/components/ui/PageHead";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import type { IntervensiRingkasan, IntervensiStatus } from "@/types/db";

const STATUS_TONE: Record<IntervensiStatus, "green" | "blue" | "amber"> = {
  aktif: "green",
  selesai: "blue",
  dirancang: "amber",
};
const STATUS_LABEL: Record<IntervensiStatus, string> = {
  aktif: "Aktif",
  selesai: "Selesai",
  dirancang: "Dirancang",
};

interface Form {
  nama: string;
  jenis: string;
  sasaran: string;
  guru_id: string;
  subject_id: string;
  kemajuan: string;
  status: IntervensiStatus;
}

export default function IntervensiPage() {
  const { isAdmin, profile } = useAuth();
  const canWrite = isAdmin;
  const toast = useToast();
  const qc = useQueryClient();

  const list = useQuery({ queryKey: ["v_intervensi_ringkasan"], queryFn: () => many<IntervensiRingkasan>("v_intervensi_ringkasan") });
  const guruOpts = useOptions("profiles", "nama", { orderBy: "nama" });
  const subjectOpts = useOptions("subjects", "nama", { orderBy: "nama" });
  const create = useCreate("intervensi_programs");
  const update = useUpdate("intervensi_programs");
  const remove = useRemove("intervensi_programs");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IntervensiRingkasan | null>(null);
  const [confirmDel, setConfirmDel] = useState<IntervensiRingkasan | null>(null);
  const form = useForm<Form>();

  const rows = list.data ?? [];
  const totalProgram = rows.length;
  const totalMurid = rows.reduce((s, r) => s + r.bil_murid, 0);
  const aktif = rows.filter((r) => r.status === "aktif").length;
  const purataKemajuan = rows.length ? Math.round(rows.reduce((s, r) => s + r.kemajuan, 0) / rows.length) : 0;

  function openAdd() {
    setEditing(null);
    form.reset({ nama: "", jenis: "", sasaran: "", guru_id: "", subject_id: "", kemajuan: "0", status: "dirancang" });
    setOpen(true);
  }
  function openEdit(r: IntervensiRingkasan) {
    setEditing(r);
    form.reset({ nama: r.nama, jenis: r.jenis ?? "", sasaran: r.sasaran ?? "", guru_id: "", subject_id: "", kemajuan: String(r.kemajuan), status: r.status });
    setOpen(true);
  }

  async function onSubmit(v: Form) {
    const payload = {
      nama: v.nama,
      jenis: v.jenis || null,
      sasaran: v.sasaran || null,
      guru_id: v.guru_id || null,
      subject_id: v.subject_id || null,
      kemajuan: Number(v.kemajuan) || 0,
      status: v.status,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, values: payload });
        toast("success", "Program dikemaskini");
      } else {
        await create.mutateAsync(payload);
        toast("success", "Program ditambah");
      }
      void logActivity({ actor_id: profile?.id, actor_nama: profile?.nama, action: editing ? "Program Intervensi Dikemaskini" : "Program Intervensi Ditambah", modul: "Intervensi" });
      qc.invalidateQueries({ queryKey: ["v_intervensi_ringkasan"] });
      setOpen(false);
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat menyimpan");
    }
  }

  async function doDelete() {
    if (!confirmDel) return;
    try {
      await remove.mutateAsync(confirmDel.id);
      toast("success", "Program dipadam");
      qc.invalidateQueries({ queryKey: ["v_intervensi_ringkasan"] });
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat memadam");
    }
    setConfirmDel(null);
  }

  return (
    <div className="space-y-5">
      <PageHead
        title="🩹 Program Intervensi & Pemulihan"
        subtitle="Program sokongan untuk murid yang memerlukan bantuan tambahan"
        action={canWrite && <Button onClick={openAdd}><Plus className="size-4" /> Tambah Program</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={HeartPulse} tint="blue" label="Jumlah Program" value={totalProgram} hint="Program intervensi" />
        <StatCard icon={Users} tint="ocean" label="Jumlah Murid" value={totalMurid} hint="Murid terlibat" />
        <StatCard icon={HeartPulse} tint="sun" label="Program Aktif" value={aktif} hint="Sedang berjalan" />
        <StatCard icon={HeartPulse} tint="indigo" label="Purata Kemajuan" value={`${purataKemajuan}%`} hint="Keseluruhan" />
      </div>

      <Card>
        <CardHeader title="Senarai Program Intervensi" />
        <CardBody className="pt-1">
          {list.isLoading ? <PageLoader /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-2 py-2">Program</th>
                  <th className="px-2 py-2">Sasaran</th>
                  <th className="px-2 py-2 text-center">Bil. Murid</th>
                  <th className="px-2 py-2">Guru</th>
                  <th className="px-2 py-2 w-40">Kemajuan</th>
                  <th className="px-2 py-2">Status</th>
                  {canWrite && <th className="px-2 py-2 text-right">Tindakan</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line/70 last:border-0">
                    <td className="px-2 py-2.5 font-medium text-ink">{r.nama}</td>
                    <td className="px-2 py-2.5 text-ink-muted">{r.sasaran ?? "—"}</td>
                    <td className="px-2 py-2.5 text-center font-bold text-ink">{r.bil_murid}</td>
                    <td className="px-2 py-2.5 text-ink-muted">{r.guru ?? "—"}</td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2"><Progress value={r.kemajuan} color="#16A34A" /><span className="text-xs font-semibold text-ink">{r.kemajuan}%</span></div>
                    </td>
                    <td className="px-2 py-2.5"><Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge></td>
                    {canWrite && (
                      <td className="px-2 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="size-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setConfirmDel(r)}><Trash2 className="size-4 text-danger" /></Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={canWrite ? 7 : 6} className="px-2 py-8 text-center text-ink-soft">Tiada program intervensi.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <InfoNote>
        Program seperti Celik 3M (LINUS) memastikan murid menguasai asas Membaca, Menulis &amp; Mengira.
        Kemajuan dipantau berkala; murid yang telah menguasai akan keluar dari program.
      </InfoNote>

      <Dialog open={open} onOpenChange={setOpen} title={`${editing ? "Kemaskini" : "Tambah"} Program Intervensi`} size="lg"
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button loading={create.isPending || update.isPending} onClick={form.handleSubmit(onSubmit)}>Simpan</Button>
        </>}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Nama Program" required><Input placeholder="cth: Celik 3M (LINUS)" {...form.register("nama", { required: true })} /></Field></div>
          <Field label="Jenis"><Input placeholder="pemulihan / pengayaan / literasi" {...form.register("jenis")} /></Field>
          <Field label="Kemajuan (%)"><Input type="number" min={0} max={100} {...form.register("kemajuan")} /></Field>
          <div className="sm:col-span-2"><Field label="Sasaran"><Textarea placeholder="Kumpulan sasaran / objektif" {...form.register("sasaran")} /></Field></div>
          <Field label="Guru Pengelola"><Select {...form.register("guru_id")}><option value="">— Pilih —</option>{(guruOpts.data ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></Field>
          <Field label="Mata Pelajaran"><Select {...form.register("subject_id")}><option value="">— Pilih —</option>{(subjectOpts.data ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></Field>
          <Field label="Status"><Select {...form.register("status")}><option value="dirancang">Dirancang</option><option value="aktif">Aktif</option><option value="selesai">Selesai</option></Select></Field>
        </form>
      </Dialog>

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)} title="Padam Program?" description="Tindakan ini tidak boleh diundur."
        footer={<>
          <Button variant="outline" onClick={() => setConfirmDel(null)}>Batal</Button>
          <Button variant="danger" loading={remove.isPending} onClick={doDelete}>Padam</Button>
        </>}>
        <p className="text-sm text-ink-muted">Padam program "{confirmDel?.nama}"? Senarai murid berkaitan turut dipadam.</p>
      </Dialog>
    </div>
  );
}
