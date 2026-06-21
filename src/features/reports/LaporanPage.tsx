import { useState } from "react";
import { Download, FileSpreadsheet, Users, ClipboardList, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import { formatTarikh } from "@/lib/utils";
import { useList } from "@/lib/crud";
import type { Activity } from "@/types/db";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
function download(name: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const REPORTS = [
  { key: "students", title: "Senarai Murid", desc: "Semua murid berserta kelas & status", icon: Users, table: "students", select: "nama, no_sijil_lahir, jantina, status" },
  { key: "rph", title: "Status RPH", desc: "Rekod RPH & status pelaksanaan", icon: ClipboardList, table: "rph", select: "tarikh, tajuk, status, minggu" },
  { key: "scores", title: "Pencapaian Murid", desc: "Markah & tahap pentaksiran", icon: BarChart3, table: "assessment_scores", select: "markah, tp_level, tahap" },
];

export default function LaporanPage() {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const activities = useList<Activity>("activities", { orderBy: "created_at" });

  async function gen(r: (typeof REPORTS)[number]) {
    setBusy(r.key);
    try {
      const { data, error } = await supabase.from(r.table).select(r.select).limit(5000);
      if (error) throw error;
      if (!data || data.length === 0) {
        toast("info", "Tiada data untuk dieksport");
        return;
      }
      download(`laporan-${r.key}-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(data as unknown as Record<string, unknown>[]));
      toast("success", `Laporan ${r.title} dijana`);
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Laporan</h1>
        <p className="text-sm text-ink-muted">Jana & muat turun laporan dalam format CSV</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.key} className="p-5">
              <div className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-3 font-semibold text-ink">{r.title}</h3>
              <p className="mt-0.5 text-sm text-ink-muted">{r.desc}</p>
              <Button className="mt-4 w-full" variant="outline" loading={busy === r.key} onClick={() => gen(r)}>
                <Download className="size-4" /> Muat Turun CSV
              </Button>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader
          title="Log Aktiviti Sistem"
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const d = (activities.data ?? []).map((a) => ({
                  tarikh: a.created_at,
                  aktiviti: a.action,
                  modul: a.modul,
                  perincian: a.detail,
                  oleh: a.actor_nama,
                }));
                if (d.length) download("log-aktiviti.csv", toCSV(d));
              }}
            >
              <FileSpreadsheet className="size-4" /> Eksport
            </Button>
          }
        />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-2 py-2.5">Tarikh</th>
                  <th className="px-2 py-2.5">Aktiviti</th>
                  <th className="px-2 py-2.5">Perincian</th>
                  <th className="px-2 py-2.5">Oleh</th>
                </tr>
              </thead>
              <tbody>
                {(activities.data ?? []).slice(0, 20).map((a) => (
                  <tr key={a.id} className="border-b border-line/70 last:border-0">
                    <td className="whitespace-nowrap px-2 py-3 text-ink-muted">{formatTarikh(a.created_at)}</td>
                    <td className="px-2 py-3 font-medium text-ink">{a.action}</td>
                    <td className="px-2 py-3 text-ink-muted">{a.detail}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-ink-muted">{a.actor_nama}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
