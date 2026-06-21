import { useState } from "react";
import { Navigate } from "react-router-dom";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { useAuth } from "@/providers/AuthProvider";

export default function Login() {
  const { session, signIn, loading } = useAuth();
  const [email, setEmail] = useState("admin@kurikulum.test");
  const [password, setPassword] = useState("password123");
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (loading)
    return (
      <div className="grid h-screen place-items-center">
        <Loader2 className="size-7 animate-spin text-brand" />
      </div>
    );
  if (session) return <Navigate to="/" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setErr("Emel atau kata laluan salah.");
  }

  return (
    <div className="relative flex min-h-screen bg-paper">
      {/* Left brand panel */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#1e3a8a] p-12 text-white lg:flex">
        <div className="blob animate-float1 absolute -left-16 -top-16 size-72 bg-[#60a5fa]/40" />
        <div className="blob animate-float2 absolute -bottom-20 right-0 size-64 bg-[#818cf8]/40" />
        <div className="dotgrid absolute inset-0 opacity-50" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid size-12 -rotate-6 place-items-center rounded-2xl bg-gradient-to-br from-sun to-sun-deep text-ink shadow-sun">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <p className="font-black">SK Darau Kota Kinabalu</p>
            <p className="text-xs font-bold uppercase tracking-widest text-sun">Kurikulum Sekolah Rendah</p>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black leading-[0.98] tracking-tight">
            Sistem Pengurusan
            <br />
            <span className="mt-2 inline-block -rotate-2 rounded-2xl bg-sun px-3 py-0.5 text-ink shadow-sun">
              Kurikulum
            </span>
          </h1>
          <p className="mt-4 max-w-sm font-semibold text-white/80">
            Urus RPH, pentaksiran, pencapaian murid dan analisis kurikulum dalam satu platform yang kemas & responsif.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/50">© 2024/2025 E-Kurikulum. Hak cipta terpelihara.</p>
      </div>

      {/* Right form */}
      <div className="relative z-10 flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm rounded-[26px] border-2 border-line bg-white p-7 shadow-chunky">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-11 -rotate-6 place-items-center rounded-2xl bg-gradient-to-br from-sun to-sun-deep text-ink shadow-sun">
              <GraduationCap className="size-5" />
            </div>
            <p className="font-black text-ink">E-Kurikulum</p>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-ink">Log Masuk 👋</h2>
          <p className="mt-1 text-sm font-semibold text-ink-muted">Masukkan kredensial untuk mengakses sistem.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Emel">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </Field>
            <Field label="Kata Laluan">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </Field>
            {err && <p className="text-sm text-danger">{err}</p>}
            <Button type="submit" variant="sun" className="w-full" loading={busy}>
              Log Masuk →
            </Button>
          </form>

          <div className="mt-6 rounded-xl border-2 border-line bg-cream p-4 text-xs font-semibold text-ink-muted">
            <p className="font-black text-ink">Akaun Pentadbir</p>
            <p className="mt-1">Emel: admin@kurikulum.test</p>
            <p>Kata laluan: password123</p>
            <p className="mt-1 text-ink-soft">Tukar di Tetapan selepas log masuk.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
