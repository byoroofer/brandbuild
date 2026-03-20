import type { LatLng, MapViewport } from "@/types/geometry";

export type MeasurementMethod = "manual" | "assisted" | "auto";
export type MeasurementPersistenceMode = "supabase" | "local";

export interface GeocodedAddress {
  formattedAddress: string;
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  lat: number;
  lng: number;
  placeId: string;
  geocodeProvider: "google";
  viewport: MapViewport | null;
}

export interface StructureDraft {
  label?: string;
  polygonPoints: LatLng[];
  method: MeasurementMethod;
  confidence?: number | null;
  userAdjusted?: boolean;
}

export interface StructureMeasurement {
  structureId: string;
  label: string;
  polygonPoints: LatLng[];
  areaSqft: number;
  perimeterFt: number;
  centroid: LatLng;
  method: MeasurementMethod;
  confidence: number | null;
  userAdjusted: boolean;
}

export interface MeasurementJob {
  id: string;
  address: GeocodedAddress;
  status: "completed";
  source: MeasurementMethod;
  primaryStructureCount: number;
  detachedStructureCount: number;
  totalAreaSqft: number;
  totalPerimeterFt: number;
  notes: string | null;
  structures: StructureMeasurement[];
  createdAt: string;
  updatedAt: string;
  persistenceMode: MeasurementPersistenceMode;
}

export interface SaveMeasurementRequest {
  address: GeocodedAddress;
  structures: StructureDraft[];
  notes?: string | null;
  organizationId?: string | null;
  userId?: string | null;
}

export interface MeasurementSaveResponse {
  measurementJob: MeasurementJob;
  persistenceMode: MeasurementPersistenceMode;
  warning?: string;
}
