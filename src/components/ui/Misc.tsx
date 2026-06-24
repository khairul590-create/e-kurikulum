import type { ReactNode } from "react";
import { Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-brand", className)} />;
}

export function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner className="size-7" />
    </div>
  );
}

export function EmptyState({
  title = "Tiada data",
  subtitle,
  action,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-ink-soft">
        <Inbox className="size-6" />
      </div>
      <p className="font-medium text-ink">{title}</p>
      {subtitle && <p className="text-sm text-ink-muted max-w-xs">{subtitle}</p>}
      {action}
    </div>
  );
}

export function Progress({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%`, background: color ?? "#2563EB" }}
      />
    </div>
  );
}
