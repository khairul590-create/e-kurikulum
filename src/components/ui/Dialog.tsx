import * as RD from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const w = { md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" }[size];
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm animate-fade-in" />
        <RD.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[26px] border-2 border-line bg-white shadow-pop animate-fade-in",
            w,
          )}
        >
          <div className="flex items-start justify-between border-b border-line px-5 py-4">
            <div>
              <RD.Title className="text-base font-semibold text-ink">{title}</RD.Title>
              {description && (
                <RD.Description className="text-sm text-ink-muted mt-0.5">
                  {description}
                </RD.Description>
              )}
            </div>
            <RD.Close className="rounded-lg p-1.5 text-ink-muted hover:bg-slate-100">
              <X className="size-4" />
            </RD.Close>
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>
          )}
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}
