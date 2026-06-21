import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "amber" | "red" | "purple" | "slate";

const tones: Record<Tone, string> = {
  blue: "bg-brand-50 text-brand-700",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  purple: "bg-purple-50 text-purple-700",
  slate: "bg-slate-100 text-slate-600",
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
