import { getGoogleGeocodingApiKey } from "@/lib/roof-measure/server-env";
import type { GeocodedAddress } from "@/types/roof-measure";

interface GoogleGeocodeComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodeResult {
  formatted_address: string;
  place_id: string;
  address_components: GoogleGeocodeComponent[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport?: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
}

interface GoogleGeocodeResponse {
  status: string;
  error_message?: string;
  results: GoogleGeocodeResult[];
}

function findComponent(components: GoogleGeocodeComponent[], type: string) {
  return components.find((component) => component.types.includes(type));
}

export class GoogleGeocodeService {
  async geocodeAddress(address: string): Promise<GeocodedAddress> {
    const apiKey = getGoogleGeocodingApiKey();
    const response = await fetch(
      "https://maps.googleapis.com/maps/api/geocode/json" +
        `?address=${encodeURIComponent(address)}` +
        `&key=${encodeURIComponent(apiKey)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Google Geocoding API request failed.");
    }

    const payload = (await response.json()) as GoogleGeocodeResponse;

    if (payload.status !== "OK" || payload.results.length === 0) {
      throw new Error(payload.error_message ?? "Address could not be geocoded.");
    }

    const firstResult = payload.results[0];
    const streetNumber = findComponent(firstResult.address_components, "street_number");
    const route = findComponent(firstResult.address_components, "route");
    const locality =
      findComponent(firstResult.address_components, "locality") ??
      findComponent(firstResult.address_components, "postal_town") ??
      findComponent(firstResult.address_components, "sublocality_level_1");
    const state = findComponent(
      firstResult.address_components,
      "administrative_area_level_1",
    );
    const postalCode = findComponent(firstResult.address_components, "postal_code");
    const country = findComponent(firstResult.address_components, "country");

    return {
      formattedAddress: firstResult.formatted_address,
      street: [streetNumber?.long_name, route?.long_name].filter(Boolean).join(" ") || null,
      city: locality?.long_name ?? null,
      state: state?.short_name ?? null,
      postalCode: postalCode?.long_name ?? null,
      country: country?.short_name ?? null,
      lat: firstResult.geometry.location.lat,
      lng: firstResult.geometry.location.lng,
      placeId: firstResult.place_id,
      geocodeProvider: "google",
      viewport: firstResult.geometry.viewport
        ? {
            northeast: firstResult.geometry.viewport.northeast,
            southwest: firstResult.geometry.viewport.southwest,
          }
        : null,
    };
  }
}
