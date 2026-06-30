import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import type { CrudConfig, FieldDef } from "./types";
import { DataTable } from "./DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Misc";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/panel/Panel";
import { useList, useCreate, useUpdate, useRemove, logActivity } from "@/lib/crud";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";

export function CrudPage<T extends { id: string }>({
  config,
  canWrite = true,
  extraFieldOptions = {},
  headerAction,
  toolbar,
  clientFilter,
  clientSort,
}: {
  config: CrudConfig<T>;
  canWrite?: boolean;
  /** options dinamik untuk field select (kunci = field.name) */
  extraFieldOptions?: Record<string, { value: string; label: string }[]>;
  /** butang tambahan di sebelah "Tambah" (cth: Import) */
  headerAction?: ReactNode;
  /** kawalan tapis tambahan di atas jadual (cth: dropdown kelas) */
  toolbar?: ReactNode;
  /** tapis baris di sisi klien (selepas fetch) */
  clientFilter?: (row: T) => boolean;
  /** susun baris di sisi klien (selepas fetch) */
  clientSort?: (a: T, b: T) => number;
}) {
  const toast = useToast();
  const { profile } = useAuth();
  const list = useList<T>(config.table, {
    select: config.select,
    orderBy: config.orderBy,
    ascending: config.ascending,
  });
  const create = useCreate(config.table);
  const update = useUpdate(config.table);
  const remove = useRemove(config.table);

  const rows = useMemo(() => {
    let d = list.data ?? [];
    if (clientFilter) d = d.filter(clientFilter);
    if (clientSort) d = [...d].sort(clientSort);
    return d;
  }, [list.data, clientFilter, clientSort]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [confirmDel, setConfirmDel] = useState<T | null>(null);

  const form = useForm<Record<string, unknown>>();

  function openAdd() {
    setEditing(null);
    form.reset(Object.fromEntries(config.fields.map((f) => [f.name, ""])));
    setOpen(true);
  }
  function openEdit(row: T) {
    setEditing(row);
    const vals = config.toForm
      ? config.toForm(row)
      : Object.fromEntries(
          config.fields.map((f) => [f.name, (row as Record<string, unknown>)[f.name] ?? ""]),
        );
    form.reset(vals);
    setOpen(true);
  }

  async function onSubmit(values: Record<string, unknown>) {
    const payload = config.fromForm ? config.fromForm(values) : cleanPayload(config.fields, values);
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, values: payload });
        toast("success", `${config.singular} dikemaskini`);
        void logActivity({
          actor_id: profile?.id,
          actor_nama: profile?.nama,
          action: `${config.singular} Dikemaskini`,
          modul: config.title,
        });
      } else {
        await create.mutateAsync(payload);
        toast("success", `${config.singular} ditambah`);
        void logActivity({
          actor_id: profile?.id,
          actor_nama: profile?.nama,
          action: `${config.singular} Ditambah`,
          modul: config.title,
        });
      }
      setOpen(false);
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat menyimpan");
    }
  }

  async function doDelete() {
    if (!confirmDel) return;
    const detail = (confirmDel as Record<string, unknown>)["nama"] as string | undefined ?? confirmDel.id;
    try {
      await remove.mutateAsync(confirmDel.id);
      toast("success", `${config.singular} dipadam`);
      void logActivity({
        actor_id: profile?.id,
        actor_nama: profile?.nama,
        action: `${config.singular} Dipadam`,
        modul: config.title,
        detail,
      });
    } catch (e) {
      toast("error", (e as Error).message ?? "Ralat memadam");
    }
    setConfirmDel(null);
  }

  return (
    <div className="space-y-4">
      <PageTitle
        title={config.title}
        subtitle={config.subtitle}
        action={canWrite && (
          <div className="flex items-center gap-2">
            {headerAction}
            <Button onClick={openAdd}>
              <Plus className="size-4" /> Tambah {config.singular}
            </Button>
          </div>
        )}
      />

      <Card className="p-5">
        {toolbar && <div className="mb-4">{toolbar}</div>}
        {list.isLoading ? (
          <PageLoader />
        ) : list.isError ? (
          <p className="py-10 text-center text-sm text-danger">
            Gagal memuatkan data. Pastikan Supabase berjalan & .env.local betul.
          </p>
        ) : (
          <DataTable
            columns={config.columns}
            data={rows}
            searchKeys={config.searchKeys as string[]}
            canWrite={canWrite}
            onEdit={openEdit}
            onDelete={setConfirmDel}
          />
        )}
      </Card>

      {/* Form dialog */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={`${editing ? "Kemaskini" : "Tambah"} ${config.singular}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              loading={create.isPending || update.isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              Simpan
            </Button>
          </>
        }
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {config.fields.map((f) => (
            <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
              <FormField
                field={f}
                options={extraFieldOptions[f.name] ?? f.options}
                register={form.register}
                error={form.formState.errors[f.name]?.message as string | undefined}
              />
            </div>
          ))}
        </form>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!confirmDel}
        onOpenChange={(o) => !o && setConfirmDel(null)}
        title={`Padam ${config.singular}?`}
        description="Tindakan ini tidak boleh diundur."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>
              Batal
            </Button>
            <Button variant="danger" loading={remove.isPending} onClick={doDelete}>
              Padam
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          Anda pasti mahu memadam rekod ini? Data berkaitan mungkin turut terjejas.
        </p>
      </Dialog>
    </div>
  );
}

function FormField({
  field,
  options,
  register,
  error,
}: {
  field: FieldDef;
  options?: { value: string; label: string }[];
  register: ReturnType<typeof useForm>["register"];
  error?: string;
}) {
  const reg = register(field.name, { required: field.required ? "Wajib diisi" : false });
  return (
    <Field label={field.label} required={field.required} error={error}>
      {field.type === "textarea" ? (
        <Textarea placeholder={field.placeholder} {...reg} />
      ) : field.type === "select" ? (
        <Select {...reg}>
          <option value="">— Pilih —</option>
          {(options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      ) : field.type === "checkbox" ? (
        <input type="checkbox" className="size-4 rounded border-line" {...reg} />
      ) : (
        <Input type={field.type ?? "text"} placeholder={field.placeholder} {...reg} />
      )}
    </Field>
  );
}

function cleanPayload(fields: FieldDef[], values: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    let v = values[f.name];
    if (v === "" || v === undefined) v = null;
    if (f.type === "number" && v != null) v = Number(v);
    out[f.name] = v;
  }
  return out;
}
