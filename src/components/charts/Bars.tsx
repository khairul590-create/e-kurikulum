import type { UasaGred } from "@/types/db";

/** Peta warna gred A–F (A=hijau … F=kelabu). */
export const GRED_COLOR: Record<UasaGred, string> = {
  A: "#16A34A",
  B: "#2563EB",
  C: "#F59E0B",
  D: "#FB923C",
  E: "#EF4444",
  F: "#64748B",
};

/** Bar peratus mendatar bergaya (label · track · fill) — padan mockup. */
export function PercentBar({
  label,
  value,
  color = "#2563EB",
  suffix = "%",
}: {
  label: string;
  value: number;
  color?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-sm font-semibold text-ink">{label}</span>
      <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-cream">
        <div
          className="flex h-full items-center justify-end rounded-full px-2 text-[11px] font-bold text-white transition-all"
          style={{ width: `${Math.min(100, value)}%`, background: color }}
        >
          {value}
          {suffix}
        </div>
      </div>
    </div>
  );
}

/** Bar agihan gred A–F bersegmen (satu baris penuh). */
export function GredBar({
  counts,
}: {
  counts: { gred: UasaGred; bilangan: number }[];
}) {
  const total = counts.reduce((s, c) => s + c.bilangan, 0) || 1;
  return (
    <div className="space-y-2">
      <div className="flex h-7 w-full overflow-hidden rounded-lg">
        {counts.map((c) => {
          const w = (c.bilangan / total) * 100;
          if (w === 0) return null;
          return (
            <div
              key={c.gred}
              className="flex items-center justify-center text-[11px] font-bold text-white"
              style={{ width: `${w}%`, background: GRED_COLOR[c.gred] }}
              title={`Gred ${c.gred}: ${c.bilangan}`}
            >
              {w > 7 ? c.bilangan : ""}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {counts.map((c) => (
          <span key={c.gred} className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="size-2.5 rounded-sm" style={{ background: GRED_COLOR[c.gred] }} />
            {c.gred} · <b className="text-ink">{c.bilangan}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
