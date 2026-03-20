import { derivePolygonMetrics } from "@/services/roof-measure/measurement/polygon-math";
import type {
  MeasurementJob,
  MeasurementPersistenceMode,
  SaveMeasurementRequest,
  StructureMeasurement,
} from "@/types/roof-measure";

function round(value: number, precision = 2) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

export function buildMeasurementJob(
  input: SaveMeasurementRequest,
  persistenceMode: MeasurementPersistenceMode,
  id = crypto.randomUUID(),
  createdAt = new Date().toISOString(),
  updatedAt = createdAt,
): MeasurementJob {
  const structures: StructureMeasurement[] = input.structures.map((structure, index) => {
    const metrics = derivePolygonMetrics(structure.polygonPoints);

    return {
      structureId: crypto.randomUUID(),
      label: structure.label?.trim() || `Structure ${index + 1}`,
      polygonPoints: structure.polygonPoints,
      areaSqft: metrics.areaSqFt,
      perimeterFt: metrics.perimeterFt,
      centroid: metrics.centroid,
      method: structure.method,
      confidence: structure.confidence ?? null,
      userAdjusted: structure.userAdjusted ?? false,
    };
  });

  return {
    id,
    address: input.address,
    status: "completed",
    source: input.structures[0]?.method ?? "manual",
    primaryStructureCount: structures.length,
    detachedStructureCount: 0,
    totalAreaSqft: round(
      structures.reduce((total, structure) => total + structure.areaSqft, 0),
    ),
    totalPerimeterFt: round(
      structures.reduce((total, structure) => total + structure.perimeterFt, 0),
    ),
    notes: input.notes ?? null,
    structures,
    createdAt,
    updatedAt,
    persistenceMode,
  };
}
