import type { ReactNode } from "react";

export type FieldType = "text" | "number" | "textarea" | "date" | "select" | "checkbox";

export interface FieldDef {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  full?: boolean; // span 2 columns
}

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface CrudConfig<T> {
  title: string;
  subtitle?: string;
  table: string;
  singular: string; // "Murid"
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  orderBy?: string;
  ascending?: boolean;
  select?: string;
  searchKeys?: (keyof T | string)[];
  /** map row -> form default values bila edit */
  toForm?: (row: T) => Record<string, unknown>;
  /** map form values -> payload sebelum simpan */
  fromForm?: (values: Record<string, unknown>) => Record<string, unknown>;
}
