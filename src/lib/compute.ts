import { FuelLog } from "./types";

export function totalSpent(logs: FuelLog[]) {
  return logs.reduce((s, l) => s + (l.priceTotal ?? 0), 0);
}

export function avgLiters(logs: FuelLog[]) {
  const vals = logs.map(l => l.liters ?? 0).filter(n => n > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

export function avgPricePerLiter(logs: FuelLog[]) {
  const vals = logs.map(l => l.pricePerLiter ?? 0).filter(n => n > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

export function groupByMonth(logs: FuelLog[]) {
  const map = new Map<string, number>();
  for (const l of logs) {
    const d = new Date(l.date || l.$createdAt);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + (l.priceTotal ?? 0));
  }
  return Array.from(map.entries())
    .map(([k, v]) => ({ ym: k, total: v }))
    .sort((a, b) => a.ym.localeCompare(b.ym));
}

export function groupByYear(logs: FuelLog[]) {
  const map = new Map<number, number>();
  for (const l of logs) {
    const d = new Date(l.date || l.$createdAt);
    map.set(d.getUTCFullYear(), (map.get(d.getUTCFullYear()) ?? 0) + (l.priceTotal ?? 0));
  }
  return Array.from(map.entries())
    .map(([yr, total]) => ({ year: yr, total }))
    .sort((a, b) => a.year - b.year);
}

export function yearsPresent(logs: FuelLog[]) {
  return Array.from(new Set(logs.map(l => new Date(l.date || l.$createdAt).getUTCFullYear()))).sort();
}
