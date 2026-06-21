import type { LucideIcon } from "lucide-react";

type Tint = "blue" | "ocean" | "light" | "sun" | "sky" | "indigo";

const grad: Record<Tint, string> = {
  blue: "from-[#3b82f6] to-[#2563eb] text-white",
  ocean: "from-[#0ea5e9] to-[#1e3a8a] text-white",
  light: "from-[#60a5fa] to-[#3b82f6] text-white",
  sky: "from-[#38bdf8] to-[#0284c7] text-white",
  indigo: "from-[#818cf8] to-[#4f46e5] text-white",
  sun: "from-[#fbbf24] to-[#e09600] text-ink",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tint = "blue",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tint?: Tint;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[26px] bg-gradient-to-br ${grad[tint]} p-5 shadow-chunky transition hover:-translate-y-1`}
    >
      {/* deco blob */}
      <div className="absolute -right-8 -top-8 size-28 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125" />
      <div className="relative flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Icon className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold opacity-90">{label}</p>
          <p className="mt-0.5 text-2xl font-black tracking-tight">{value}</p>
          {hint && <p className="mt-0.5 text-xs font-semibold opacity-80">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
