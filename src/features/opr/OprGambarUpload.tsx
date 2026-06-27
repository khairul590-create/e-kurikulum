import { useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

const MAX = 6;

export function OprGambarUpload({
  value,
  onChange,
  folder,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string; // subfolder dalam bucket (cth: id OPR)
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const ruang = MAX - value.length;
    if (ruang <= 0) {
      toast("error", `Maksimum ${MAX} gambar sahaja.`);
      return;
    }
    const pilih = files.slice(0, ruang);

    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of pilih) {
        if (!file.type.startsWith("image/")) {
          toast("error", `"${file.name}" bukan gambar — dilangkau.`);
          continue;
        }
        const ext = file.name.split(".").pop() ?? "jpg";
        const safe = `${folder}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("opr").upload(safe, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) {
          toast("error", `Gagal naik "${file.name}": ${error.message}`);
          continue;
        }
        const { data } = supabase.storage.from("opr").getPublicUrl(safe);
        urls.push(data.publicUrl);
      }
      if (urls.length) onChange([...value, ...urls]);
    } finally {
      setBusy(false);
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
    // padam fail dari storage (best-effort)
    const path = url.split("/opr/")[1];
    if (path) void supabase.storage.from("opr").remove([decodeURIComponent(path)]);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div key={url} className="group relative size-24 overflow-hidden rounded-xl border-2 border-line">
            <img src={url} alt="gambar OPR" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-danger text-white opacity-0 transition group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {value.length < MAX && (
          <label className="grid size-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-ink-muted transition hover:bg-cream">
            {busy ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-[11px] font-semibold">
                <ImagePlus className="size-6" />
                Tambah
              </div>
            )}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={busy} />
          </label>
        )}
      </div>
      <p className="text-xs text-ink-muted">Maksimum {MAX} gambar · {value.length}/{MAX} digunakan</p>
    </div>
  );
}
