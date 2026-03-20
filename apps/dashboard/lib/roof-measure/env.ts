import { resolveAppUrl } from "@/lib/utils/app-url";

export const roofMeasurePublicEnv = {
  appUrl: resolveAppUrl(),
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  googleMapsMapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "",
};
