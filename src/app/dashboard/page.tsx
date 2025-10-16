"use client";

import Protected from "@/components/Protected";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db, Query, storage, ID, Permission, Role } from "@/lib/appwrite";
import type { FuelLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FiltersBar from "@/components/filters/FiltersBar";
import PricePerLiterChart from "@/components/charts/PricePerLiterChart";
import SpendChart from "@/components/charts/SpendChart";
import { totalSpent, avgLiters, avgPricePerLiter } from "@/lib/compute";
import { fmtEUR, startOfYearISO, endOfYearISO } from "@/lib/utils";

type Granularity = "month" | "year";
type Filters = { carId: string | null; granularity: Granularity; year: number | "all" };

export default function DashboardPage() {
  return (
    <Protected>
      <DashboardInner />
    </Protected>
  );
}

function DashboardInner() {
  const [filters, setFilters] = useState<Filters>({ carId: null, granularity: "month", year: "all" });
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [busy, setBusy] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<{ ok: number; fail: number }>({ ok: 0, fail: 0 });

  const fetchLogs = useCallback(async () => {
    const q: string[] = [Query.limit(500), Query.orderDesc("date")];
    if (filters.carId) q.push(Query.equal("carId", filters.carId));
    if (filters.year !== "all") {
      q.push(Query.greaterThanEqual("date", startOfYearISO(filters.year)));
      q.push(Query.lessThan("date", endOfYearISO(filters.year)));
    }
    const res = await db.listDocuments(
      process.env.NEXT_PUBLIC_DB_ID!,
      process.env.NEXT_PUBLIC_FUELLOGS_ID!,
      q // <- no "as any"
    );
    setLogs(res.documents as FuelLog[]);
  }, [filters]);

  useEffect(() => { fetchLogs().catch(console.error); }, [fetchLogs]);

  const stats = useMemo(() => ({
    total: totalSpent(logs),
    ppl: avgPricePerLiter(logs),
    liters: avgLiters(logs)
  }), [logs]);

  async function askAI() {
    setBusy(true); setInsight(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, sample: logs.slice(0, 150) })
      });
      const j = (await res.json()) as { text?: string; error?: string };
      setInsight(j.text ?? j.error ?? "No response");
    } finally { setBusy(false); }
  }

  function openPicker() {
    fileInputRef.current?.click();
  }

  async function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const bucketId = process.env.NEXT_PUBLIC_RECEIPTS_BUCKET!;
    setUploading(true);
    setUploaded({ ok: 0, fail: 0 });

    try {
      await Promise.all(
        files.map(async (file) => {
          try {
            await storage.createFile(
              bucketId,
              ID.unique(),
              file,
              [
                Permission.read(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
              ]
            );
            setUploaded((s) => ({ ...s, ok: s.ok + 1 }));
          } catch (err) {
            console.error("Upload failed:", err);
            setUploaded((s) => ({ ...s, fail: s.fail + 1 }));
          }
        })
      );
    } finally {
      setUploading(false);
      fetchLogs().catch(console.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Overview</h2>
        <div className="flex items-center gap-3">
          {uploading ? (
            <span className="text-sm text-neutral-600">
              Uploading… ({uploaded.ok} ok / {uploaded.fail} failed)
            </span>
          ) : uploaded.ok + uploaded.fail > 0 ? (
            <span className="text-sm text-neutral-600">
              Uploaded: {uploaded.ok} ok / {uploaded.fail} failed
            </span>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFilesSelected}
          />

          <Button
            type="button"
            variant="outline"
            onClick={openPicker}
            disabled={uploading}
            aria-label="Upload receipts"
            className="
              h-9 rounded-md border px-3
              bg-white
              hover:bg-neutral-50
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
              disabled:opacity-50
            "
          >
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>

      <FiltersBar onChange={setFilters} />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Total spent</div>
          <div className="text-2xl font-semibold">{fmtEUR(stats.total)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Avg. price/L</div>
          <div className="text-2xl font-semibold">
            {stats.ppl ? `${stats.ppl.toFixed(3)} €/L` : "—"}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Avg. liters / fill</div>
          <div className="text-2xl font-semibold">
            {stats.liters ? `${stats.liters.toFixed(1)} L` : "—"}
          </div>
        </Card>
      </section>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-3">Price per liter over time</h3>
        <PricePerLiterChart logs={logs} />
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-3">Spend ({filters.granularity})</h3>
        <SpendChart logs={logs} mode={filters.granularity} />
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">AI Insight (on demand)</h3>
          <Button onClick={askAI} disabled={busy}>
            {busy ? "Thinking…" : "Generate insight"}
          </Button>
        </div>
        {insight ? (
          <pre className="bg-gray-100 rounded p-3 text-sm whitespace-pre-wrap">{insight}</pre>
        ) : (
          <p className="text-sm text-neutral-500">Click to request an insight. No AI calls on reload.</p>
        )}
      </Card>
    </div>
  );
}
