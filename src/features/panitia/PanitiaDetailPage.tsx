import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FolderOpen, ExternalLink, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Panel, PanelHead, PanelBody, PageTitle, InfoNote } from "@/components/panel/Panel";
import { GaugeRow, GaugeBox } from "@/components/panel/Bits";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import { driveFolderEmbed, driveFilePreview, isImageUrl } from "@/lib/drive";
import type { Subject, PanitiaFail, PanitiaPrestasi } from "@/types/db";

const tabTrigger =
  "rounded-xl px-4 py-2 text-sm font-medium text-ink-muted data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-card";
const STATUS_TONE: Record<string, "green" | "blue" | "amber"> = { Cemerlang: "green", Baik: "blue", "Perlu Fokus": "amber" };
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
    <div>
      <PageTitle
        icon={<span className="size-3.5 rounded-full" style={{ background: s.warna }} />}
        title={`Panitia ${s.nama}`}
        subtitle={`Kod ${s.kod} · Ketua: ${p?.ketua ?? "—"}`}
        action={<Link to="/panitia"><Button variant="outline"><ArrowLeft className="size-4" /> Kembali</Button></Link>}
      />

      <Tabs.Root defaultValue="fail">
        <Tabs.List className="inline-flex gap-1 rounded-2xl bg-slate-100 p-1">
          <Tabs.Trigger value="fail" className={tabTrigger}>Fail Panitia</Tabs.Trigger>
          <Tabs.Trigger value="prestasi" className={tabTrigger}>Prestasi</Tabs.Trigger>
        </Tabs.List>

        <div className="mt-3.5 space-y-3.5">
          <Tabs.Content value="fail" className="space-y-3.5">
            {canWrite && (
              <Panel>
                <PanelHead variant="indigo" icon="🔗">Tetapan Ruang Fail (pautan Google Drive)</PanelHead>
                <PanelBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Pautan Folder Drive Panitia">
                    <Input placeholder="https://drive.google.com/drive/folders/..." value={form.drive_url} onChange={(e) => setForm((f) => ({ ...f, drive_url: e.target.value }))} />
                  </Field>
                  <Field label="Pautan Carta Organisasi (imej/PDF)">
                    <Input placeholder="https://drive.google.com/file/d/..." value={form.carta_url} onChange={(e) => setForm((f) => ({ ...f, carta_url: e.target.value }))} />
                  </Field>
                  <div className="sm:col-span-2"><Field label="Catatan"><Textarea placeholder="Nota ringkas untuk ahli panitia" value={form.catatan} onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))} /></Field></div>
                  <div className="sm:col-span-2"><Button loading={saving} onClick={save}><Save className="size-4" /> Simpan</Button></div>
                </PanelBody>
              </Panel>
            )}

            <div className="flex flex-wrap gap-3.5">
              <Panel className="min-w-[300px] flex-1">
                <PanelHead variant="blue" icon="📁" tag={form.drive_url ? <a href={form.drive_url} target="_blank" rel="noreferrer" className="text-white underline">Buka</a> : undefined}>Folder Fail Panitia</PanelHead>
                <PanelBody>
                  {folderEmbed ? (
                    <iframe title="Folder Drive" src={folderEmbed} className="h-80 w-full rounded-xl border border-line" />
                  ) : form.drive_url ? (
                    <a href={form.drive_url} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full"><FolderOpen className="size-4" /> Buka Folder Drive</Button></a>
                  ) : (
                    <p className="py-12 text-center text-[11px] text-ink-soft">Belum ada pautan folder Drive.</p>
                  )}
                </PanelBody>
              </Panel>
              <Panel className="min-w-[300px] flex-1">
                <PanelHead variant="green" icon="🗂️" tag={form.carta_url ? <a href={form.carta_url} target="_blank" rel="noreferrer" className="text-white underline">Buka</a> : undefined}>Carta Organisasi</PanelHead>
                <PanelBody>
                  {form.carta_url && cartaImg ? (
                    <img src={form.carta_url} alt="Carta" className="max-h-80 w-full rounded-xl border border-line object-contain" />
                  ) : cartaPreview ? (
                    <iframe title="Carta" src={cartaPreview} className="h-80 w-full rounded-xl border border-line" />
                  ) : form.carta_url ? (
                    <a href={form.carta_url} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full"><ExternalLink className="size-4" /> Buka Carta</Button></a>
                  ) : (
                    <p className="py-12 text-center text-[11px] text-ink-soft">Belum ada carta organisasi.</p>
                  )}
                </PanelBody>
              </Panel>
            </div>

            <Panel>
              <PanelHead variant="purple" icon="📑">Panduan Kandungan Fail Panitia</PanelHead>
              <PanelBody>
                <InfoNote>ℹ️ Susun dokumen dalam folder Drive panitia ikut standard berikut:</InfoNote>
                <ol className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {STANDARD_FAIL.map((t, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-ink-muted"><span className="font-bold text-brand">{i + 1}.</span> {t}</li>
                  ))}
                </ol>
              </PanelBody>
            </Panel>
          </Tabs.Content>

          <Tabs.Content value="prestasi">
            <Panel>
              <PanelHead variant="purple" icon="📊">Ringkasan Prestasi Panitia</PanelHead>
              <PanelBody>
                <GaugeRow>
                  <GaugeBox tone="blue" value={p?.purata_uasa ?? 0} label="Purata UASA" />
                  <GaugeBox tone="green" value={`TP${p?.purata_tp ?? 0}`} label="Purata TP" />
                  <GaugeBox tone="yellow" value={p?.bil_guru ?? 0} label="Bil. Guru" />
                  <GaugeBox tone="red" value={<Badge tone={STATUS_TONE[p?.status ?? ""] ?? "slate"}>{p?.status ?? "—"}</Badge>} label="Status" />
                </GaugeRow>
              </PanelBody>
            </Panel>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
