import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import { driveFolderEmbed } from "@/lib/drive";
import type { Subject, PanitiaFail } from "@/types/db";

export default function DokumenSetiausahaPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const subjectId = profile?.panitia_subject_id ?? null;

  const subject = useQuery({
    queryKey: ["subject", subjectId], enabled: !!subjectId,
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*").eq("id", subjectId).single();
      if (error) throw error; return data as Subject;
    },
  });
  const fail = useQuery({
    queryKey: ["panitia_fail", subjectId], enabled: !!subjectId,
    queryFn: async () => {
      const { data } = await supabase.from("panitia_fail").select("*").eq("subject_id", subjectId).maybeSingle();
      return (data ?? null) as PanitiaFail | null;
    },
  });

  const [driveUrl, setDriveUrl] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setDriveUrl(fail.data?.drive_url ?? "");
  }, [fail.data]);

  async function save() {
    if (!subjectId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("panitia_fail").upsert(
        { subject_id: subjectId, drive_url: driveUrl || null, updated_at: new Date().toISOString() },
        { onConflict: "subject_id" },
      );
      if (error) throw error;
      toast("success", "Pautan Drive disimpan");
      qc.invalidateQueries({ queryKey: ["panitia_fail", subjectId] });
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat menyimpan");
    }
    setSaving(false);
  }

  if (!subjectId) {
    return (
      <div>
        <PageTitle icon="📄" title="Dokumen Setiausaha" />
        <Panel>
          <PanelBody>
            <p className="py-6 text-center text-[13px] text-ink-soft">
              Anda belum ditugaskan ke mana-mana panitia. Hubungi admin untuk tetapkan panitia anda di{" "}
              <Link to="/guru" className="font-semibold text-brand">Guru & Pengguna</Link>.
            </p>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  if (subject.isLoading) return <PageLoader />;
  if (subject.isError || !subject.data) return <p className="py-10 text-center text-sm text-danger">Panitia tidak dijumpai.</p>;

  const s = subject.data;
  const folderEmbed = driveFolderEmbed(driveUrl);

  return (
    <div>
      <PageTitle
        icon={<span className="size-3.5 rounded-full" style={{ background: s.warna }} />}
        title="Dokumen Setiausaha"
        subtitle={`Panitia ${s.nama} · Kod ${s.kod}`}
      />

      <Panel>
        <PanelHead variant="indigo" icon="🔗">Pautan Google Drive Panitia</PanelHead>
        <PanelBody className="flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <Field label="Pautan Folder Drive">
              <Input placeholder="https://drive.google.com/drive/folders/..." value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} />
            </Field>
          </div>
          <Button loading={saving} onClick={save}><Save className="size-4" /> Simpan</Button>
        </PanelBody>
      </Panel>

      <Panel className="mt-3.5">
        <PanelHead variant="blue" icon="📁" tag={driveUrl ? <a href={driveUrl} target="_blank" rel="noreferrer" className="text-white underline">Buka</a> : undefined}>Kandungan Folder</PanelHead>
        <PanelBody>
          {folderEmbed ? (
            <iframe title="Folder Drive" src={folderEmbed} className="h-96 w-full rounded-xl border border-line" />
          ) : driveUrl ? (
            <a href={driveUrl} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full"><FolderOpen className="size-4" /> Buka Folder Drive</Button></a>
          ) : (
            <p className="py-12 text-center text-[11px] text-ink-soft">Belum ada pautan folder Drive.</p>
          )}
        </PanelBody>
      </Panel>
    </div>
  );
}
