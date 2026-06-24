import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ââ Bar peratus (mockup bar-item) ââ */
export function MkBar({ label, value, fill }: { label: ReactNode; value: number; fill: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[110px] shrink-0 truncate text-[11px] font-semibold">{label}</div>
      <div className="relative h-[22px] flex-1 overflow-hidden rounded-[20px] bg-[#eef2ff]">
        <div
          className={cn("flex h-full items-center justify-end rounded-[20px] bg-gradient-to-r px-2 text-[10px] font-bold text-white transition-all", fill)}
          style={{ width: `${Math.min(100, value)}%` }}
        >
          {value}%
        </div>
      </div>
    </div>
  );
}

/* ââ Kotak gred AâF ââ */
const GR: Record<string, string> = {
  A: "from-[#0fa968] to-[#1b5e20]",
  B: "from-[#1a73e8] to-[#0d47a1]",
  C: "from-[#f9a825] to-[#e65100]",
  D: "from-[#ff6d00] to-[#bf360c]",
  E: "from-[#e53935] to-[#880e4f]",
  F: "from-[#757575] to-[#424242]",
};
export function GredRow({ data }: { data: { gred: string; bil: number }[] }) {
  return (
    <div className="flex gap-1.5">
      {data.map((d) => (
        <div key={d.gred} className={cn("flex-1 rounded-lg bg-gradient-to-br p-2 text-center text-white", GR[d.gred] ?? GR.F)}>
          <div className="text-base font-extrabold leading-none">{d.gred}</div>
          <div className="mt-0.5 text-[10px] opacity-90">{d.bil}</div>
        </div>
      ))}
    </div>
  );
}

/* ââ Gauge box ââ */
export type GaugeTone = "red" | "yellow" | "green" | "blue";
const G: Record<GaugeTone, string> = {
  red: "bg-[#ffebee] text-[#c62828]",
  yellow: "bg-[#fff8e1] text-[#f57f17]",
  green: "bg-[#e8f5e9] text-[#2e7d32]",
  blue: "bg-[#e3f2fd] text-[#1565c0]",
};
export function GaugeBox({ value, label, tone }: { value: ReactNode; label: ReactNode; tone: GaugeTone }) {
  return (
    <div className={cn("flex-1 rounded-[10px] p-2.5 text-center", G[tone])}>
      <div className="text-xl font-extrabold leading-none">{value}</div>
      <div className="mt-1 text-[9px] font-medium leading-tight">{label}</div>
    </div>
  );
}
export function GaugeRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex gap-2.5", className)}>{children}</div>;
}

/* ââ Col-chart CSS (TP menegak ikut mockup) ââ */
export function ColChart({
  data,
  height = 160,
}: {
  data: { label: ReactNode; value: number; grad: string }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 px-1 pt-2.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <div
            className={cn("flex w-[62%] items-start justify-center rounded-t-md bg-gradient-to-b pt-0.5 text-[11px] font-bold text-white", d.grad)}
            style={{ height: `${Math.max(14, (d.value / max) * 100)}%` }}
          >
            {d.value}
          </div>
          <div className="text-center text-[10px] font-semibold leading-tight text-[#555]">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ââ Rank bulat ââ */
export function RankNo({ n }: { n: number }) {
  const bg = n === 1 ? "bg-[#f9a825]" : n === 2 ? "bg-[#9e9e9e]" : n === 3 ? "bg-[#8d6e63]" : "bg-[#90a4ae]";
  return (
    <span className={cn("inline-grid size-[22px] place-items-center rounded-full text-[11px] font-bold text-white", bg)}>{n}</span>
  );
}

/* ââ Kad modular KSSR ââ */
const MODUL_BORDER: Record<string, string> = {
  teras_asas: "border-[#1a73e8]",
  teras_tema: "border-[#0fa968]",
  elektif: "border-[#ff6d00]",
  tiada: "border-[#90a4ae]",
};
const MODUL_TITLE: Record<string, string> = {
  teras_asas: "🔵 Modul Teras Asas",
  teras_tema: "🟢 Modul Teras Tema",
  elektif: "🟠 Modul Elektif",
  tiada: "⚪ Belum Dikategorikan",
};
export function ModuleGrid({ data }: { data: { modul: string; senarai: string | null }[] }) {
  const order = ["teras_asas", "teras_tema", "elektif", "tiada"];
  const sorted = [...data].sort((a, b) => order.indexOf(a.modul) - order.indexOf(b.modul));
  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map((m) => (
        <div key={m.modul} className={cn("rounded-[10px] border-l-4 bg-[#f8f9ff] px-3 py-2.5", MODUL_BORDER[m.modul] ?? MODUL_BORDER.tiada)}>
          <div className="text-[11px] font-bold text-ink">{MODUL_TITLE[m.modul] ?? m.modul}</div>
          <div className="mt-1 text-[10px] leading-relaxed text-[#666]">{m.senarai ?? "—"}</div>
        </div>
      ))}
    </div>
  );
}
