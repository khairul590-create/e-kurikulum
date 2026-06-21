import { useMemo, useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import type { ColumnDef } from "./types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";

interface Props<T extends { id: string }> {
  columns: ColumnDef<T>[];
  data: T[];
  searchKeys?: (keyof T | string)[];
  canWrite?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  pageSize?: number;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  searchKeys = [],
  canWrite,
  onEdit,
  onDelete,
  pageSize = 12,
}: Props<T>) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!q.trim() || searchKeys.length === 0) return data;
    const t = q.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) =>
        String((row as Record<string, unknown>)[k as string] ?? "")
          .toLowerCase()
          .includes(t),
      ),
    );
  }, [data, q, searchKeys]);

  const pages = Math.ceil(filtered.length / pageSize) || 1;
  const rows = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div>
      {searchKeys.length > 0 && (
        <div className="relative mb-4 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Cari…"
            className="pl-9"
          />
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState subtitle="Tiada rekod dijumpai." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {columns.map((c) => (
                  <th key={c.key} className="px-3 py-3 whitespace-nowrap">
                    {c.header}
                  </th>
                ))}
                {canWrite && <th className="px-3 py-3 text-right">Tindakan</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line/70 last:border-0 hover:bg-slate-50/60"
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-3 py-3 align-middle ${c.className ?? ""}`}>
                      {c.render
                        ? c.render(row)
                        : String((row as Record<string, unknown>)[c.key] ?? "—")}
                    </td>
                  ))}
                  {canWrite && (
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => onEdit?.(row)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-danger hover:bg-red-50"
                          onClick={() => onDelete?.(row)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
          <span>
            {filtered.length} rekod · halaman {page + 1}/{pages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Sebelum
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Seterusnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
