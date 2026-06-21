import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Input";
import { PageLoader, EmptyState } from "@/components/ui/Misc";
import { useList, useCreate, useRemove, useOptions, logActivity } from "@/lib/crud";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import { formatTarikh } from "@/lib/utils";
import type { Tahap } from "@/types/db";

type Assessment = {
  id: string;
  jenis: "formatif" | "sumatif";
  tarikh: string;
  tajuk: string;
  kelas_id: string | null;
  subjects?: { nama: string } | null;
  classes?: { nama: string } | null;
};

function deriveTahap(m: number): { tahap: Tahap; tp: number } {
  if (m >= 90) return { tahap: "cemerlang", tp: 6 };
  if (m >= 75) return { tahap: "baik", tp: 5 };
  if (m >= 60) return { tahap: "memuaskan", tp: 4 };
  if (m >= 40) return { tahap: "perlu_bimbingan", tp: 2 };
  return { tahap: "perlu_bimbingan", tp: 1 };
}

export default function PentaksiranPage() {
  const { profile, isAdmin } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const list = useList<Assessment>("assessments", {
    select: "*, subjects(nama), classes(nama)",
    orderBy: "tarikh",
  });
  const create = useCreate("assessments");
  const remove = useRemove("assessments");
  const subjek = useOptions("subjects", "nama", { orderBy: "nama" });
  const kelas = useOptions("classes", "nama", { orderBy: "nama" });

  const [addOpen, setAddOpen] = useState(false);
  const [scoreFor, setScoreFor] = useState<Assessment | null>(null);
  const [form, setForm] = useState({ jenis: "formatif", subject_id: "", kelas_id: "", tarikh: "", tajuk: "" });

  async function saveAssessment() {
    if (!form.subject_id || !form.tajuk) {
      toast("error", "Mata pelajaran & tajuk wajib");
      return;
    }
    try {
      await create.mutateAsync({
        jenis: form.jenis,
        subject_id: form.subject_id,
        kelas_id: form.kelas_id || null,
        tarikh: form.tarikh || new Date().toISOString().slice(0, 10),
        tajuk: form.tajuk,
        guru_id: profile?.id,
      });
      toast("success", "Pentaksiran ditambah");
      void logActivity({ actor_id: profile?.id, actor_nama: profile?.nama, action: "Pentaksiran Dicatat", modul: "Pentaksiran", detail: form.tajuk });
      setAddOpen(false);
      setForm({ jenis: "formatif", subject_id: "", kelas_id: "", tarikh: "", tajuk: "" });
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  if (list.isLoading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Pentaksiran</h1>
          <p className="text-sm text-ink-muted">Pentaksiran formatif & sumatif + kemasukan markah murid</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" /> Tambah Pentaksiran
        </Button>
      </div>

      <Card className="p-5">
        {(list.data ?? []).length === 0 ? (
          <EmptyState subtitle="Belum ada pentaksiran." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-3 py-3">Tarikh</th>
                  <th className="px-3 py-3">Tajuk</th>
                  <th className="px-3 py-3">Jenis</th>
                  <th className="px-3 py-3">Mata Pelajaran</th>
                  <th className="px-3 py-3">Kelas</th>
                  <th className="px-3 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {(list.data ?? []).map((a) => (
                  <tr key={a.id} className="border-b border-line/70 last:border-0 hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-3 py-3 text-ink-muted">{formatTarikh(a.tarikh)}</td>
                    <td className="px-3 py-3 font-medium text-ink">{a.tajuk}</td>
                    <td className="px-3 py-3">
                      <Badge tone={a.jenis === "sumatif" ? "purple" : "blue"}>{a.jenis}</Badge>
                    </td>
                    <td className="px-3 py-3 text-ink-muted">{a.subjects?.nama ?? "—"}</td>
                    <td className="px-3 py-3 text-ink-muted">{a.classes?.nama ?? "—"}</td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => setScoreFor(a)}>
                          <Pencil className="size-3.5" /> Markah
                        </Button>
                        {isAdmin && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-danger hover:bg-red-50"
                            onClick={async () => {
                              await remove.mutateAsync(a.id);
                              toast("success", "Dipadam");
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add assessment dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Tambah Pentaksiran"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button loading={create.isPending} onClick={saveAssessment}>Simpan</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tajuk" required>
            <Input value={form.tajuk} onChange={(e) => setForm({ ...form, tajuk: e.target.value })} />
          </Field>
          <Field label="Jenis">
            <Select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
              <option value="formatif">Formatif</option>
              <option value="sumatif">Sumatif</option>
            </Select>
          </Field>
          <Field label="Mata Pelajaran" required>
            <Select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })}>
              <option value="">— Pilih —</option>
              {(subjek.data ?? []).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Kelas">
            <Select value={form.kelas_id} onChange={(e) => setForm({ ...form, kelas_id: e.target.value })}>
              <option value="">— Pilih —</option>
              {(kelas.data ?? []).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Tarikh">
            <Input type="date" value={form.tarikh} onChange={(e) => setForm({ ...form, tarikh: e.target.value })} />
          </Field>
        </div>
      </Dialog>

      {scoreFor && (
        <ScoreDialog
          assessment={scoreFor}
          onClose={() => {
            setScoreFor(null);
            qc.invalidateQueries({ queryKey: ["v_dashboard_stats"] });
          }}
        />
      )}
    </div>
  );
}

function ScoreDialog({ assessment, onClose }: { assessment: Assessment; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [marks, setMarks] = useState<Record<string, string>>({});

  const students = useQuery({
    queryKey: ["students", "kelas", assessment.kelas_id],
    queryFn: async () => {
      let q = supabase.from("students").select("id, nama").order("nama");
      if (assessment.kelas_id) q = q.eq("kelas_id", assessment.kelas_id);
      const { data, error } = await q.limit(60);
      if (error) throw error;
      return data as { id: string; nama: string }[];
    },
  });

  const existing = useQuery({
    queryKey: ["scores", assessment.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessment_scores")
        .select("student_id, markah")
        .eq("assessment_id", assessment.id);
      if (error) throw error;
      const m: Record<string, string> = {};
      for (const r of data ?? []) m[(r as { student_id: string }).student_id] = String((r as { markah: number }).markah ?? "");
      setMarks(m);
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const rows = Object.entries(marks)
        .filter(([, v]) => v !== "")
        .map(([student_id, v]) => {
          const m = Number(v);
          const { tahap, tp } = deriveTahap(m);
          return { assessment_id: assessment.id, student_id, markah: m, tp_level: tp, tahap };
        });
      if (rows.length === 0) return;
      const { error } = await supabase
        .from("assessment_scores")
        .upsert(rows, { onConflict: "assessment_id,student_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast("success", "Markah disimpan");
      qc.invalidateQueries({ queryKey: ["v_pencapaian_taburan"] });
      onClose();
    },
    onError: (e) => toast("error", (e as Error).message),
  });

  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={`Markah — ${assessment.tajuk}`}
      description={`${assessment.subjects?.nama ?? ""} · ${assessment.classes?.nama ?? "Semua kelas"}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button loading={save.isPending} onClick={() => save.mutate()}>Simpan Markah</Button>
        </>
      }
    >
      {students.isLoading || existing.isLoading ? (
        <PageLoader />
      ) : (students.data ?? []).length === 0 ? (
        <EmptyState title="Tiada murid" subtitle="Kelas ini belum ada murid." />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
            <ClipboardList className="size-4" /> Markah 0–100. Tahap dijana automatik.
          </div>
          {(students.data ?? []).map((s) => {
            const v = marks[s.id] ?? "";
            const tahap = v ? deriveTahap(Number(v)).tahap : null;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="flex-1 truncate text-sm text-ink">{s.nama}</span>
                {tahap && (
                  <Badge tone={tahap === "cemerlang" ? "green" : tahap === "baik" ? "blue" : tahap === "memuaskan" ? "amber" : "red"}>
                    {tahap.replace("_", " ")}
                  </Badge>
                )}
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={v}
                  onChange={(e) => setMarks((m) => ({ ...m, [s.id]: e.target.value }))}
                  className="w-24"
                />
              </div>
            );
          })}
        </div>
      )}
    </Dialog>
  );
}
