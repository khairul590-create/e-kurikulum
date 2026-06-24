import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { PageHead, InfoNote } from "@/components/ui/PageHead";
import { PageLoader } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import { logActivity } from "@/lib/crud";
import type { Kelas, Subject, Student, AcademicYear } from "@/types/db";

function gredOf(m: number) {
  if (m >= 90) return "A"; if (m >= 80) return "B"; if (m >= 65) return "C";
  if (m >= 50) return "D"; if (m >= 40) return "E"; return "F";
}

export default function UasaEntryPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const [kelasId, setKelasId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [markah, setMarkah] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const classes = useQuery({ queryKey: ["classes", "entry"], queryFn: async () => {
    const { data, error } = await supabase.from("classes").select("*").gte("tahun", 4).order("nama");
    if (error) throw error; return (data ?? []) as Kelas[];
  }});
  const subjects = useQuery({ queryKey: ["subjects", "entry"], queryFn: async () => {
    const { data, error } = await supabase.from("subjects").select("*").order("nama");
    if (error) throw error; return (data ?? []) as Subject[];
  }});
  const year = useQuery({ queryKey: ["academic_years", "current"], queryFn: async () => {
    const { data } = await supabase.from("academic_years").select("*").eq("is_current", true).maybeSingle();
    return (data ?? null) as AcademicYear | null;
  }});
  const students = useQuery({
    queryKey: ["students", "kelas", kelasId],
    enabled: !!kelasId,
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").eq("kelas_id", kelasId).eq("status", "aktif").order("nama");
      if (error) throw error; return (data ?? []) as Student[];
    },
  });

  const selKelas = classes.data?.find((k) => k.id === kelasId);
  const ready = kelasId && subjectId && (students.data ?? []).length > 0;

  async function save() {
    if (!selKelas) return;
    setSaving(true);
    try {
      // cari atau cipta rekod UASA (ikut SESI/year_id supaya tak tindih markah sesi lama)
      const yearId = year.data?.id ?? null;
      let q = supabase.from("uasa_records").select("id")
        .eq("subject_id", subjectId).eq("kelas_id", kelasId).eq("tahun", selKelas.tahun);
      q = yearId ? q.eq("year_id", yearId) : q.is("year_id", null);
      const { data: existRows, error: findErr } = await q.order("created_at", { ascending: true }).limit(1);
      if (findErr) throw findErr;
      let uasaId = existRows?.[0]?.id as string | undefined;
      if (!uasaId) {
        const { data, error } = await supabase.from("uasa_records").insert({
          subject_id: subjectId, kelas_id: kelasId, tahun: selKelas.tahun,
          year_id: yearId, guru_id: profile?.id ?? null,
        }).select("id").single();
        if (error) throw error;
        uasaId = data.id;
      }
      const payload = Object.entries(markah)
        .filter(([, v]) => v !== "" && !isNaN(Number(v)))
        .map(([student_id, v]) => ({ uasa_id: uasaId, student_id, markah: Number(v) }));
      if (payload.length === 0) { toast("error", "Tiada markah untuk disimpan"); setSaving(false); return; }
      const { error } = await supabase.from("uasa_scores").upsert(payload, { onConflict: "uasa_id,student_id" });
      if (error) throw error;
      toast("success", `${payload.length} markah disimpan`);
      void logActivity({ actor_id: profile?.id, actor_nama: profile?.nama, action: "Markah UASA Dikemaskini", modul: "UASA", detail: `${selKelas.nama}` });
      qc.invalidateQueries();
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat menyimpan");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <PageHead
        title="✍️ Kemasukan Markah UASA"
        subtitle="Pilih kelas & mata pelajaran, masukkan markah (0–100). Gred dijana automatik."
        action={<Link to="/uasa"><Button variant="outline"><ArrowLeft className="size-4" /> Kembali</Button></Link>}
      />
      <InfoNote>UASA hanya untuk Tahun 4–6. Gred: A≥90, B≥80, C≥65, D≥50, E≥40, F&lt;40. Lulus markah ≥20%.</InfoNote>

      <Card>
        <CardHeader title="Pilihan" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Kelas (Tahun 4–6)" required>
            <Select value={kelasId} onChange={(e) => { setKelasId(e.target.value); setMarkah({}); }}>
              <option value="">— Pilih Kelas —</option>
              {classes.data?.map((k) => <option key={k.id} value={k.id}>{k.nama} (Tahun {k.tahun})</option>)}
            </Select>
          </Field>
          <Field label="Mata Pelajaran" required>
            <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">— Pilih Subjek —</option>
              {subjects.data?.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </Select>
          </Field>
        </CardBody>
      </Card>

      {kelasId && (
        <Card>
          <CardHeader title="Markah Murid" subtitle={selKelas ? `${selKelas.nama} · Tahun ${selKelas.tahun}` : undefined}
            action={ready && <Button loading={saving} onClick={save}><Save className="size-4" /> Simpan</Button>} />
          <CardBody className="pt-1">
            {students.isLoading ? <PageLoader /> : (students.data ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-soft">Tiada murid aktif dalam kelas ini.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    <th className="px-2 py-2">#</th><th className="px-2 py-2">Nama Murid</th>
                    <th className="px-2 py-2 w-32">Markah (0–100)</th><th className="px-2 py-2 text-center">Gred</th>
                  </tr>
                </thead>
                <tbody>
                  {students.data?.map((st, i) => {
                    const v = markah[st.id] ?? "";
                    const g = v !== "" && !isNaN(Number(v)) ? gredOf(Number(v)) : "—";
                    return (
                      <tr key={st.id} className="border-b border-line/70 last:border-0">
                        <td className="px-2 py-2 text-ink-soft">{i + 1}</td>
                        <td className="px-2 py-2 font-medium text-ink">{st.nama}</td>
                        <td className="px-2 py-2">
                          <Input type="number" min={0} max={100} value={v}
                            onChange={(e) => setMarkah((m) => ({ ...m, [st.id]: e.target.value }))} />
                        </td>
                        <td className="px-2 py-2 text-center font-bold text-ink">{g}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
