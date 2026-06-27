import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";
import type { OprReport } from "@/types/db";
import { OprGambarUpload } from "./OprGambarUpload";

type FormState = {
  tajuk: string;
  anjuran: string;
  status: string;
  tarikh_mula: string;
  tarikh_tamat: string;
  masa: string;
  tempat: string;
  sasaran: string;
  bil_peserta: string;
  objektif: string;
  pelaksanaan: string;
  kekuatan: string;
  penambahbaikan: string;
  refleksi: string;
  kos: string;
  disediakan_oleh: string;
  disahkan_oleh: string;
  gambar: string[];
};

const kosong: FormState = {
  tajuk: "", anjuran: "", status: "draf", tarikh_mula: "", tarikh_tamat: "",
  masa: "", tempat: "", sasaran: "", bil_peserta: "", objektif: "", pelaksanaan: "",
  kekuatan: "", penambahbaikan: "", refleksi: "", kos: "", disediakan_oleh: "",
  disahkan_oleh: "", gambar: [],
};

function fromRow(r: OprReport): FormState {
  return {
    tajuk: r.tajuk ?? "",
    anjuran: r.anjuran ?? "",
    status: r.status ?? "draf",
    tarikh_mula: r.tarikh_mula ?? "",
    tarikh_tamat: r.tarikh_tamat ?? "",
    masa: r.masa ?? "",
    tempat: r.tempat ?? "",
    sasaran: r.sasaran ?? "",
    bil_peserta: r.bil_peserta != null ? String(r.bil_peserta) : "",
    objektif: r.objektif ?? "",
    pelaksanaan: r.pelaksanaan ?? "",
    kekuatan: r.kekuatan ?? "",
    penambahbaikan: r.penambahbaikan ?? "",
    refleksi: r.refleksi ?? "",
    kos: r.kos != null ? String(r.kos) : "",
    disediakan_oleh: r.disediakan_oleh ?? "",
    disahkan_oleh: r.disahkan_oleh ?? "",
    gambar: r.gambar ?? [],
  };
}

export function OprForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: OprReport | null;
}) {
  const toast = useToast();
  const qc = useQueryClient();
  const { profile } = useAuth();
  const [f, setF] = useState<FormState>(kosong);
  const [busy, setBusy] = useState(false);

  // id stabil untuk rekod baharu (juga folder gambar)
  const newId = useMemo(() => crypto.randomUUID(), [open]);
  const rowId = editing?.id ?? newId;

  useEffect(() => {
    if (open) setF(editing ? fromRow(editing) : kosong);
  }, [open, editing]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    if (!f.tajuk.trim()) {
      toast("error", "Tajuk program wajib diisi.");
      return;
    }
    setBusy(true);
    const payload = {
      tajuk: f.tajuk.trim(),
      anjuran: f.anjuran || null,
      status: f.status,
      tarikh_mula: f.tarikh_mula || null,
      tarikh_tamat: f.tarikh_tamat || null,
      masa: f.masa || null,
      tempat: f.tempat || null,
      sasaran: f.sasaran || null,
      bil_peserta: f.bil_peserta ? Number(f.bil_peserta) : null,
      objektif: f.objektif || null,
      pelaksanaan: f.pelaksanaan || null,
      kekuatan: f.kekuatan || null,
      penambahbaikan: f.penambahbaikan || null,
      refleksi: f.refleksi || null,
      kos: f.kos ? Number(f.kos) : null,
      disediakan_oleh: f.disediakan_oleh || null,
      disahkan_oleh: f.disahkan_oleh || null,
      gambar: f.gambar,
      updated_at: new Date().toISOString(),
    };
    try {
      if (editing) {
        const { error } = await supabase.from("opr_reports").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast("success", "OPR dikemaskini");
      } else {
        const { error } = await supabase.from("opr_reports").insert({ id: rowId, ...payload });
        if (error) throw error;
        toast("success", "OPR ditambah");
      }
      void logActivity({
        actor_id: profile?.id,
        actor_nama: profile?.nama,
        action: editing ? "OPR Dikemaskini" : "OPR Ditambah",
        modul: "Laporan OPR",
        detail: f.tajuk,
      });
      await qc.invalidateQueries({ queryKey: ["opr_reports"] });
      onOpenChange(false);
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat menyimpan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Kemaskini OPR" : "Tambah OPR"}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button loading={busy} onClick={save}>Simpan</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Tajuk Program / Aktiviti" required>
            <Input value={f.tajuk} onChange={(e) => set("tajuk", e.target.value)} placeholder="cth: Program Celik 3M Tahun 1" />
          </Field>
        </div>
        <Field label="Anjuran (Unit / Panitia)">
          <Input value={f.anjuran} onChange={(e) => set("anjuran", e.target.value)} placeholder="cth: Panitia Bahasa Melayu" />
        </Field>
        <Field label="Status">
          <Select value={f.status} onChange={(e) => set("status", e.target.value)}>
            <option value="draf">Draf</option>
            <option value="selesai">Selesai</option>
          </Select>
        </Field>
        <Field label="Tarikh Mula">
          <Input type="date" value={f.tarikh_mula} onChange={(e) => set("tarikh_mula", e.target.value)} />
        </Field>
        <Field label="Tarikh Tamat">
          <Input type="date" value={f.tarikh_tamat} onChange={(e) => set("tarikh_tamat", e.target.value)} />
        </Field>
        <Field label="Masa">
          <Input value={f.masa} onChange={(e) => set("masa", e.target.value)} placeholder="cth: 8:00 pagi - 12:00 tgh" />
        </Field>
        <Field label="Tempat">
          <Input value={f.tempat} onChange={(e) => set("tempat", e.target.value)} placeholder="cth: Dewan Sekolah" />
        </Field>
        <Field label="Kumpulan Sasaran">
          <Input value={f.sasaran} onChange={(e) => set("sasaran", e.target.value)} placeholder="cth: Murid Tahun 1-3" />
        </Field>
        <Field label="Bilangan Peserta">
          <Input type="number" value={f.bil_peserta} onChange={(e) => set("bil_peserta", e.target.value)} placeholder="cth: 120" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Objektif">
            <Textarea value={f.objektif} onChange={(e) => set("objektif", e.target.value)} placeholder="Objektif program..." />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Ringkasan Pelaksanaan / Impak">
            <Textarea value={f.pelaksanaan} onChange={(e) => set("pelaksanaan", e.target.value)} placeholder="Apa yang dijalankan & impaknya..." />
          </Field>
        </div>
        <Field label="Kekuatan">
          <Textarea value={f.kekuatan} onChange={(e) => set("kekuatan", e.target.value)} />
        </Field>
        <Field label="Penambahbaikan">
          <Textarea value={f.penambahbaikan} onChange={(e) => set("penambahbaikan", e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Refleksi / Cadangan">
            <Textarea value={f.refleksi} onChange={(e) => set("refleksi", e.target.value)} />
          </Field>
        </div>

        <Field label="Kos (RM)">
          <Input type="number" step="0.01" value={f.kos} onChange={(e) => set("kos", e.target.value)} placeholder="cth: 350.00" />
        </Field>
        <div />
        <Field label="Disediakan Oleh">
          <Input value={f.disediakan_oleh} onChange={(e) => set("disediakan_oleh", e.target.value)} placeholder="Nama & jawatan" />
        </Field>
        <Field label="Disahkan Oleh">
          <Input value={f.disahkan_oleh} onChange={(e) => set("disahkan_oleh", e.target.value)} placeholder="Nama & jawatan" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Gambar Aktiviti">
            <OprGambarUpload value={f.gambar} onChange={(g) => set("gambar", g)} folder={rowId} />
          </Field>
        </div>
      </div>
    </Dialog>
  );
}
