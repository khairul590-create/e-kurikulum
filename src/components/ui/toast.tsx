import * as RT from "@radix-ui/react-toast";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: Kind;
  msg: string;
}
const Ctx = createContext<(kind: Kind, msg: string) => void>(() => {});
let counter = 0;

const icons = {
  success: <CheckCircle2 className="size-5 text-ok" />,
  error: <AlertCircle className="size-5 text-danger" />,
  info: <Info className="size-5 text-brand" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (kind: Kind, msg: string) => {
    const id = ++counter;
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  return (
    <Ctx.Provider value={push}>
      <RT.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <RT.Root
            key={t.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-pop animate-fade-in",
            )}
          >
            {icons[t.kind]}
            <RT.Description className="text-sm font-medium text-ink">{t.msg}</RT.Description>
          </RT.Root>
        ))}
        <RT.Viewport className="fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none" />
      </RT.Provider>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
