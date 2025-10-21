"use client";

import { useMemo, useState } from "react";
import PricePerLiterChart from "@/components/charts/PricePerLiterChart";
import SpendChart from "@/components/charts/SpendChart";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { avgLiters, avgPricePerLiter, totalSpent } from "@/lib/compute";
import { fmtEUR, unique } from "@/lib/utils";
import { demoCars, demoFeatureHighlights, demoFuelLogs } from "@/lib/demo-data";

type Granularity = "month" | "year";
type YearValue = number | "all";
const ITEM_PX = 40;
const PADDING_PX = 16;
const MAX_VISIBLE_ITEMS = 6;

export default function FeaturesShowcase() {
  const defaultCarId = demoCars[0]?.$id ?? "";
  const [carId, setCarId] = useState<string>(defaultCarId);
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [year, setYear] = useState<YearValue>("all");
  const [carOpen, setCarOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const yearOptions = useMemo(
    () =>
      unique(
        demoFuelLogs.map((log) => new Date(log.date || log.$createdAt).getUTCFullYear()),
      ).sort((a, b) => a - b),
    [],
  );

  const activeLogs = useMemo(() => {
    const byCar = demoFuelLogs.filter((log) => (carId ? log.carId === carId : true));
    if (year === "all") return byCar;
    return byCar.filter(
      (log) => new Date(log.date || log.$createdAt).getUTCFullYear() === year,
    );
  }, [carId, year]);

  const stats = useMemo(
    () => ({
      total: totalSpent(activeLogs),
      ppl: avgPricePerLiter(activeLogs),
      liters: avgLiters(activeLogs),
    }),
    [activeLogs],
  );

  const activeCar = demoCars.find((car) => car.$id === carId);
  const selectionSummary =
    activeLogs.length === 1
      ? `${activeLogs.length} receipt`
      : `${activeLogs.length} receipts`;
  const carMenuHeight = useMemo(() => {
    const count = demoCars.length || 1;
    const h = Math.min(count, MAX_VISIBLE_ITEMS) * ITEM_PX + PADDING_PX;
    return h;
  }, []);
  const yearMenuHeight = useMemo(() => {
    const count = yearOptions.length || 1;
    const h = Math.min(count, MAX_VISIBLE_ITEMS) * ITEM_PX + PADDING_PX;
    return h;
  }, [yearOptions.length]);
  const spacerPx = (carOpen ? carMenuHeight : 0) || (yearOpen ? yearMenuHeight : 0);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border bg-white/80 p-8 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Feature tour</p>
        <h1 className="mt-2 text-3xl font-semibold">Explore the Fuel Dashboard experience</h1>
        <p className="mt-4 max-w-2xl text-neutral-600">
          This public page mirrors the authenticated dashboard so stakeholders can try the
          car selector, play with time filters, and see the charts update with curated demo
          data. All records below live in the repository, making the showcase deterministic
          and deploy-friendly.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {demoFeatureHighlights.map((feature) => (
            <Card key={feature.title} className="h-full border-neutral-200 bg-white p-5">
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{feature.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="space-y-6 border-neutral-200 bg-white p-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Interactive demo data</h2>
            <p className="text-sm text-neutral-500">
              Choose a vehicle, switch the timeline granularity, or focus on a specific year
              to see how the dashboard reacts.
            </p>
          </div>
          <div className="text-sm text-neutral-500">
            {activeCar ? `${activeCar.brand} ${activeCar.model}`.trim() : "All cars"} ·{" "}
            {selectionSummary}
          </div>
        </header>

        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="w-full md:max-w-xs">
            <label className="mb-1 block text-sm font-medium">Car</label>
            <Select value={carId} onValueChange={setCarId} open={carOpen} onOpenChange={setCarOpen}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a car" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className="z-50">
                {demoCars.map((car) => (
                  <SelectItem key={car.$id} value={car.$id}>
                    {[car.brand, car.model].filter(Boolean).join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Timeline granularity</label>
            <Tabs
              value={granularity}
              onValueChange={(value) =>
                setGranularity(value === "year" ? "year" : "month")
              }
            >
              <TabsList className="rounded-lg border p-1">
                <TabsTrigger
                  value="month"
                  className="rounded-md px-3 py-1.5 data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  Per month
                </TabsTrigger>
                <TabsTrigger
                  value="year"
                  className="rounded-md px-3 py-1.5 data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  Per year
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="w-full md:max-w-[12rem]">
            <label className="mb-1 block text-sm font-medium">Year</label>
            <Select
              value={String(year)}
              onValueChange={(value) => setYear(value === "all" ? "all" : Number(value))}
              open={yearOpen}
              onOpenChange={setYearOpen}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className="z-50">
                <SelectItem value="all">All years</SelectItem>
                {yearOptions.map((yr) => (
                  <SelectItem key={yr} value={String(yr)}>
                    {yr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div
          className="transition-[height] duration-150"
          style={{ height: spacerPx ? `${spacerPx + 8}px` : 0 }}
        />

        {!activeLogs.length ? (
          <p className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-500">
            No demo logs match this selection. Choose another car or year to continue.
          </p>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              <Card className="border-neutral-200 bg-neutral-50 p-4">
                <div className="text-sm text-neutral-500">Total spend</div>
                <div className="text-2xl font-semibold">{fmtEUR(stats.total)}</div>
              </Card>
              <Card className="border-neutral-200 bg-neutral-50 p-4">
                <div className="text-sm text-neutral-500">Avg. price / L</div>
                <div className="text-2xl font-semibold">
                  {stats.ppl ? `${stats.ppl.toFixed(3)} €/L` : "—"}
                </div>
              </Card>
              <Card className="border-neutral-200 bg-neutral-50 p-4">
                <div className="text-sm text-neutral-500">Avg. liters / fill</div>
                <div className="text-2xl font-semibold">
                  {stats.liters ? `${stats.liters.toFixed(1)} L` : "—"}
                </div>
              </Card>
            </section>

            <Card className="border-neutral-200 p-4">
              <h3 className="mb-3 text-lg font-medium">Price per liter over time</h3>
              <PricePerLiterChart logs={activeLogs} />
            </Card>

            <Card className="border-neutral-200 p-4">
              <h3 className="mb-3 text-lg font-medium">
                Spend per {granularity === "month" ? "month" : "year"}
              </h3>
              <SpendChart logs={activeLogs} mode={granularity} />
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}
