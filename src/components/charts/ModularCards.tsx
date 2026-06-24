import type { KssrModular } from "@/types/db";

const MODUL_META: Record<string, { title: string; border: string; dot: string }> = {
  teras_asas: { title: "🔵 Modul Teras Asas", border: "border-l-brand", dot: "#2563EB" },
  teras_tema: { title: "🟢 Modul Teras Tema", border: "border-l-green-500", dot: "#16A34A" },
  elektif: { title: "🟠 Modul Elektif", border: "border-l-orange-500", dot: "#F97316" },
  tiada: { title: "⚪ Belum Dikategorikan", border: "border-l-slate-300", dot: "#94A3B8" },
};

const ORDER = ["teras_asas", "teras_tema", "elektif", "tiada"];

/** Kad struktur KSSR modular ikut kumpulan modul. */
export function ModularCards({ data }: { data: KssrModular[] }) {
  const sorted = [...data].sort((a, b) => ORDER.indexOf(a.modul) - ORDER.indexOf(b.modul));
  return (
    <div className="space-y-3">
      {sorted.map((m) => {
        const meta = MODUL_META[m.modul] ?? MODUL_META.tiada;
        return (
          <div key={m.modul} className={`rounded-xl border-l-4 bg-cream/60 p-3 ${meta.border}`}>
            <p className="text-sm font-bold text-ink">
              {meta.title} <span className="text-ink-soft">({m.bilangan})</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{m.senarai ?? "—"}</p>
          </div>
        );
      })}
    </div>
  );
}
