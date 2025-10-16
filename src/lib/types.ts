// src/lib/types.ts
import type { Models } from "appwrite";

// Common base is the Appwrite document meta fields ($id, $createdAt, etc.)
export type BaseDoc = Models.Document;

export type FuelLog = BaseDoc & {
  carId: string;
  date?: string;            // ISO string from your OCR/function
  liters?: number;
  pricePerLiter?: number;
  priceTotal?: number;
  stationName?: string;
  currency?: string;
  receiptFileId?: string;   // storage file id
  aiParsed?: boolean;
};

export type Car = BaseDoc & {
  brand: string;
  model: string;
};
