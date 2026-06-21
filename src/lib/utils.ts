import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTarikh(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatNombor(n?: number | null) {
  if (n == null) return "0";
  return new Intl.NumberFormat("ms-MY").format(n);
}

export function initials(nama?: string | null) {
  if (!nama) return "?";
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}
