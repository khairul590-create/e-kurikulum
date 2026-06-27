import { useState } from "react";
import { Plus, Pencil, Printer, Trash2, ImageIcon, CalendarDays } from "lucide-react";
import { useList, useRemove, logActivity } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/toast";
import { PageTitle } from "@/components/panel/Panel";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PageLoader } from "@/components/ui/Misc";
import { formatTarikh } from "@/lib/utils";
import type { OprReport } from "@/types/db";
import { OprForm } from "./OprForm";

export default function OprListPage() {
  const { isAdmin, profile } = useAuth();
  const toast = useToast();
  const list = useList<OprReport>("opr_reports", { orderBy: "created_at", ascending: false });
  const remove = useRemove("opr_reports");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OprReport | null>(null);
  const [confirmDel, setConfirmDel] = useState<OprReport | null>(null);

  function add() {
    setEditing(null);
    setOpen(true);
  }
  function edit(r: OprReport) {
    setEditing(r);
    setOpen(true);
  }
  function cetak(r: OprReport) {
    window.open(`/opr/${r.id}/cetak`, "_blank");
  }
  async function doDelete() {
    if (!confirmDel) return;
    try {
      await remove.mutateAsync(confirmDel.id);
      toast("success", "OPR dipadam");
      void logActivity({
        actor_id: profile?.id,
        actor_nama: profile?.nama,
        action: "OPR Dipadam",
        modul: "Laporan OPR",
        detail: confirmDel.tajuk,
      });
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat memadam");
    }
    setConfirmDel(null);
  }

  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <PageTitle
        title="Laporan OPR"
        subtitle="One Page Report — laporan program & aktiviti sekolah"
        action={isAdmin && (
          <Button onClick={add}>
            <Plus className="size-4" /> Tambah OPR
          </Button>
        )}
      />

      {list.isLoading ? (
        <PageLoader />
      ) : list.isError ? (
        <Card className="p-6">
          <p className="text-center text-sm text-danger">
            Gagal memuatkan. Pastikan migration 0012_opr.sql telah dijalankan di Supabase.
          </p>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-ink-muted">Belum ada OPR. Klik "Tambah OPR" untuk mula.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold leading-tight text-ink">{r.tajuk}</h3>
                <Badge tone={r.status === "selesai" ? "green" : "slate"}>{r.status}</Badge>
              </div>
              <div className="space-y-1 text-[13px] text-ink-muted">
                {r.anjuran && <p>🏷️ {r.anjuran}</p>}
                <p className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" /> {formatTarikh(r.tarikh_mula) || "—"}
                  {r.tarikh_tamat ? ` – ${formatTarikh(r.tarikh_tamat)}` : ""}
                </p>
                <p className="flex items-center gap-1.5">
                  <ImageIcon className="size-3.5" /> {r.gambar?.length ?? 0} gambar
                </p>
              </div>
              <div className="mt-auto flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => edit(r)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => cetak(r)}>
                  <Printer className="size-3.5" /> Cetak
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDel(r)}>
                    <Trash2 className="size-3.5 text-danger" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <OprForm open={open} onOpenChange={setOpen} editing={editing} />

      <Dialog
        open={!!confirmDel}
        onOpenChange={(o) => !o && setConfirmDel(null)}
        title="Padam OPR?"
        description="Tindakan ini tidak boleh diundur."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>Batal</Button>
            <Button variant="danger" loading={remove.isPending} onClick={doDelete}>Padam</Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">Padam OPR "{confirmDel?.tajuk}"?</p>
      </Dialog>
    </div>
  );
}
