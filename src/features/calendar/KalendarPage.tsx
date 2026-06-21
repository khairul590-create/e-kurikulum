import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Misc";
import { useList, useCreate, useRemove } from "@/lib/crud";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import { cn, formatTarikh } from "@/lib/utils";
import type { CalendarEvent } from "@/types/db";

const JENIS_TONE: Record<string, "blue" | "red" | "amber" | "green" | "purple"> = {
  umum: "blue",
  cuti: "green",
  peperiksaan: "red",
  program: "purple",
  mesyuarat: "amber",
  tarikh_akhir: "red",
};

export default function KalendarPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const events = useList<CalendarEvent>("calendar_events", { orderBy: "tarikh_mula", ascending: true });
  const create = useCreate("calendar_events");
  const remove = useRemove("calendar_events");

  const [cursor, setCursor] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tajuk: "", jenis: "umum", tarikh_mula: "", tarikh_tamat: "", keterangan: "" });

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const evByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events.data ?? []) {
      const key = e.tarikh_mula;
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return map;
  }, [events.data]);

  async function save() {
    if (!form.tajuk || !form.tarikh_mula) {
      toast("error", "Tajuk & tarikh wajib diisi");
      return;
    }
    try {
      await create.mutateAsync({
        tajuk: form.tajuk,
        jenis: form.jenis,
        tarikh_mula: form.tarikh_mula,
        tarikh_tamat: form.tarikh_tamat || null,
        keterangan: form.keterangan || null,
      });
      toast("success", "Acara ditambah");
      setOpen(false);
      setForm({ tajuk: "", jenis: "umum", tarikh_mula: "", tarikh_tamat: "", keterangan: "" });
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  if (events.isLoading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Kalendar Akademik</h1>
          <p className="text-sm text-ink-muted">Takwim & acara penting sekolah</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Tambah Acara
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Month grid */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={format(cursor, "MMMM yyyy")}
            action={
              <div className="flex gap-1">
                <Button size="icon" variant="outline" onClick={() => setCursor((c) => addMonths(c, -1))}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => setCursor((c) => addMonths(c, 1))}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            }
          />
          <CardBody>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-soft">
              {["Aha", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"].map((d) => (
                <div key={d} className="py-1.5">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const ev = evByDay.get(key) ?? [];
                const today = isSameDay(day, new Date());
                return (
                  <div
                    key={key}
                    className={cn(
                      "min-h-[68px] rounded-lg border p-1.5 text-left",
                      isSameMonth(day, cursor) ? "border-line bg-white" : "border-transparent bg-slate-50/50 text-ink-soft",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-grid size-6 place-items-center rounded-full text-xs",
                        today && "bg-brand font-bold text-white",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {ev.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="truncate rounded px-1 py-0.5 text-[10px] font-medium"
                          style={{ background: "#EFF5FF", color: "#1D4ED8" }}
                          title={e.tajuk}
                        >
                          {e.tajuk}
                        </div>
                      ))}
                      {ev.length > 2 && <p className="text-[10px] text-ink-soft">+{ev.length - 2} lagi</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Upcoming list */}
        <Card>
          <CardHeader title="Acara Akan Datang" />
          <CardBody className="space-y-3">
            {(events.data ?? []).map((e) => (
              <div key={e.id} className="flex items-start gap-3 rounded-xl border border-line p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{e.tajuk}</p>
                    <Badge tone={JENIS_TONE[e.jenis] ?? "slate"}>{e.jenis.replace("_", " ")}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {formatTarikh(e.tarikh_mula)}
                    {e.tarikh_tamat && e.tarikh_tamat !== e.tarikh_mula ? ` – ${formatTarikh(e.tarikh_tamat)}` : ""}
                  </p>
                  {e.keterangan && <p className="mt-0.5 text-xs text-ink-soft">{e.keterangan}</p>}
                </div>
                {isAdmin && (
                  <button
                    onClick={async () => {
                      await remove.mutateAsync(e.id);
                      toast("success", "Acara dipadam");
                    }}
                    className="rounded-lg p-1.5 text-danger hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Tambah Acara"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={create.isPending} onClick={save}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Tajuk" required>
            <Input value={form.tajuk} onChange={(e) => setForm({ ...form, tajuk: e.target.value })} />
          </Field>
          <Field label="Jenis">
            <Select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
              {Object.keys(JENIS_TONE).map((j) => (
                <option key={j} value={j}>
                  {j.replace("_", " ")}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tarikh Mula" required>
              <Input type="date" value={form.tarikh_mula} onChange={(e) => setForm({ ...form, tarikh_mula: e.target.value })} />
            </Field>
            <Field label="Tarikh Tamat">
              <Input type="date" value={form.tarikh_tamat} onChange={(e) => setForm({ ...form, tarikh_tamat: e.target.value })} />
            </Field>
          </div>
          <Field label="Keterangan">
            <Textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
