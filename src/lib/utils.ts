import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fmtEUR = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

export const toISODate = (d: Date) => d.toISOString();

export const startOfYearISO = (year: number) => new Date(Date.UTC(year, 0, 1)).toISOString();
export const endOfYearISO = (year: number) => new Date(Date.UTC(year + 1, 0, 1)).toISOString();

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}