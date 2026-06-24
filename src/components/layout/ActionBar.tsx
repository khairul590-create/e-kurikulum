import { useNavigate } from "react-router-dom";
import { FileText, FileSpreadsheet, Printer, Users } from "lucide-react";

/** Action bar global ikut mockup (PDF/Excel/Cetak/Dashboard Murid). */
export function ActionBar() {
  const nav = useNavigate();
  return (
    <div className="flex flex-wrap justify-end gap-2.5 px-5 pt-2.5">
      <Btn className="bg-[#e53935]" icon={<FileText className="size-4" />} onClick={() => window.print()}>
        Laporan PDF
      </Btn>
      <Btn className="bg-[#0fa968]" icon={<FileSpreadsheet className="size-4" />} onClick={() => nav("/muat-turun")}>
        Eksport Excel
      </Btn>
      <Btn className="bg-[#1a73e8]" icon={<Printer className="size-4" />} onClick={() => window.print()}>
        Cetak
      </Btn>
      <Btn className="bg-[#7c4dff]" icon={<Users className="size-4" />} onClick={() => nav("/analisis-murid")}>
        Dashboard Murid
      </Btn>
    </div>
  );
}

function Btn({
  children,
  icon,
  className,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90 ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
