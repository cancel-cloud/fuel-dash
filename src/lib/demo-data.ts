import type { Car, FuelLog } from "./types";

const DEMO_DB_ID = "demo-db";
const DEMO_CARS_COLLECTION = "demo-cars";
const DEMO_LOGS_COLLECTION = "demo-fuel-logs";

const baseMeta = (collectionId: string, sequence: number, iso: string) => ({
  $id: `${collectionId}-${sequence}`,
  $sequence: sequence,
  $collectionId: collectionId,
  $databaseId: DEMO_DB_ID,
  $createdAt: iso,
  $updatedAt: iso,
  $permissions: [] as string[],
});

export const demoCars: Car[] = [
  {
    ...baseMeta(DEMO_CARS_COLLECTION, 1, "2024-01-01T09:00:00.000Z"),
    brand: "Audi",
    model: "A4 Avant",
  },
  {
    ...baseMeta(DEMO_CARS_COLLECTION, 2, "2024-01-01T09:05:00.000Z"),
    brand: "Volkswagen",
    model: "Golf TDI",
  },
  {
    ...baseMeta(DEMO_CARS_COLLECTION, 3, "2024-01-01T09:10:00.000Z"),
    brand: "Škoda",
    model: "Octavia Combi",
  },
] as Car[];

export const demoFuelLogs: FuelLog[] = [
  {
    ...baseMeta(DEMO_LOGS_COLLECTION, 1, "2023-09-15T07:32:00.000Z"),
    carId: demoCars[2].$id,
    date: "2023-09-14T00:00:00.000Z",
    liters: 50.2,
    pricePerLiter: 1.55,
    priceTotal: 77.81,
    stationName: "OMV Praha",
    currency: "EUR",
    aiParsed: true,
  },
  {
    ...baseMeta(DEMO_LOGS_COLLECTION, 2, "2023-10-03T17:21:00.000Z"),
    carId: demoCars[1].$id,
    date: "2023-10-02T00:00:00.000Z",
    liters: 47.8,
    pricePerLiter: 1.59,
    priceTotal: 76.00,
    stationName: "Aral Hamburg",
    currency: "EUR",
    aiParsed: true,
  },
  {
    ...baseMeta(DEMO_LOGS_COLLECTION, 3, "2023-11-12T11:14:00.000Z"),
    carId: demoCars[0].$id,
    date: "2023-11-11T00:00:00.000Z",
    liters: 42.6,
    pricePerLiter: 1.72,
    priceTotal: 73.27,
    stationName: "Shell München",
    currency: "EUR",
    aiParsed: true,
  },
  {
    ...baseMeta(DEMO_LOGS_COLLECTION, 4, "2024-01-22T08:03:00.000Z"),
    carId: demoCars[1].$id,
    date: "2024-01-21T00:00:00.000Z",
    liters: 46.9,
    pricePerLiter: 1.63,
    priceTotal: 76.45,
    stationName: "TotalEnergies Bremen",
    currency: "EUR",
    aiParsed: true,
  },
  {
    ...baseMeta(DEMO_LOGS_COLLECTION, 5, "2024-02-18T18:42:00.000Z"),
    carId: demoCars[0].$id,
    date: "2024-02-17T00:00:00.000Z",
    liters: 45.8,
    pricePerLiter: 1.68,
    priceTotal: 76.94,
    stationName: "Jet Nürnberg",
    currency: "EUR",
    aiParsed: true,
  },
  {
    ...baseMeta(DEMO_LOGS_COLLECTION, 6, "2024-03-08T06:55:00.000Z"),
    carId: demoCars[2].$id,
    date: "2024-03-07T00:00:00.000Z",
    liters: 51.6,
    pricePerLiter: 1.61,
    priceTotal: 83.08,
    stationName: "MOL Brno",
    currency: "EUR",
    aiParsed: true,
  },
  {
    ...baseMeta(DEMO_LOGS_COLLECTION, 7, "2024-04-02T15:11:00.000Z"),
    carId: demoCars[1].$id,
    date: "2024-04-01T00:00:00.000Z",
    liters: 45.1,
    pricePerLiter: 1.58,
    priceTotal: 71.26,
    stationName: "Q1 Hannover",
    currency: "EUR",
    aiParsed: true,
  },
  {
    ...baseMeta(DEMO_LOGS_COLLECTION, 8, "2024-05-10T12:47:00.000Z"),
    carId: demoCars[0].$id,
    date: "2024-05-09T00:00:00.000Z",
    liters: 43.4,
    pricePerLiter: 1.65,
    priceTotal: 71.61,
    stationName: "Esso Stuttgart",
    currency: "EUR",
    aiParsed: true,
  },
  {
    ...baseMeta(DEMO_LOGS_COLLECTION, 9, "2024-06-09T09:18:00.000Z"),
    carId: demoCars[2].$id,
    date: "2024-06-08T00:00:00.000Z",
    liters: 49.5,
    pricePerLiter: 1.57,
    priceTotal: 77.82,
    stationName: "OMV Wien",
    currency: "EUR",
    aiParsed: true,
  },
] as FuelLog[];

export const demoFeatureHighlights = [
  {
    title: "Car-centric insights",
    body: "Switch between demo vehicles to see how spend summaries and charts update instantly.",
  },
  {
    title: "Flexible time filters",
    body: "Pick individual years or view the full history to compare seasonality in spending.",
  },
  {
    title: "Rich visualizations",
    body: "Line and bar charts mirror the authenticated dashboard so stakeholders see the full experience.",
  },
] as const;
