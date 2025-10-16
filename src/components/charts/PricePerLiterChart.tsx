// src/components/charts/PricePerLiterChart.tsx
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { FuelLog } from "@/lib/types";

export default function PricePerLiterChart({ logs }: { logs: FuelLog[] }) {
  const data = logs
    .filter((l) => l.pricePerLiter != null)
    .map((l) => ({
      date: new Date(l.date || l.$createdAt).toISOString().slice(0, 10),
      ppl: Number(l.pricePerLiter),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 24, left: 8, bottom: 12 }}>
          <defs>
            <linearGradient id="linePPL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="ppl" stroke="url(#linePPL)" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
