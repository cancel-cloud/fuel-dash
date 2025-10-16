"use client";

import { useEffect, useMemo, useState } from "react";
import { db, Query } from "@/lib/appwrite";
import type { Car, FuelLog } from "@/lib/types";
import { unique } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Filters = { carId: string | null; granularity: "month" | "year"; year: number | "all" };
type Props = { onChange: (f: Filters) => void };

// Rough UI constants (shadcn/radix select item heights are ~36-40px)
const ITEM_PX = 40;
const PADDING_PX = 16;
const MAX_VISIBLE_ITEMS = 6; // if more, the menu scrolls
const MAX_MENU_PX = MAX_VISIBLE_ITEMS * ITEM_PX + PADDING_PX;

export default function FiltersBar({ onChange }: Props) {
  const [cars, setCars] = useState<Car[]>([]);
  const [carId, setCarId] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<"month" | "year">("month");
  const [year, setYear] = useState<number | "all">("all");
  const [yearOptions, setYearOptions] = useState<number[]>([]);

  // controlled open states for dynamic spacer
  const [carOpen, setCarOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  useEffect(() => {
    (async () => {
      // Try Cars collection
      const carsRes = await db
        .listDocuments(
          process.env.NEXT_PUBLIC_DB_ID!,
          process.env.NEXT_PUBLIC_CARS_ID!,
          [Query.limit(200)]
        )
        .catch(() => null);

      const carDocs = (carsRes?.documents ?? []) as Car[];

      // Load fuel logs to derive years and fallback car IDs
      const logsRes = await db
        .listDocuments(
          process.env.NEXT_PUBLIC_DB_ID!,
          process.env.NEXT_PUBLIC_FUELLOGS_ID!,
          [Query.orderDesc("date"), Query.limit(500)]
        )
        .catch(() => null);

      const logs = (logsRes?.documents ?? []) as FuelLog[];
      const years = unique(
        logs.map((l) => new Date(l.date || l.$createdAt).getUTCFullYear())
      ).sort((a, b) => a - b);
      setYearOptions(years);

      // default year (prefer current if present)
      const nowYear = new Date().getUTCFullYear();
      setYear(years.includes(nowYear) ? nowYear : "all");

      // cars: prefer Cars collection; else fallback to distinct carIds from logs
      if (carDocs.length) {
        setCars(carDocs);
        setCarId(carDocs[0].$id ?? null);
      } else {
        const ids = unique(logs.map((l) => l.carId).filter(Boolean) as string[]);
        setCars(ids.map((id) => ({ $id: id, brand: "", model: id } as any)));
        if (ids.length) setCarId(ids[0]);
      }
    })().catch(console.error);
  }, []);

  useEffect(() => onChange({ carId, granularity, year }), [carId, granularity, year, onChange]);

  // Clean label: brand + model; fallback to $id (no "Car " prefix)
  const labelFor = (c: Car) => {
    const label = [c.brand, c.model].filter(Boolean).join(" ").trim();
    return label || c.$id;
  };

  // --- Dynamic spacer height while dropdown(s) are open ---
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
            {/* popper + offset, high z-index so it paints above */}
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
          <Tabs value={granularity} onValueChange={(v) => setGranularity(v as any)}>
            <TabsList className="border rounded-lg p-1">
              <TabsTrigger
                value="month"
                className="px-3 py-1.5 data-[state=active]:bg-black data-[state=active]:text-white rounded-md"
              >
                Per Month
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="px-3 py-1.5 data-[state=active]:bg-black data-[state=active]:text-white rounded-md"
              >
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

      {/* Spacer appears ONLY while a dropdown is open; smooth height transition */}
      <div
        className="transition-[height] duration-150"
        style={{ height: spacerPx ? `${spacerPx + 8}px` : 0 }}
      />
    </>
  );
}
