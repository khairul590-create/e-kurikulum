import { useState } from "react";
import { Plus, Target, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { PageLoader, EmptyState } from "@/components/ui/Misc";
import { useList, useCreate, useUpdate, useRemove } from "@/lib/crud";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import type { KpiTarget } from "@/types/db";

export default function KpiPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const list = useList<KpiTarget>("kpi_targets", { orderBy: "nama", ascending: true });
  const create = useCreate("kpi_targets");
  const update = useUpdate("kpi_targets");
  const remove = useRemove("kpi_targets");

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<KpiTarget | null>(null);
  const [form, setForm] = useState({ nama: "", sasaran: "", semasa: "", unit: "%" });

  function openAdd() {
    setEdit(null);
    setForm({ nama: "", sasaran: "100", semasa: "0", unit: "%" });
    setOpen(true);
  }
  function openEdit(k: KpiTarget) {
    setEdit(k);
    setForm({ nama: k.nama, sasaran: String(k.sasaran), semasa: String(k.semasa), unit: k.unit });
    setOpen(true);
  }
  async function save() {
    const payload = { nama: form.nama, sasaran: Number(form.sasaran), semasa: Number(form.semasa), unit: form.unit };
    try {
      if (edit) await update.mutateAsync({ id: edit.id, values: payload });
      else await create.mutateAsync(payload);
      toast("success", "KPI disimpan");
      setOpen(false);
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  if (list.isLoading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Dashboard KPI</h1>
          <p className="text-sm text-ink-muted">Petunjuk prestasi utama kurikulum</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd}>
            <Plus className="size-4" /> Tambah KPI
          </Button>
        )}
      </div>

      {(list.data ?? []).length === 0 ? (
        <Card className="p-5">
          <EmptyState subtitle="Belum ada KPI ditetapkan." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(list.data ?? []).map((k) => {
            const pct = Math.min(100, Math.round((k.semasa / (k.sasaran || 1)) * 100));
            const tone = pct >= 90 ? "#16A34A" : pct >= 70 ? "#2563EB" : pct >= 50 ? "#F59E0B" : "#EF4444";
            return (
              <Card key={k.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
                    <Target className="size-5" />
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(k)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-danger hover:bg-red-50"
                        onClick={async () => {
                          await remove.mutateAsync(k.id);
                          toast("success", "Dipadam");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-ink">{k.nama}</h3>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-2xl font-bold text-ink">
                    {k.semasa}
                    {k.unit}
                  </span>
                  <span className="mb-1 text-sm text-ink-soft">
                    / {k.sasaran}
                    {k.unit}
                  </span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: tone }} />
                </div>
                <p className="mt-1.5 text-xs text-ink-muted">{pct}% daripada sasaran</p>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={edit ? "Kemaskini KPI" : "Tambah KPI"}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button loading={create.isPending || update.isPending} onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nama KPI" required>
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Semasa">
              <Input type="number" value={form.semasa} onChange={(e) => setForm({ ...form, semasa: e.target.value })} />
            </Field>
            <Field label="Sasaran">
              <Input type="number" value={form.sasaran} onChange={(e) => setForm({ ...form, sasaran: e.target.value })} />
            </Field>
            <Field label="Unit">
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </Field>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
