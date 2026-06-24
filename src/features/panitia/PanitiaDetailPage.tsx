import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FolderOpen, ExternalLink, Save, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Misc";
import { PageHead } from "@/components/ui/PageHead";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import { driveFolderEmbed, driveFilePreview, isImageUrl } from "@/lib/drive";
import type { Subject, PanitiaFail, PanitiaPrestasi } from "@/types/db";

const tabTrigger =
  "rounded-xl px-4 py-2 text-sm font-medium text-ink-muted data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-card";

const STATUS_TONE: Record<string, "green" | "blue" | "amber"> = {
  Cemerlang: "green", Baik: "blue", "Perlu Fokus": "amber",
};

const STANDARD_FAIL = [
  "Fail Induk — carta organisasi, senarai guru, takwim, surat & pekeliling",
  "Sukatan Pelajaran / DSKP / RPT & senarai BBM",
  "Minit Mesyuarat Panitia (min. 4 kali setahun)",
  "Program Kecemerlangan / Peningkatan Akademik",
  "Peperiksaan & Analisis Keputusan + OPR (One Page Report)",
  "Penyeliaan / Pencerapan PdP",
  "Penyemakan Buku Latihan murid",
  "Aktiviti Koakademik",
  "Bank Soalan",
  "Maklumat / Biodata Guru",
];

export default function PanitiaDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { isAdmin, profile } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const canWrite = isAdmin || profile?.panitia_subject_id === subjectId;

  const subject = useQuery({
    queryKey: ["subject", subjectId], enabled: !!subjectId,
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*").eq("id", subjectId).single();
      if (error) throw error; return data as Subject;
    },
  });
  const prestasi = useQuery({
    queryKey: ["v_panitia_prestasi", subjectId], enabled: !!subjectId,
    queryFn: async () => {
      const { data } = await supabase.from("v_panitia_prestasi").select("*").eq("subject_id", subjectId).maybeSingle();
      return (data ?? null) as PanitiaPrestasi | null;
    },
  });
  const fail = useQuery({
    queryKey: ["panitia_fail", subjectId], enabled: !!subjectId,
    queryFn: async () => {
      const { data } = await supabase.from("panitia_fail").select("*").eq("subject_id", subjectId).maybeSingle();
      return (data ?? null) as PanitiaFail | null;
    },
  });

  const [form, setForm] = useState({ drive_url: "", carta_url: "", catatan: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (fail.data) setForm({ drive_url: fail.data.drive_url ?? "", carta_url: fail.data.carta_url ?? "", catatan: fail.data.catatan ?? "" });
  }, [fail.data]);

  async function save() {
    if (!subjectId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("panitia_fail").upsert(
        { subject_id: subjectId, drive_url: form.drive_url || null, carta_url: form.carta_url || null, catatan: form.catatan || null, updated_at: new Date().toISOString() },
        { onConflict: "subject_id" },
      );
      if (error) throw error;
      toast("success", "Fail panitia disimpan");
      qc.invalidateQueries({ queryKey: ["panitia_fail", subjectId] });
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat menyimpan");
    }
    setSaving(false);
  }

  if (subject.isLoading) return <PageLoader />;
  if (subject.isError || !subject.data) return <p className="py-10 text-center text-sm text-danger">Subjek tidak dijumpai.</p>;

  const s = subject.data;
  const p = prestasi.data;
  const folderEmbed = driveFolderEmbed(form.drive_url);
  const cartaImg = isImageUrl(form.carta_url);
  const cartaPreview = driveFilePreview(form.carta_url);

  return (
    <div className="space-y-5">
      <PageHead
        title={<span className="inline-flex items-center gap-2"><span className="size-4 rounded-full" style={{ background: s.warna }} /> Panitia {s.nama}</span>}
        subtitle={`Kod ${s.kod} · Ketua: ${p?.ketua ?? "—"}`}
        action={<Link to="/panitia"><Button variant="outline"><ArrowLeft className="size-4" /> Kembali</Button></Link>}
      />

      <Tabs.Root defaultValue="fail">
        <Tabs.List className="inline-flex gap-1 rounded-2xl bg-slate-100 p-1">
          <Tabs.Trigger value="fail" className={tabTrigger}>Fail Panitia</Tabs.Trigger>
          <Tabs.Trigger value="prestasi" className={tabTrigger}>Prestasi</Tabs.Trigger>
        </Tabs.List>

        <div className="mt-4 space-y-4">
          {/* ---------- FAIL PANITIA ---------- */}
          <Tabs.Content value="fail" className="space-y-4">
            {canWrite && (
              <Card>
                <CardHeader title="Tetapan Ruang Fail" subtitle="Tampal pautan Google Drive (kongsi 'sesiapa ada pautan')" />
                <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Pautan Folder Drive Panitia">
                    <Input placeholder="https://drive.google.com/drive/folders/..." value={form.drive_url} onChange={(e) => setForm((f) => ({ ...f, drive_url: e.target.value }))} />
                  </Field>
                  <Field label="Pautan Carta Organisasi (imej/PDF)">
                    <Input placeholder="https://drive.google.com/file/d/... atau URL imej" value={form.carta_url} onChange={(e) => setForm((f) => ({ ...f, carta_url: e.target.value }))} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Catatan"><Textarea placeholder="Nota ringkas untuk ahli panitia" value={form.catatan} onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))} /></Field>
                  </div>
                  <div className="sm:col-span-2"><Button loading={saving} onClick={save}><Save className="size-4" /> Simpan</Button></div>
                </CardBody>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader title="📁 Folder Fail Panitia"
                  action={form.drive_url && <a href={form.drive_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand"><ExternalLink className="size-3.5" /> Buka Drive</a>} />
                <CardBody>
                  {folderEmbed ? (
                    <iframe title="Folder Drive" src={folderEmbed} className="h-80 w-full rounded-xl border border-line" />
                  ) : form.drive_url ? (
                    <a href={form.drive_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="w-full"><FolderOpen className="size-4" /> Buka Folder Drive</Button>
                    </a>
                  ) : (
                    <p className="py-12 text-center text-sm text-ink-soft">Belum ada pautan folder Drive.</p>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="🗂️ Carta Organisasi"
                  action={form.carta_url && <a href={form.carta_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand"><ExternalLink className="size-3.5" /> Buka</a>} />
                <CardBody>
                  {form.carta_url && cartaImg ? (
                    <img src={form.carta_url} alt="Carta Organisasi" className="max-h-80 w-full rounded-xl border border-line object-contain" />
                  ) : cartaPreview ? (
                    <iframe title="Carta Organisasi" src={cartaPreview} className="h-80 w-full rounded-xl border border-line" />
                  ) : form.carta_url ? (
                    <a href={form.carta_url} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full"><ExternalLink className="size-4" /> Buka Carta</Button></a>
                  ) : (
                    <p className="py-12 text-center text-sm text-ink-soft">Belum ada carta organisasi.</p>
                  )}
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader title="Panduan Kandungan Fail Panitia" />
              <CardBody className="pt-1">
                <div className="flex gap-2.5 rounded-xl border-l-4 border-brand bg-brand-50 px-4 py-3 text-sm text-brand-700">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  <p>Susun dokumen dalam folder Drive panitia ikut standard berikut:</p>
                </div>
                <ol className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {STANDARD_FAIL.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink-muted">
                      <span className="font-bold text-brand">{i + 1}.</span> {t}
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          </Tabs.Content>

          {/* ---------- PRESTASI ---------- */}
          <Tabs.Content value="prestasi">
            <Card>
              <CardHeader title="Ringkasan Prestasi Panitia" />
              <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Mini lab="Purata UASA" val={p?.purata_uasa ?? 0} />
                <Mini lab="Purata TP" val={`TP${p?.purata_tp ?? 0}`} />
                <Mini lab="Bil. Guru" val={p?.bil_guru ?? 0} />
                <div className="rounded-xl bg-cream/60 p-3 text-center">
                  <Badge tone={STATUS_TONE[p?.status ?? ""] ?? "slate"}>{p?.status ?? "—"}</Badge>
                  <p className="mt-1 text-[11px] font-semibold text-ink-muted">Status</p>
                </div>
              </CardBody>
            </Card>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}

function Mini({ lab, val }: { lab: string; val: string | number }) {
  return (
    <div className="rounded-xl bg-cream/60 p-3 text-center">
      <p className="text-xl font-black text-ink">{val}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-ink-muted">{lab}</p>
    </div>
  );
}
