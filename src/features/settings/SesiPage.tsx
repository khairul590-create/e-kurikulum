import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { CrudPage } from "@/components/crud/CrudPage";
import type { CrudConfig } from "@/components/crud/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/toast";

type Row = { id: string; label: string; is_current: boolean; created_at: string };

export default function SesiPage() {
  const { isAdmin, profile } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();

  async function jadikanSemasa(r: Row) {
    if (r.is_current) return;
    try {
      // 1. matikan sesi semasa sedia ada
      const off = await supabase.from("academic_years").update({ is_current: false }).eq("is_current", true);
      if (off.error) throw off.error;
      // 2. tetapkan sesi ini sebagai semasa
      const on = await supabase.from("academic_years").update({ is_current: true }).eq("id", r.id);
      if (on.error) throw on.error;
      // 3. selaraskan teks tahun_semasa pada tetapan sekolah
      await supabase.from("school_settings").update({ tahun_semasa: r.label }).eq("id", 1);

      void logActivity({
        actor_id: profile?.id,
        actor_nama: profile?.nama,
        action: "Sesi Semasa Ditukar",
        modul: "Sesi Akademik",
        detail: r.label,
      });
      await qc.invalidateQueries({ queryKey: ["academic_years"] });
      await qc.invalidateQueries({ queryKey: ["school_settings"] });
      toast("success", `Sesi semasa kini ${r.label}`);
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat menukar sesi semasa");
    }
  }

  const config: CrudConfig<Row> = {
    title: "Sesi Akademik",
    subtitle: "Urus sesi persekolahan & tetapkan sesi semasa",
    table: "academic_years",
    singular: "Sesi",
    orderBy: "label",
    ascending: false,
    searchKeys: ["label"],
    columns: [
      { key: "label", header: "Sesi", render: (r) => <span className="font-medium text-ink">{r.label}</span> },
      {
        key: "is_current",
        header: "Status",
        render: (r) =>
          r.is_current ? (
            <Badge tone="green">✓ Sesi Semasa</Badge>
          ) : (
            <Button size="sm" variant="outline" onClick={() => jadikanSemasa(r)}>
              <CheckCircle2 className="size-4" /> Jadikan Semasa
            </Button>
          ),
      },
    ],
    fields: [
      { name: "label", label: "Label Sesi", required: true, full: true, placeholder: "cth: 2026 atau 2025/2026" },
    ],
  };

  return <CrudPage config={config} canWrite={isAdmin} />;
}
