import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Panel, PanelHead, PanelBody, PageTitle } from "@/components/panel/Panel";
import { GaugeRow, GaugeBox } from "@/components/panel/Bits";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Misc";
import type { Subject, PanitiaPrestasi } from "@/types/db";

const STATUS_TONE: Record<string, "green" | "blue" | "amber"> = { Cemerlang: "green", Baik: "blue", "Perlu Fokus": "amber" };

export default function PanitiaDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();

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

  if (subject.isLoading) return <PageLoader />;
  if (subject.isError || !subject.data) return <p className="py-10 text-center text-sm text-danger">Subjek tidak dijumpai.</p>;

  const s = subject.data;
  const p = prestasi.data;

  return (
    <div>
      <PageTitle
        icon={<span className="size-3.5 rounded-full" style={{ background: s.warna }} />}
        title={`Panitia ${s.nama}`}
        subtitle={`Kod ${s.kod} · Ketua: ${p?.ketua ?? "—"}`}
        action={<Link to="/panitia"><Button variant="outline"><ArrowLeft className="size-4" /> Kembali</Button></Link>}
      />

      {/* ponytail: no Tabs — only one section now that fail panitia moved to a single school-wide Drive link */}
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
    </div>
  );
}
