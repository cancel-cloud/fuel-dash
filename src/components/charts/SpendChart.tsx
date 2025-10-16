// src/components/charts/SpendChart.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { groupByMonth, groupByYear } from "@/lib/compute";
import type { FuelLog } from "@/lib/types";

export default function SpendChart({ logs, mode }: { logs: FuelLog[]; mode: "month" | "year" }) {
  const data = mode === "month"
    ? groupByMonth(logs).map((d) => ({ label: d.ym, total: d.total }))
    : groupByYear(logs).map((d) => ({ label: String(d.year), total: d.total }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 12, right: 24, left: 8, bottom: 12 }}>
          <defs>
            <linearGradient id="barSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="url(#barSpend)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
