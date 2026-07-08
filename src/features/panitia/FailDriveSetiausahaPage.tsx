import { useEffect, useState } from "react";
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

export default function FailDriveSetiausahaPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  // Guna satu pautan Drive sekolah (school_settings.drive_url) — Setiausaha Kurikulum.
  const setting = useQuery({
    queryKey: ["school_settings_drive"],
    queryFn: async () => {
      const { data } = await supabase.from("school_settings").select("drive_url").eq("id", 1).maybeSingle();
      return (data?.drive_url ?? null) as string | null;
    },
  });

  const [driveUrl, setDriveUrl] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setDriveUrl(setting.data ?? "");
  }, [setting.data]);

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase.from("school_settings")
        .update({ drive_url: driveUrl || null, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
      toast("success", "Pautan Drive disimpan");
      qc.invalidateQueries({ queryKey: ["school_settings_drive"] });
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat menyimpan");
    }
    setSaving(false);
  }

  if (setting.isLoading) return <PageLoader />;

  const folderEmbed = driveFolderEmbed(driveUrl);

  return (
    <div>
      <PageTitle icon="📄" title="Fail Drive Setiausaha" subtitle="Setiausaha Kurikulum · satu pautan Google Drive untuk semua" />

      {isAdmin && (
        <Panel>
          <PanelHead variant="indigo" icon="🔗">Pautan Google Drive</PanelHead>
          <PanelBody className="flex flex-wrap items-end gap-3">
            <div className="min-w-[280px] flex-1">
              <Field label="Pautan Folder Drive">
                <Input placeholder="https://drive.google.com/drive/folders/..." value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} />
              </Field>
            </div>
            <Button loading={saving} onClick={save}><Save className="size-4" /> Simpan</Button>
          </PanelBody>
        </Panel>
      )}

      <Panel className={isAdmin ? "mt-3.5" : ""}>
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
