let googleMapsPromise: Promise<any> | null = null;

declare global {
  interface Window {
    __roofMeasureGoogleMapsInit?: () => void;
    google?: any;
  }
}

const SCRIPT_ID = "roof-measure-google-maps-script";

export function loadGoogleMapsApi(apiKey: string): Promise<any> {
  if (!apiKey) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured."),
    );
  }

  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise<any>((resolve, reject) => {
    const cleanup = () => {
      delete window.__roofMeasureGoogleMapsInit;
    };

    window.__roofMeasureGoogleMapsInit = () => {
      cleanup();

      if (window.google?.maps) {
        resolve(window.google);
        return;
      }

      googleMapsPromise = null;
      reject(new Error("Google Maps loaded without a usable API object."));
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener(
        "error",
        () => {
          googleMapsPromise = null;
          cleanup();
          reject(new Error("Unable to load Google Maps script."));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      googleMapsPromise = null;
      cleanup();
      reject(new Error("Unable to load Google Maps script."));
    };
    script.src =
      "https://maps.googleapis.com/maps/api/js" +
      `?key=${encodeURIComponent(apiKey)}` +
      "&v=weekly" +
      "&callback=__roofMeasureGoogleMapsInit";

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
