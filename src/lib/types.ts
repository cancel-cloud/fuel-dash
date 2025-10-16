export type FuelLog = {
    $id: string;
    carId: string;
    date: string; // ISO
    liters: number | null;
    pricePerLiter: number | null;
    priceTotal: number | null;
    stationName: string | null;
    receiptFileId: string | null;
    photoFileId?: string | null;
    aiParsed?: boolean;
    currency?: string | null;
    $createdAt: string;
    $updatedAt: string;
  };
  
  export type Car = {
    $id: string;
    brand: string;
    model: string;
    licensePlate?: string;
    tankSizeLiters?: number;
  };
  