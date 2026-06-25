import { useState } from "react";
import * as XLSX from "xlsx";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/crud";
import { useAuth } from "@/providers/AuthProvider";

type KelasOption = { value: string; label: string };

interface ParsedRow {
  nama: string;
  jantina: "L" | "P" | null;
  kelas_id: string | null;
  kelas_label: string;
  no_sijil_lahir: string | null;
  status: string;
  ok: boolean;
  error?: string;
}

const norm = (v: unknown) => String(v ?? "").trim();
const lower = (v: unknown) => norm(v).toLowerCase();

// padan header fleksibel — abai huruf besar/kecil, titik, underscore
function pick(row: Record<string, unknown>, keys: string[]): string {
  const map: Record<string, unknown> = {};
  for (const k of Object.keys(row)) {
    map[k.toLowerCase().replace(/[._\s]+/g, " ").trim()] = row[k];
  }
  for (const k of keys) {
    const key = k.toLowerCase().replace(/[._\s]+/g, " ").trim();
    if (map[key] != null && norm(map[key]) !== "") return norm(map[key]);
  }
  return "";
}

function parseJantina(v: string): "L" | "P" | null {
  const s = lower(v);
  if (!s) return null;
  if (s.startsWith("l") || s.startsWith("m")) return "L"; // lelaki / male
  if (s.startsWith("p") || s.startsWith("f")) return "P"; // perempuan / female
  return null;
}

export function ImportMuridDialog({ kelasOptions }: { kelasOptions: KelasOption[] }) {
  const toast = useToast();
  const qc = useQueryClient();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);

  // peta nama kelas -> id (huruf kecil)
  const kelasMap = new Map(kelasOptions.map((k) => [k.label.toLowerCase().trim(), k.value]));

  function reset() {
    setRows([]);
    setFileName("");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

      const parsed: ParsedRow[] = raw.map((r) => {
        const nama = pick(r, ["nama penuh", "nama murid", "nama", "name"]);
        const jantinaRaw = pick(r, ["jantina", "jenis kelamin", "gender"]);
        const kelasLabel = pick(r, ["kelas", "class", "darjah"]);
        const sijil = pick(r, ["no sijil lahir", "sijil lahir", "no kp", "ic"]);
        const statusRaw = pick(r, ["status"]);

        const jantina = parseJantina(jantinaRaw);
        const kelas_id = kelasLabel ? kelasMap.get(kelasLabel.toLowerCase().trim()) ?? null : null;

        let ok = true;
        let error: string | undefined;
        if (!nama) {
          ok = false;
          error = "Nama kosong";
        } else if (!jantina) {
          ok = false;
          error = "Jantina tidak sah (guna Lelaki/Perempuan)";
        } else if (kelasLabel && !kelas_id) {
          ok = false;
          error = `Kelas "${kelasLabel}" tidak dijumpai`;
        }

        return {
          nama,
          jantina,
          kelas_id,
          kelas_label: kelasLabel,
          no_sijil_lahir: sijil || null,
          status: lower(statusRaw) === "tidak aktif" || lower(statusRaw) === "tidak_aktif" ? "tidak_aktif" : "aktif",
          ok,
          error,
        };
      });

      setRows(parsed);
      if (parsed.length === 0) toast("error", "Fail kosong atau tiada baris data.");
    } catch (err) {
      toast("error", "Gagal baca fail. Pastikan format Excel/CSV betul.");
      console.error(err);
    } finally {
      e.target.value = ""; // benarkan pilih fail sama semula
    }
  }

  function downloadTemplate() {
    const headers = ["Nama Penuh", "Jantina", "Kelas", "No Sijil Lahir", "Status"];
    const example = ["Ahmad bin Ali", "Lelaki", "5 Bestari", "070101120001", "Aktif"];
    const csv = "﻿" + [headers.join(","), example.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "templat-import-murid.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const validRows = rows.filter((r) => r.ok);
  const invalidCount = rows.length - validRows.length;

  async function doImport() {
    if (validRows.length === 0) return;
    setBusy(true);
    try {
      const payload = validRows.map((r) => ({
        nama: r.nama,
        jantina: r.jantina,
        kelas_id: r.kelas_id,
        no_sijil_lahir: r.no_sijil_lahir,
        status: r.status,
      }));
      const { error } = await supabase.from("students").insert(payload);
      if (error) throw error;

      await qc.invalidateQueries({ queryKey: ["students"] });
      void logActivity({
        actor_id: profile?.id,
        actor_nama: profile?.nama,
        action: "Murid Diimport",
        modul: "Murid",
        detail: `${validRows.length} murid`,
      });
      toast("success", `${validRows.length} murid berjaya diimport`);
      reset();
      setOpen(false);
    } catch (e) {
      const msg = (e as Error).message ?? "Ralat import";
      toast("error", msg.includes("duplicate") ? "Ada No. Sijil Lahir berulang. Buang duplikasi & cuba semula." : msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="size-4" /> Import Excel
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
        title="Import Murid dari Excel / CSV"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={validRows.length === 0} onClick={doImport}>
              Import {validRows.length > 0 ? `${validRows.length} Murid` : ""}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Langkah */}
          <div className="rounded-2xl border-2 border-line bg-cream/40 p-4 text-sm text-ink-muted">
            <p className="font-semibold text-ink">Cara guna:</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-5">
              <li>Muat turun templat → isi nama murid dalam Excel.</li>
              <li>Lajur: <b>Nama Penuh, Jantina, Kelas, No Sijil Lahir, Status</b>.</li>
              <li>Nama <b>Kelas</b> mesti sama dengan kelas yang dah dibuat dalam sistem.</li>
              <li>Simpan fail → muat naik di sini → semak → Import.</li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="size-4" /> Muat Turun Templat
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-line bg-white px-4 py-2 font-extrabold text-ink transition hover:bg-cream">
              <FileSpreadsheet className="size-4" />
              Pilih Fail (.xlsx / .csv)
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFile}
              />
            </label>
            {fileName && <span className="self-center text-sm text-ink-muted">📄 {fileName}</span>}
          </div>

          {/* Ringkasan + preview */}
          {rows.length > 0 && (
            <>
              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <span className="flex items-center gap-1 text-ok">
                  <CheckCircle2 className="size-4" /> {validRows.length} sah
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-danger">
                    <AlertCircle className="size-4" /> {invalidCount} ada masalah (akan dilangkau)
                  </span>
                )}
              </div>

              <div className="max-h-[40vh] overflow-auto rounded-2xl border-2 border-line">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-cream text-left text-xs uppercase text-ink-muted">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Nama</th>
                      <th className="px-3 py-2">Jantina</th>
                      <th className="px-3 py-2">Kelas</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Semakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className={r.ok ? "" : "bg-red-50"}>
                        <td className="px-3 py-1.5 text-ink-muted">{i + 1}</td>
                        <td className="px-3 py-1.5 font-medium text-ink">{r.nama || "—"}</td>
                        <td className="px-3 py-1.5">{r.jantina === "L" ? "Lelaki" : r.jantina === "P" ? "Perempuan" : "—"}</td>
                        <td className="px-3 py-1.5">{r.kelas_label || "—"}</td>
                        <td className="px-3 py-1.5">{r.status}</td>
                        <td className="px-3 py-1.5">
                          {r.ok ? (
                            <span className="text-ok">✓ OK</span>
                          ) : (
                            <span className="text-danger">{r.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
