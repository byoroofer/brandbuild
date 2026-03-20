import { z } from "zod";

const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const viewportSchema = z.object({
  northeast: latLngSchema,
  southwest: latLngSchema,
});

const geocodedAddressSchema = z.object({
  formattedAddress: z.string().min(3),
  street: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  placeId: z.string().min(1),
  geocodeProvider: z.literal("google"),
  viewport: viewportSchema.nullable(),
});

const structureDraftSchema = z.object({
  label: z.string().trim().max(120).optional(),
  polygonPoints: z.array(latLngSchema).min(3),
  method: z.enum(["manual", "assisted", "auto"]),
  confidence: z.number().min(0).max(1).nullable().optional(),
  userAdjusted: z.boolean().optional(),
});

export const geocodeRequestSchema = z.object({
  address: z.string().trim().min(5).max(250),
});

export const saveMeasurementRequestSchema = z.object({
  address: geocodedAddressSchema,
  structures: z.array(structureDraftSchema).min(1),
  notes: z.string().trim().max(1_000).nullable().optional(),
  organizationId: z.string().uuid().nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
});
