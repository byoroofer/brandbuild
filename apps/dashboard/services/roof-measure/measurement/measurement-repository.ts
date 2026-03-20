import {
  hasRoofMeasurePersistenceConfig,
  isGuestModeEnabledOnServer,
} from "@/lib/roof-measure/server-env";
import { createRoofMeasureAdminClient } from "@/lib/roof-measure/supabase-admin";
import { buildMeasurementJob } from "@/services/roof-measure/measurement/measurement-service";
import { closePolygon } from "@/services/roof-measure/measurement/polygon-math";
import type {
  GeocodedAddress,
  MeasurementJob,
  MeasurementSaveResponse,
  SaveMeasurementRequest,
} from "@/types/roof-measure";

interface AddressRow {
  id: string;
  formatted_address: string;
  street: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  lat: number;
  lng: number;
  place_id: string;
  geocode_provider: "google";
}

interface MeasurementJobRow {
  id: string;
  address_id: string;
  status: "completed" | "draft" | "archived";
  source: "manual" | "assisted" | "auto";
  primary_structure_count: number;
  detached_structure_count: number;
  total_area_sqft: number;
  total_perimeter_ft: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface StructureRow {
  id: string;
  measurement_job_id: string;
  label: string;
  polygon_geojson: {
    type: "Polygon";
    coordinates: number[][][];
  };
  area_sqft: number;
  perimeter_ft: number;
  centroid_lat: number;
  centroid_lng: number;
  method: "manual" | "assisted" | "auto";
  confidence: number | null;
  user_adjusted: boolean;
  created_at: string;
}

function toAddressInsert(address: GeocodedAddress) {
  return {
    formatted_address: address.formattedAddress,
    street: address.street,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country,
    lat: address.lat,
    lng: address.lng,
    place_id: address.placeId,
    geocode_provider: address.geocodeProvider,
  };
}

function polygonToGeoJson(points: SaveMeasurementRequest["structures"][number]["polygonPoints"]) {
  const closedPolygon = closePolygon(points).map((point) => [point.lng, point.lat]);

  return {
    type: "Polygon" as const,
    coordinates: [closedPolygon],
  };
}

function geoJsonToPolygon(geoJson: StructureRow["polygon_geojson"]) {
  const ring = geoJson.coordinates[0] ?? [];

  return ring.slice(0, -1).map(([lng, lat]) => ({ lat, lng }));
}

function toMeasurementJob(
  jobRow: MeasurementJobRow,
  addressRow: AddressRow,
  structureRows: StructureRow[],
): MeasurementJob {
  return {
    id: jobRow.id,
    address: {
      formattedAddress: addressRow.formatted_address,
      street: addressRow.street,
      city: addressRow.city,
      state: addressRow.state,
      postalCode: addressRow.postal_code,
      country: addressRow.country,
      lat: addressRow.lat,
      lng: addressRow.lng,
      placeId: addressRow.place_id,
      geocodeProvider: addressRow.geocode_provider,
      viewport: null,
    },
    status: "completed",
    source: jobRow.source,
    primaryStructureCount: jobRow.primary_structure_count,
    detachedStructureCount: jobRow.detached_structure_count,
    totalAreaSqft: jobRow.total_area_sqft,
    totalPerimeterFt: jobRow.total_perimeter_ft,
    notes: jobRow.notes,
    createdAt: jobRow.created_at,
    updatedAt: jobRow.updated_at,
    persistenceMode: "supabase",
    structures: structureRows.map((structureRow) => ({
      structureId: structureRow.id,
      label: structureRow.label,
      polygonPoints: geoJsonToPolygon(structureRow.polygon_geojson),
      areaSqft: structureRow.area_sqft,
      perimeterFt: structureRow.perimeter_ft,
      centroid: {
        lat: structureRow.centroid_lat,
        lng: structureRow.centroid_lng,
      },
      method: structureRow.method,
      confidence: structureRow.confidence,
      userAdjusted: structureRow.user_adjusted,
    })),
  };
}

export async function saveMeasurementJob(
  input: SaveMeasurementRequest,
): Promise<MeasurementSaveResponse> {
  if (!hasRoofMeasurePersistenceConfig()) {
    if (!isGuestModeEnabledOnServer()) {
      throw new Error("Supabase is not configured and guest mode is disabled.");
    }

    return {
      measurementJob: buildMeasurementJob(input, "local"),
      persistenceMode: "local",
      warning:
        "Supabase is not configured. This result is returned for local guest storage only.",
    };
  }

  const supabase = createRoofMeasureAdminClient();
  const measurementJob = buildMeasurementJob(input, "supabase");

  const { data: addressRow, error: addressError } = await supabase
    .from("addresses")
    .upsert(toAddressInsert(input.address), { onConflict: "place_id" })
    .select("*")
    .single();

  if (addressError || !addressRow) {
    throw new Error("Unable to save the geocoded address.");
  }

  const { data: jobRow, error: jobError } = await supabase
    .from("measurement_jobs")
    .insert({
      organization_id: input.organizationId ?? null,
      user_id: input.userId ?? null,
      address_id: addressRow.id,
      status: measurementJob.status,
      source: measurementJob.source,
      primary_structure_count: measurementJob.primaryStructureCount,
      detached_structure_count: measurementJob.detachedStructureCount,
      total_area_sqft: measurementJob.totalAreaSqft,
      total_perimeter_ft: measurementJob.totalPerimeterFt,
      notes: measurementJob.notes,
    })
    .select("*")
    .single();

  if (jobError || !jobRow) {
    throw new Error("Unable to save the measurement job.");
  }

  const { data: structureRows, error: structureError } = await supabase
    .from("structures")
    .insert(
      measurementJob.structures.map((structure) => ({
        measurement_job_id: jobRow.id,
        label: structure.label,
        polygon_geojson: polygonToGeoJson(structure.polygonPoints),
        area_sqft: structure.areaSqft,
        perimeter_ft: structure.perimeterFt,
        centroid_lat: structure.centroid.lat,
        centroid_lng: structure.centroid.lng,
        method: structure.method,
        confidence: structure.confidence,
        user_adjusted: structure.userAdjusted,
      })),
    )
    .select("*");

  if (structureError || !structureRows) {
    throw new Error("Unable to save the measured structures.");
  }

  return {
    measurementJob: toMeasurementJob(
      jobRow as MeasurementJobRow,
      addressRow as AddressRow,
      structureRows as StructureRow[],
    ),
    persistenceMode: "supabase",
  };
}

export async function getMeasurementJobById(id: string): Promise<MeasurementJob | null> {
  if (!hasRoofMeasurePersistenceConfig()) {
    return null;
  }

  const supabase = createRoofMeasureAdminClient();

  const { data: jobRow, error: jobError } = await supabase
    .from("measurement_jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (jobError || !jobRow) {
    return null;
  }

  const { data: addressRow, error: addressError } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", jobRow.address_id)
    .single();

  if (addressError || !addressRow) {
    return null;
  }

  const { data: structureRows, error: structureError } = await supabase
    .from("structures")
    .select("*")
    .eq("measurement_job_id", jobRow.id)
    .order("created_at", { ascending: true });

  if (structureError || !structureRows) {
    return null;
  }

  return toMeasurementJob(
    jobRow as MeasurementJobRow,
    addressRow as AddressRow,
    structureRows as StructureRow[],
  );
}
