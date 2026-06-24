import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PanelVariant = "blue" | "green" | "orange" | "purple" | "teal" | "red" | "indigo";

const HEAD_GRAD: Record<PanelVariant, string> = {
  blue: "from-[#1a73e8] to-[#0d47a1]",
  green: "from-[#0fa968] to-[#1b5e20]",
  orange: "from-[#ff6d00] to-[#e65100]",
  purple: "from-[#7c4dff] to-[#311b92]",
  teal: "from-[#00bcd4] to-[#006064]",
  red: "from-[#e53935] to-[#880e4f]",
  indigo: "from-[#3949ab] to-[#1a237e]",
};

export function Panel({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mk-panel", className)} {...rest} />;
}

/** Tajuk panel bergradien warna (ikut mockup). icon = emoji/teks. */
export function PanelHead({
  variant = "blue",
  icon,
  tag,
  children,
  className,
}: {
  variant?: PanelVariant;
  icon?: ReactNode;
  tag?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-gradient-to-r px-4 py-3 text-[15px] font-bold uppercase tracking-wide text-white",
        HEAD_GRAD[variant],
        className,
      )}
    >
      {icon && <span className="text-[18px] leading-none">{icon}</span>}
      <span className="min-w-0 flex-1 truncate normal-case">{children}</span>
      {tag && (
        <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-semibold normal-case">{tag}</span>
      )}
    </div>
  );
}

export function PanelBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-x-auto p-4", className)} {...rest} />;
}

/** Tajuk page ikut mockup (navy bold + subtitle). */
export function PageTitle({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 font-display text-xl font-extrabold text-[#1a237e] lg:text-2xl">
          {icon && <span>{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-[#777]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Nota maklumat biru ikut mockup. */
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3.5 rounded-lg border-l-4 border-[#1a73e8] bg-[#e3f2fd] px-3.5 py-3 text-[13px] leading-relaxed text-[#1565c0]">
      {children}
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="mb-3 flex flex-wrap gap-2">{children}</div>;
}

