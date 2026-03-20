import { GoogleGeocodeService } from "@/services/roof-measure/geocode/google-geocode-service";

export async function geocodeAddress(address: string) {
  const geocodeService = new GoogleGeocodeService();
  return geocodeService.geocodeAddress(address);
}
