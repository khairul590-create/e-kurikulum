import { useQuery } from "@tanstack/react-query";
import { many } from "@/lib/views";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ColumnChart } from "@/components/charts/ColumnChart";
import { Badge } from "@/components/ui/Badge";
import { PageHead, InfoNote } from "@/components/ui/PageHead";
import type { PbdTpTaburan, PbdTpSubjek } from "@/types/db";

const TP_COLOR = ["#EF4444", "#F97316", "#F59E0B", "#16A34A", "#2563EB", "#7C3AED"];
const TP_LABEL = ["Tahu", "Faham", "Boleh Buat", "Beradab", "Terpuji", "Mithali"];

export default function PbdPage() {
  const taburan = useQuery({ queryKey: ["v_pbd_tp_taburan"], queryFn: () => many<PbdTpTaburan>("v_pbd_tp_taburan", "tp", true) });
  const subjek = useQuery({ queryKey: ["v_pbd_tp_subjek"], queryFn: () => many<PbdTpSubjek>("v_pbd_tp_subjek") });

  const rows = taburan.data ?? [];
  const cols = rows.map((t) => ({ label: `TP${t.tp}`, value: t.bilangan, color: TP_COLOR[t.tp - 1] ?? "#94A3B8" }));
  const total = rows.reduce((s, t) => s + t.bilangan, 0);
  const rendah = rows.filter((t) => t.tp <= 2).reduce((s, t) => s + t.bilangan, 0);
  const sederhana = rows.filter((t) => t.tp === 3 || t.tp === 4).reduce((s, t) => s + t.bilangan, 0);
  const tinggi = rows.filter((t) => t.tp >= 5).reduce((s, t) => s + t.bilangan, 0);
  const purataTp = total ? (rows.reduce((s, t) => s + t.tp * t.bilangan, 0) / total).toFixed(2) : "0";

  return (
    <div className="space-y-5">
      <PageHead title="📊 Analisis PBD (Tahap Penguasaan)" subtitle="Pentaksiran Bilik Darjah · Tahun 1–6 · TP1–TP6" />
      <InfoNote>
        PBD dilaksanakan berterusan melalui pemerhatian, lisan &amp; penulisan. Dilaporkan kepada ibu bapa
        sekurang-kurangnya <b>2 kali setahun</b>. TP melihat perkembangan penguasaan, bukan membandingkan murid.
      </InfoNote>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Taburan Tahap Penguasaan Keseluruhan" />
          <CardBody>
            {cols.length ? <ColumnChart data={cols} valueLabel="Bilangan murid" height={260} />
              : <p className="py-16 text-center text-sm text-ink-soft">Tiada data PBD.</p>}
          </CardBody>
        </Card>
        <Card className="lg:col-span-5">
          <CardHeader title="Ringkasan Penguasaan" />
          <CardBody className="grid grid-cols-2 gap-3">
            <Box val={rendah} lab={`Rendah (TP1–2) · ${pct(rendah, total)}%`} tone="red" />
            <Box val={sederhana} lab={`Sederhana (TP3–4) · ${pct(sederhana, total)}%`} tone="amber" />
            <Box val={tinggi} lab={`Tinggi (TP5–6) · ${pct(tinggi, total)}%`} tone="green" />
            <Box val={purataTp} lab="Purata TP Sekolah" tone="blue" />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Tahap Penguasaan Mengikut Mata Pelajaran" />
        <CardBody className="pt-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <th className="px-2 py-2">Mata Pelajaran</th>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <th key={n} className="px-2 py-2 text-center">TP{n}<br /><span className="font-normal">{TP_LABEL[n - 1]}</span></th>
                ))}
                <th className="px-2 py-2 text-right">Purata</th>
              </tr>
            </thead>
            <tbody>
              {subjek.data?.map((r) => (
                <tr key={r.subject_id} className="border-b border-line/70 last:border-0">
                  <td className="px-2 py-2.5 font-medium text-ink">{r.subjek}</td>
                  <td className="px-2 py-2.5 text-center">{r.tp1}</td>
                  <td className="px-2 py-2.5 text-center">{r.tp2}</td>
                  <td className="px-2 py-2.5 text-center">{r.tp3}</td>
                  <td className="px-2 py-2.5 text-center">{r.tp4}</td>
                  <td className="px-2 py-2.5 text-center">{r.tp5}</td>
                  <td className="px-2 py-2.5 text-center">{r.tp6}</td>
                  <td className="px-2 py-2.5 text-right"><Badge tone="blue">TP{r.tp_purata}</Badge></td>
                </tr>
              ))}
              {(subjek.data ?? []).length === 0 && (
                <tr><td colSpan={8} className="px-2 py-8 text-center text-ink-soft">Tiada data PBD.</td></tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

function pct(v: number, total: number) {
  return total ? Math.round((100 * v) / total) : 0;
}
function Box({ val, lab, tone }: { val: number | string; lab: string; tone: "red" | "amber" | "green" | "blue" }) {
  const cls = {
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-brand-50 text-brand-700",
  }[tone];
  return (
    <div className={`rounded-xl p-4 text-center ${cls}`}>
      <p className="text-2xl font-black">{val}</p>
      <p className="mt-1 text-[11px] font-semibold leading-tight">{lab}</p>
    </div>
  );
}
