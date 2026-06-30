import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Settings2 } from "lucide-react";
import { useList, useOptions } from "@/lib/crud";
import { useYear } from "@/providers/YearProvider";
import { useAuth } from "@/providers/AuthProvider";
import { PageTitle, Panel, PanelHead, PanelBody, InfoNote } from "@/components/panel/Panel";
import { Card } from "@/components/ui/Card";
import { Field, Select, Input } from "@/components/ui/Input";
import { EmptyState, PageLoader } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import type { JadualRow } from "@/types/db";

const HARI = ["", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
const HARI_COLS = [1, 2, 3, 4, 5]; // Isnin–Jumaat

const fmt = (t?: string | null) => (t ? t.slice(0, 5) : "");

export default function GuruJadualPage() {
  const { yearId } = useYear();
  const { isAdmin } = useAuth();
  const [guruId, setGuruId] = useState("");
  const [sesi, setSesi] = useState("pagi");
  const [cari, setCari] = useState("");

  const guruOpts = useOptions("profiles", "nama", { orderBy: "nama" });
  const list = useList<JadualRow>("jadual_waktu", {
    select: "*, guru:profiles(nama), kelas:classes(nama), subjek:subjects(nama,warna)",
    orderBy: "masa_mula",
    ascending: true,
  });

  // Senarai guru ditapis oleh carian nama
  const guruFiltered = useMemo(() => {
    const opts = guruOpts.data ?? [];
    if (!cari.trim()) return opts;
    const q = cari.toLowerCase();
    return opts.filter((o) => o.label.toLowerCase().includes(q));
  }, [guruOpts.data, cari]);

  // Slot guru terpilih (ikut sesi + sesi akademik)
  const rows = useMemo(() => {
    if (!guruId) return [];
    return (list.data ?? []).filter(
      (r) =>
        r.guru_id === guruId &&
        r.sesi === sesi &&
        (!yearId || r.year_id === yearId),
    );
  }, [list.data, guruId, sesi, yearId]);

  // Baris grid = slot masa unik, diisih
  const slots = useMemo(() => {
    const seen = new Map<string, { masa_mula: string; masa_akhir: string }>();
    for (const r of rows) {
      const key = `${r.masa_mula}|${r.masa_akhir}`;
      if (!seen.has(key)) seen.set(key, { masa_mula: r.masa_mula, masa_akhir: r.masa_akhir });
    }
    return [...seen.values()].sort((a, b) => a.masa_mula.localeCompare(b.masa_mula));
  }, [rows]);

  const cell = (hari: number, masa_mula: string, masa_akhir: string) =>
    rows.find((r) => r.hari === hari && r.masa_mula === masa_mula && r.masa_akhir === masa_akhir);

  const guruNama = (guruOpts.data ?? []).find((o) => o.value === guruId)?.label;

  return (
    <div className="space-y-4">
      <PageTitle
        icon="📅"
        title="Jadual Waktu Guru"
        subtitle="Lihat jadual mengajar mingguan setiap guru — pilih guru untuk papar grid."
        action={
          isAdmin && (
            <Link to="/jadual/urus">
              <Button variant="outline">
                <Settings2 className="size-4" /> Urus Jadual
              </Button>
            </Link>
          )
        }
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Cari Guru">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
              <Input
                className="pl-9"
                placeholder="🔍 Taip nama guru…"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
              />
            </div>
          </Field>
          <Field label="Guru" required>
            <Select value={guruId} onChange={(e) => setGuruId(e.target.value)}>
              <option value="">— Pilih Guru —</option>
              {guruFiltered.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sesi">
            <Select value={sesi} onChange={(e) => setSesi(e.target.value)}>
              <option value="pagi">Pagi</option>
              <option value="petang">Petang</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Panel>
        <PanelHead variant="blue" icon="📋" tag={guruNama ? `Sesi ${sesi}` : undefined}>
          {guruNama ? `Jadual ${guruNama}` : "Jadual Mingguan"}
        </PanelHead>
        <PanelBody className="p-0">
          {list.isLoading ? (
            <PageLoader />
          ) : !guruId ? (
            <EmptyState title="Pilih guru" subtitle="Pilih seorang guru di atas untuk melihat jadual mingguan." />
          ) : slots.length === 0 ? (
            <EmptyState
              title="Tiada jadual"
              subtitle={`Belum ada slot untuk ${guruNama} (sesi ${sesi}).`}
              action={isAdmin ? <Link to="/jadual/urus"><Button>Tambah Slot</Button></Link> : undefined}
            />
          ) : (
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="w-28 whitespace-nowrap">Waktu</th>
                  {HARI_COLS.map((d) => (
                    <th key={d}>{HARI[d]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <tr key={`${s.masa_mula}|${s.masa_akhir}`}>
                    <td className="whitespace-nowrap font-semibold text-ink">
                      {fmt(s.masa_mula)}–{fmt(s.masa_akhir)}
                    </td>
                    {HARI_COLS.map((d) => {
                      const c = cell(d, s.masa_mula, s.masa_akhir);
                      if (!c) return <td key={d} className="text-center text-ink-soft">–</td>;
                      return (
                        <td key={d} className="align-top">
                          <div className="flex flex-col gap-1">
                            {c.subjek && (
                              <span
                                className="inline-block w-fit rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white"
                                style={{ background: c.subjek.warna || "#2563EB" }}
                              >
                                {c.subjek.nama}
                              </span>
                            )}
                            {c.kelas && <span className="text-sm font-semibold text-ink">{c.kelas.nama}</span>}
                            {c.bilik && <span className="text-xs text-ink-muted">📍 {c.bilik}</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </PanelBody>
      </Panel>

      <InfoNote>
        Jadual dikemaskini oleh admin. Untuk tambah / ubah slot, gunakan butang <b>Urus Jadual</b>.
      </InfoNote>
    </div>
  );
}
