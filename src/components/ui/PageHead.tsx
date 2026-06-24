import type { ReactNode } from "react";
import { Info } from "lucide-react";

export function PageHead({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-xl font-extrabold tracking-tight text-ink lg:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm font-semibold text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl border-l-4 border-brand bg-brand-50 px-4 py-3 text-sm leading-relaxed text-brand-700">
      <Info className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
