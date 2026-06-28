import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageLoader } from "@/components/ui/Misc";
import { formatTarikh } from "@/lib/utils";
import type { OprReport, SchoolSettings } from "@/types/db";
import logoSekolah from "@/assets/logo-sekolah.jpg";

function Baris({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <tr>
      <td className="w-40 border border-slate-400 px-2 py-1 align-top font-semibold">{label}</td>
      <td className="border border-slate-400 px-2 py-1 align-top">{value || "—"}</td>
    </tr>
  );
}

function Blok({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="break-inside-avoid">
      <p className="font-bold text-slate-800">{label}</p>
      <p className="whitespace-pre-wrap text-justify text-slate-700">{value || "—"}</p>
    </div>
  );
}

export default function OprPrintPage() {
  const { id } = useParams<{ id: string }>();

  const opr = useQuery({
    queryKey: ["opr_reports", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("opr_reports").select("*").eq("id", id).single();
      if (error) throw error;
      return data as OprReport;
    },
    enabled: !!id,
  });

  const sekolah = useQuery({
    queryKey: ["school_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("school_settings").select("*").eq("id", 1).maybeSingle();
      return (data ?? null) as SchoolSettings | null;
    },
  });

  if (opr.isLoading) return <PageLoader />;
  if (opr.isError || !opr.data)
    return <p className="p-10 text-center text-danger">OPR tidak dijumpai.</p>;

  const r = opr.data;
  const s = sekolah.data;
  const namaSekolah = s?.nama_sekolah ?? "Sekolah";
  const logo = s?.logo_url || logoSekolah; // fallback logo tertanam (tak bergantung link luar)

  const tarikh =
    formatTarikh(r.tarikh_mula) + (r.tarikh_tamat ? ` – ${formatTarikh(r.tarikh_tamat)}` : "");

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      {/* Bar tindakan — tidak dicetak */}
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4">
        <button
          onClick={() => window.close()}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" /> Tutup
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
        >
          <Printer className="size-4" /> Cetak / Simpan PDF
        </button>
      </div>

      {/* Helaian A4 */}
      <div className="print-sheet mx-auto w-[210mm] bg-white p-[14mm] text-[12px] leading-relaxed text-slate-900 shadow-lg">
        {/* Kepala — logo kiri + teks kiri (gaya premium) */}
        <div className="flex items-center gap-5">
          <img
            src={logo}
            alt="logo sekolah"
            className="h-[24mm] w-[24mm] shrink-0 object-contain"
          />
          <div className="min-w-0 flex-1 leading-tight">
            <h1 className="text-[20px] font-black uppercase tracking-tight text-[#1a237e]">
              {namaSekolah}
            </h1>
            {s?.alamat && <p className="mt-0.5 text-[11px] text-slate-600">{s.alamat}</p>}
            <p className="text-[11px] text-slate-600">
              {s?.kod_sekolah ? `Kod Sekolah: ${s.kod_sekolah}` : ""}
            </p>
            <div className="mt-1.5 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#f9a825] to-[#ff6d00]" />
          </div>
        </div>

        {/* Garis berkembar bawah kepala */}
        <div className="mt-2 border-b-[3px] border-double border-[#1a237e]" />

        {/* Tajuk laporan — band premium */}
        <div className="mt-3 text-center">
          <span className="inline-block rounded-full bg-[#1a237e] px-5 py-1 text-[13px] font-bold uppercase tracking-[2px] text-white">
            Laporan Program · One Page Report
          </span>
        </div>

        {/* Butiran */}
        <table className="mt-3 w-full border-collapse">
          <tbody>
            <Baris label="Program / Aktiviti" value={r.tajuk} />
            <Baris label="Anjuran" value={r.anjuran} />
            <Baris label="Tarikh" value={tarikh} />
            <Baris label="Masa" value={r.masa} />
            <Baris label="Tempat" value={r.tempat} />
            <Baris label="Kumpulan Sasaran" value={r.sasaran} />
            <Baris label="Bilangan Peserta" value={r.bil_peserta} />
            <Baris label="Kos (RM)" value={r.kos != null ? r.kos.toFixed(2) : null} />
          </tbody>
        </table>

        {/* Naratif */}
        <div className="mt-3 space-y-2">
          <Blok label="Objektif" value={r.objektif} />
          <Blok label="Ringkasan Pelaksanaan / Impak" value={r.pelaksanaan} />
          <div className="grid grid-cols-2 gap-3">
            <Blok label="Kekuatan" value={r.kekuatan} />
            <Blok label="Penambahbaikan" value={r.penambahbaikan} />
          </div>
          <Blok label="Refleksi / Cadangan" value={r.refleksi} />
        </div>

        {/* Gambar */}
        {r.gambar?.length > 0 && (
          <div className="mt-3 break-inside-avoid">
            <p className="font-bold text-slate-800">Gambar Aktiviti</p>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {r.gambar.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="gambar aktiviti"
                  className="h-28 w-full rounded border border-slate-300 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Tandatangan */}
        <div className="mt-8 grid grid-cols-2 gap-8 break-inside-avoid text-[11px]">
          <div>
            <p>Disediakan oleh:</p>
            <div className="mt-8 border-t border-slate-500 pt-1 font-semibold">{r.disediakan_oleh || "………………………"}</div>
          </div>
          <div>
            <p>Disahkan oleh:</p>
            <div className="mt-8 border-t border-slate-500 pt-1 font-semibold">{r.disahkan_oleh || "………………………"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
