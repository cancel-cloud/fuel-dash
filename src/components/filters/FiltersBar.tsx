"use client";

import { useEffect, useMemo, useState } from "react";
import { db, Query } from "@/lib/appwrite";
import type { Car, FuelLog } from "@/lib/types";
import { unique } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Granularity = "month" | "year";
type Filters = { carId: string | null; granularity: Granularity; year: number | "all" };
type Props = { onChange: (f: Filters) => void };

const ITEM_PX = 40;
const PADDING_PX = 16;
const MAX_VISIBLE_ITEMS = 6;
const MAX_MENU_PX = MAX_VISIBLE_ITEMS * ITEM_PX + PADDING_PX;

export default function FiltersBar({ onChange }: Props) {
  const [cars, setCars] = useState<Car[]>([]);
  const [carId, setCarId] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [year, setYear] = useState<number | "all">("all");
  const [yearOptions, setYearOptions] = useState<number[]>([]);

  const [carOpen, setCarOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const dbId = process.env.NEXT_PUBLIC_DB_ID!;
      const carsCol = process.env.NEXT_PUBLIC_CARS_ID!;
      const logsCol = process.env.NEXT_PUBLIC_FUELLOGS_ID!;

      // Fetch Cars (typed) — ignore failure gracefully
      let carDocs: Car[] = [];
      try {
        const carsRes = await db.listDocuments<Car>(dbId, carsCol, [Query.limit(200)]);
        carDocs = carsRes.documents;
      } catch {
        carDocs = [];
      }

      // Fetch Logs (typed) — used for year options and fallback carIds
      let logs: FuelLog[] = [];
      try {
        const logsRes = await db.listDocuments<FuelLog>(
          dbId,
          logsCol,
          [Query.orderDesc("date"), Query.limit(500)]
        );
        logs = logsRes.documents;
      } catch {
        logs = [];
      }

      // Derive year options from logs
      const years = unique(
        logs.map((l) => new Date(l.date || l.$createdAt).getUTCFullYear())
      ).sort((a, b) => a - b);
      setYearOptions(years);

      const nowYear = new Date().getUTCFullYear();
      setYear(years.includes(nowYear) ? nowYear : "all");

      // Prefer Cars collection; fallback to distinct carIds in logs
      if (carDocs.length > 0) {
        setCars(carDocs);
        setCarId(carDocs[0]?.$id ?? null);
      } else {
        const ids = unique(logs.map((l) => l.carId).filter(Boolean) as string[]);
        const fallback: Car[] = ids.map((id) => ({ $id: id, brand: "", model: id } as Car));
        setCars(fallback);
        if (ids.length) setCarId(ids[0]);
      }
    })().catch(console.error);
  }, []);

  useEffect(() => onChange({ carId, granularity, year }), [carId, granularity, year, onChange]);

  const labelFor = (c: Car) => {
    const label = [c.brand, c.model].filter(Boolean).join(" ").trim();
    return label || c.$id;
  };

  const carMenuHeight = useMemo(() => {
    const count = cars.length || 1;
    const h = Math.min(count, MAX_VISIBLE_ITEMS) * ITEM_PX + PADDING_PX;
    return Math.min(h, MAX_MENU_PX);
  }, [cars.length]);

  const yearMenuHeight = useMemo(() => {
    const count = yearOptions.length || 1;
    const h = Math.min(count, MAX_VISIBLE_ITEMS) * ITEM_PX + PADDING_PX;
    return Math.min(h, MAX_MENU_PX);
  }, [yearOptions.length]);

  const spacerPx = (carOpen ? carMenuHeight : 0) || (yearOpen ? yearMenuHeight : 0);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
        {/* Car */}
        <div className="w-full md:w-64">
          <label className="text-sm block mb-1">Car</label>
          <Select
            value={carId ?? ""}
            onValueChange={(v) => setCarId(v || null)}
            open={carOpen}
            onOpenChange={setCarOpen}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select car" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={8} className="z-50">
              {cars.map((c) => (
                <SelectItem key={c.$id} value={c.$id}>
                  {labelFor(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Granularity */}
        <div>
          <label className="text-sm block mb-1">Granularity</label>
          <Tabs value={granularity} onValueChange={(v) => setGranularity(v === "year" ? "year" : "month")}>
            <TabsList className="border rounded-lg p-1">
              <TabsTrigger value="month" className="px-3 py-1.5 data-[state=active]:bg-black data-[state=active]:text-white rounded-md">
                Per Month
              </TabsTrigger>
              <TabsTrigger value="year" className="px-3 py-1.5 data-[state=active]:bg-black data-[state=active]:text-white rounded-md">
                Per Year
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Year */}
        <div className="w-full md:w-48">
          <label className="text-sm block mb-1">Year</label>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(v === "all" ? "all" : Number(v))}
            open={yearOpen}
            onOpenChange={setYearOpen}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={8} className="z-50">
              <SelectItem value="all">All</SelectItem>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* dynamic spacer only while a dropdown is open */}
      <div className="transition-[height] duration-150" style={{ height: spacerPx ? `${spacerPx + 8}px` : 0 }} />
    </>
  );
}
