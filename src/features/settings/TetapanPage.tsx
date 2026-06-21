import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { PageLoader } from "@/components/ui/Misc";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import { formatTarikh, cn } from "@/lib/utils";
import type { Announcement } from "@/types/db";

const tabTrigger =
  "rounded-xl px-4 py-2 text-sm font-medium text-ink-muted data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-card";

export default function TetapanPage() {
  const { isAdmin } = useAuth();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Tetapan</h1>
        <p className="text-sm text-ink-muted">Konfigurasi sekolah, profil & pengumuman</p>
      </div>

      <Tabs.Root defaultValue="profil">
        <Tabs.List className="inline-flex gap-1 rounded-2xl bg-slate-100 p-1">
          <Tabs.Trigger value="profil" className={tabTrigger}>
            Profil Saya
          </Tabs.Trigger>
          {isAdmin && (
            <Tabs.Trigger value="sekolah" className={tabTrigger}>
              Sekolah
            </Tabs.Trigger>
          )}
          {isAdmin && (
            <Tabs.Trigger value="pengumuman" className={tabTrigger}>
              Pengumuman
            </Tabs.Trigger>
          )}
        </Tabs.List>

        <div className="mt-4">
          <Tabs.Content value="profil">
            <ProfilTab />
          </Tabs.Content>
          {isAdmin && (
            <Tabs.Content value="sekolah">
              <SekolahTab />
            </Tabs.Content>
          )}
          {isAdmin && (
            <Tabs.Content value="pengumuman">
              <PengumumanTab />
            </Tabs.Content>
          )}
        </div>
      </Tabs.Root>
    </div>
  );
}

function ProfilTab() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ nama: "", jawatan: "", no_telefon: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ nama: profile.nama, jawatan: profile.jawatan ?? "", no_telefon: profile.no_telefon ?? "" });
  }, [profile]);

  async function save() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", profile.id);
    setSaving(false);
    if (error) toast("error", error.message);
    else {
      toast("success", "Profil dikemaskini");
      await refreshProfile();
    }
  }

  return (
    <Card>
      <CardBody className="max-w-lg space-y-4">
        <Field label="Nama">
          <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
        </Field>
        <Field label="Jawatan">
          <Input value={form.jawatan} onChange={(e) => setForm({ ...form, jawatan: e.target.value })} />
        </Field>
        <Field label="No. Telefon">
          <Input value={form.no_telefon} onChange={(e) => setForm({ ...form, no_telefon: e.target.value })} />
        </Field>
        <Field label="Emel">
          <Input value={profile?.email ?? ""} disabled />
        </Field>
        <Button loading={saving} onClick={save}>
          Simpan Perubahan
        </Button>
      </CardBody>
    </Card>
  );
}

function SekolahTab() {
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["school_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("school_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState({ nama_sekolah: "", kod_sekolah: "", subtajuk: "", alamat: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data)
      setForm({
        nama_sekolah: data.nama_sekolah ?? "",
        kod_sekolah: data.kod_sekolah ?? "",
        subtajuk: data.subtajuk ?? "",
        alamat: data.alamat ?? "",
      });
  }, [data]);

  if (isLoading) return <PageLoader />;

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("school_settings").update(form).eq("id", 1);
    setSaving(false);
    if (error) toast("error", error.message);
    else {
      toast("success", "Tetapan sekolah dikemaskini");
      qc.invalidateQueries({ queryKey: ["school_settings"] });
    }
  }

  return (
    <Card>
      <CardBody className="max-w-lg space-y-4">
        <Field label="Nama Sekolah">
          <Input value={form.nama_sekolah} onChange={(e) => setForm({ ...form, nama_sekolah: e.target.value })} />
        </Field>
        <Field label="Kod Sekolah">
          <Input value={form.kod_sekolah} onChange={(e) => setForm({ ...form, kod_sekolah: e.target.value })} />
        </Field>
        <Field label="Subtajuk">
          <Input value={form.subtajuk} onChange={(e) => setForm({ ...form, subtajuk: e.target.value })} />
        </Field>
        <Field label="Alamat">
          <Textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
        </Field>
        <Button loading={saving} onClick={save}>
          Simpan
        </Button>
      </CardBody>
    </Card>
  );
}

function PengumumanTab() {
  const config: CrudConfig<Announcement> = {
    title: "",
    table: "announcements",
    singular: "Pengumuman",
    orderBy: "tarikh",
    searchKeys: ["tajuk"],
    columns: [
      { key: "tajuk", header: "Tajuk", render: (r) => <span className="font-medium text-ink">{r.tajuk}</span> },
      { key: "jenis", header: "Jenis", render: (r) => <Badge tone="blue">{r.jenis.replace("_", " ")}</Badge> },
      { key: "tarikh", header: "Tarikh", render: (r) => formatTarikh(r.tarikh) },
      { key: "pinned", header: "Disemat", render: (r) => (r.pinned ? "📌" : "—") },
    ],
    fields: [
      { name: "tajuk", label: "Tajuk", required: true, full: true },
      { name: "kandungan", label: "Kandungan", type: "textarea", full: true },
      { name: "jenis", label: "Jenis", type: "select", options: [
        { value: "umum", label: "Umum" },
        { value: "mesyuarat", label: "Mesyuarat" },
        { value: "tarikh_akhir", label: "Tarikh Akhir" },
        { value: "program", label: "Program" },
      ] },
      { name: "tarikh", label: "Tarikh", type: "date" },
    ],
  };
  return (
    <div className={cn("[&_h1]:hidden")}>
      <CrudPage config={config} canWrite />
    </div>
  );
}
