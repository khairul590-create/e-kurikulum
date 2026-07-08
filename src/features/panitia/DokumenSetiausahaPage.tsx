import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import { driveFolderEmbed } from "@/lib/drive";
import type { Subject, PanitiaFail } from "@/types/db";

export default function DokumenSetiausahaPage() {
  const { isAdmin, profile } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const subjects = useQuery({
    queryKey: ["subjects_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*").order("kod");
      if (error) throw error;
      return (data ?? []) as Subject[];
    },
  });

  const [subjectId, setSubjectId] = useState("");
  const canWrite = isAdmin || (!!subjectId && profile?.panitia_subject_id === subjectId);

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

  const folderEmbed = driveFolderEmbed(driveUrl);

  return (
    <div>
      <PageTitle icon="📄" title="Fail Drive Setiausaha" subtitle="Pilih panitia untuk papar/urus pautan Google Drive" />

      <Panel>
        <PanelBody>
          <Field label="Panitia">
            <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">— Pilih Panitia —</option>
              {(subjects.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.kod} — {s.nama}</option>
              ))}
            </Select>
          </Field>
        </PanelBody>
      </Panel>

      {subjectId && (
        <>
          <Panel className="mt-3.5">
            <PanelHead variant="indigo" icon="🔗">Pautan Google Drive Panitia</PanelHead>
            <PanelBody className="flex flex-wrap items-end gap-3">
              <div className="min-w-[280px] flex-1">
                <Field label="Pautan Folder Drive">
                  <Input placeholder="https://drive.google.com/drive/folders/..." value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} disabled={!canWrite} />
                </Field>
              </div>
              {canWrite && <Button loading={saving} onClick={save}><Save className="size-4" /> Simpan</Button>}
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
        </>
      )}
    </div>
  );
}
