import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type Sc = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const SC: Record<Sc, string> = {
  1: "from-[#1a73e8] to-[#0d47a1]",
  2: "from-[#0fa968] to-[#1b5e20]",
  3: "from-[#f9a825] to-[#e65100]",
  4: "from-[#e53935] to-[#880e4f]",
  5: "from-[#7c4dff] to-[#311b92]",
  6: "from-[#00bcd4] to-[#006064]",
  7: "from-[#e91e8c] to-[#880e4f]",
};

/** Kad stat tengah-aligned warna mockup (sc1â7). icon = emoji. to = pautan opsyenal ke page isi data. */
export function MkStatCard({
  icon,
  value,
  label,
  sc = 1,
  to,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  sc?: Sc;
  to?: string;
}) {
  const cls = cn(
    "relative flex min-w-[120px] flex-1 flex-col items-center overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg",
    SC[sc],
    to && "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-xl",
  );
  const content = (
    <>
      <div className="absolute -bottom-3.5 -right-3.5 size-16 rounded-full bg-white/10" />
      <div className="mb-1 text-3xl leading-none">{icon}</div>
      <div className="text-[30px] font-extrabold leading-none">{value}</div>
      <div className="mt-1.5 text-center text-[12px] font-medium opacity-90">{label}</div>
    </>
  );
  return to ? <Link to={to} className={cls}>{content}</Link> : <div className={cls}>{content}</div>;
}

export function StatRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2.5">{children}</div>;
}
