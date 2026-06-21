import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="grid h-[60vh] place-items-center text-center">
      <div>
        <p className="text-6xl font-bold text-navy-800">404</p>
        <p className="mt-2 text-ink-muted">Halaman tidak dijumpai.</p>
        <Link to="/">
          <Button className="mt-5">Kembali ke Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
