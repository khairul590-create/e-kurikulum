import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "amber" | "red" | "purple" | "slate" | "gold";

const tones: Record<Tone, string> = {
  blue: "bg-[#e3f2fd] text-[#1565c0]",
  green: "bg-[#e8f5e9] text-[#2e7d32]",
  amber: "bg-[#fff3e0] text-[#e65100]",
  red: "bg-[#ffebee] text-[#c62828]",
  purple: "bg-[#f3e5f5] text-[#6a1b9a]",
  slate: "bg-slate-100 text-slate-600",
  gold: "bg-[#fff8e1] text-[#f57f17]",
};

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn("inline-block size-2 rounded-full", className)} />;
}
