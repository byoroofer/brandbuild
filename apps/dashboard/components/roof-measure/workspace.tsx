"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Panel } from "@/components/studio/panel";
import { Button } from "@/components/ui/button";
import { roofMeasurePublicEnv } from "@/lib/roof-measure/env";
import { loadGoogleMapsApi } from "@/lib/roof-measure/google/maps-loader";
import { formatNumber } from "@/lib/roof-measure/utils";
import { derivePolygonMetrics } from "@/services/roof-measure/measurement/polygon-math";
import type { LatLng } from "@/types/geometry";
import type { GeocodedAddress, MeasurementSaveResponse } from "@/types/roof-measure";

function readPath(path: any): LatLng[] {
  return path.getArray().map((point: any) => ({
    lat: point.lat(),
    lng: point.lng(),
  }));
}

export function RoofMeasureWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressFromQuery = searchParams.get("address") ?? "";

  const [addressInput, setAddressInput] = useState(addressFromQuery);
  const [addressResult, setAddressResult] = useState<GeocodedAddress | null>(null);
  const [structurePin, setStructurePin] = useState<LatLng | null>(null);
  const [isSelectingStructure, setIsSelectingStructure] = useState(false);
  const [points, setPoints] = useState<LatLng[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userAdjusted, setUserAdjusted] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const lastRequestedAddress = useRef("");
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapClickListenerRef = useRef<any>(null);
  const pathListenersRef = useRef<any[]>([]);

  useEffect(() => {
    setAddressInput(addressFromQuery);
  }, [addressFromQuery]);

  useEffect(() => {
    if (!addressFromQuery || addressFromQuery === lastRequestedAddress.current) {
      return;
    }

    lastRequestedAddress.current = addressFromQuery;
    void geocodePropertyAddress(addressFromQuery);
  }, [addressFromQuery]);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      if (!addressResult || !mapNodeRef.current) {
        return;
      }

      if (!roofMeasurePublicEnv.googleMapsApiKey) {
        setMapError("Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to render the map.");
        return;
      }

      try {
        const googleApi = await loadGoogleMapsApi(roofMeasurePublicEnv.googleMapsApiKey);

        if (cancelled) {
          return;
        }

        setMapError(null);

        if (!mapRef.current) {
          mapRef.current = new googleApi.maps.Map(mapNodeRef.current, {
            center: { lat: addressResult.lat, lng: addressResult.lng },
            zoom: 20,
            mapTypeId: "satellite",
            disableDefaultUI: true,
            clickableIcons: false,
            gestureHandling: "greedy",
            mapId: roofMeasurePublicEnv.googleMapsMapId || undefined,
          });
        }

        if (!polygonRef.current) {
          polygonRef.current = new googleApi.maps.Polygon({
            map: mapRef.current,
            editable: true,
            strokeColor: "#22c55e",
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: "#22c55e",
            fillOpacity: 0.18,
          });
        }

        if (!polylineRef.current) {
          polylineRef.current = new googleApi.maps.Polyline({
            map: mapRef.current,
            strokeColor: "#f59e0b",
            strokeOpacity: 1,
            strokeWeight: 2,
          });
        }

        if (!markerRef.current) {
          markerRef.current = new googleApi.maps.Marker({
            map: mapRef.current,
            clickable: false,
            visible: false,
          });
        }

        if (addressResult.viewport) {
          const bounds = new googleApi.maps.LatLngBounds(
            addressResult.viewport.southwest,
            addressResult.viewport.northeast,
          );
          mapRef.current.fitBounds(bounds, 60);
        } else {
          mapRef.current.panTo({ lat: addressResult.lat, lng: addressResult.lng });
          mapRef.current.setZoom(20);
        }
      } catch (error) {
        setMapError(
          error instanceof Error ? error.message : "Unable to initialize Google Maps.",
        );
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;
    };
  }, [addressResult]);

  useEffect(() => {
    if (!markerRef.current) {
      return;
    }

    if (!structurePin) {
      markerRef.current.setVisible(false);
      return;
    }

    markerRef.current.setPosition(structurePin);
    markerRef.current.setVisible(true);
  }, [structurePin]);

  useEffect(() => {
    if (!polylineRef.current || !polygonRef.current) {
      return;
    }

    polylineRef.current.setPath(points);
    polylineRef.current.setVisible(points.length > 0 && points.length < 3);

    polygonRef.current.setPath(points);
    polygonRef.current.setVisible(points.length >= 3);
    polygonRef.current.setEditable(points.length >= 3);

    pathListenersRef.current.forEach((listener) => listener.remove?.());
    pathListenersRef.current = [];

    if (points.length < 3) {
      return;
    }

    const path = polygonRef.current.getPath();
    pathListenersRef.current = [
      path.addListener("insert_at", () => {
        setUserAdjusted(true);
        setPoints(readPath(path));
      }),
      path.addListener("remove_at", () => {
        setUserAdjusted(true);
        setPoints(readPath(path));
      }),
      path.addListener("set_at", () => {
        setUserAdjusted(true);
        setPoints(readPath(path));
      }),
    ];

    return () => {
      pathListenersRef.current.forEach((listener) => listener.remove?.());
      pathListenersRef.current = [];
    };
  }, [points]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.setOptions({
      draggableCursor: isSelectingStructure || isDrawing ? "crosshair" : undefined,
    });

    mapClickListenerRef.current?.remove?.();
    mapClickListenerRef.current = null;

    if (!isSelectingStructure && !isDrawing) {
      return;
    }

    mapClickListenerRef.current = mapRef.current.addListener("click", (event: any) => {
      if (!event.latLng) {
        return;
      }

      const clickedPoint = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };

      if (isSelectingStructure) {
        setStructurePin(clickedPoint);
        setIsSelectingStructure(false);
        setIsDrawing(false);
        setStatusMessage(
          "Structure confirmed. Click Start outline, then trace the roof perimeter.",
        );
        return;
      }

      if (!isDrawing) {
        return;
      }

      setPoints((currentPoints) => [...currentPoints, clickedPoint]);
    });

    return () => {
      mapClickListenerRef.current?.remove?.();
      mapClickListenerRef.current = null;
    };
  }, [isDrawing, isSelectingStructure]);

  const metrics = useMemo(() => {
    if (points.length < 3) {
      return null;
    }

    return derivePolygonMetrics(points);
  }, [points]);

  async function geocodePropertyAddress(address: string) {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      return;
    }

    setIsGeocoding(true);
    setErrorMessage(null);
    setStatusMessage("Looking up address and centering imagery.");

    try {
      const response = await fetch("/api/roof-measure/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: trimmedAddress,
        }),
      });

      const payload = (await response.json()) as {
        address?: GeocodedAddress;
        error?: string;
      };

      if (!response.ok || !payload.address) {
        throw new Error(payload.error ?? "Unable to geocode address.");
      }

      setAddressResult(payload.address);
      setStructurePin(null);
      setPoints([]);
      setUserAdjusted(false);
      setIsSelectingStructure(true);
      setIsDrawing(false);
      setStatusMessage("Drop a pin on the structure you want measured.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to geocode address.");
      setStatusMessage(null);
    } finally {
      setIsGeocoding(false);
    }
  }

  async function handleLookupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedAddress = addressInput.trim();

    if (!trimmedAddress) {
      return;
    }

    router.replace(`/roof-measure/measure?address=${encodeURIComponent(trimmedAddress)}`);
    lastRequestedAddress.current = trimmedAddress;
    await geocodePropertyAddress(trimmedAddress);
  }

  async function handleSaveMeasurement() {
    if (!addressResult || !structurePin || !metrics || points.length < 3) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage("Saving roof measurement.");

    try {
      const response = await fetch("/api/roof-measure/measurements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: addressResult,
          structures: [
            {
              label: "Primary roof",
              polygonPoints: points,
              method: "manual",
              userAdjusted,
            },
          ],
        }),
      });

      const payload = (await response.json()) as
        | MeasurementSaveResponse
        | {
            error?: string;
          };

      if (!response.ok || !("measurementJob" in payload)) {
        const message = "error" in payload ? payload.error : "Unable to save measurement.";
        throw new Error(message ?? "Unable to save measurement.");
      }

      if (payload.persistenceMode === "local") {
        window.localStorage.setItem(
          "leo:last-measurement",
          JSON.stringify(payload.measurementJob),
        );
        router.push("/roof-measure/results?source=local");
        return;
      }

      router.push(`/roof-measure/results/${payload.measurementJob.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save measurement.");
      setStatusMessage(null);
    } finally {
      setIsSaving(false);
    }
  }

  function handleResetOutline() {
    setPoints([]);
    setUserAdjusted(false);
    setIsDrawing(false);
    setStatusMessage(
      structurePin
        ? "Structure confirmed. Click Start outline, then trace the roof perimeter."
        : "Drop a pin on the structure you want measured.",
    );
  }

  function handleCenterMap() {
    if (!mapRef.current || !addressResult) {
      return;
    }

    mapRef.current.panTo({
      lat: addressResult.lat,
      lng: addressResult.lng,
    });
    mapRef.current.setZoom(20);
  }

  function handleSelectStructure() {
    setIsSelectingStructure(true);
    setIsDrawing(false);
    setStatusMessage("Drop a pin on the structure you want measured.");
  }

  function handleStartOutline() {
    if (!structurePin) {
      setErrorMessage("Drop a pin on the target structure before tracing the roof.");
      return;
    }

    setErrorMessage(null);
    setIsSelectingStructure(false);
    setIsDrawing(true);
    setStatusMessage("Click around the roof edge to trace the outline.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,420px)]">
      <div className="space-y-6">
        <Panel className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Address lookup</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Enter the property address, load imagery, confirm the structure with a drop
                pin, then trace the roof outline.
              </p>
            </div>
            <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleLookupSubmit}>
              <input
                aria-label="Property address"
                className="w-full rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
                onChange={(event) => setAddressInput(event.target.value)}
                placeholder="Enter a property address"
                value={addressInput}
              />
              <Button size="lg" type="submit" variant="secondary" disabled={isGeocoding}>
                {isGeocoding ? "Finding address..." : "Load imagery"}
              </Button>
            </form>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-white/8 bg-black/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Roof measure workspace</p>
              <p className="text-sm text-slate-400">
                Confirm the structure first, then outline the roof footprint.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSelectStructure} variant="ghost">
                {structurePin ? "Move pin" : "Drop pin"}
              </Button>
              <Button
                onClick={handleStartOutline}
                variant={isDrawing ? "secondary" : "primary"}
              >
                {isDrawing ? "Adding points" : "Start outline"}
              </Button>
              <Button onClick={handleCenterMap} variant="ghost">
                Recenter
              </Button>
              <Button onClick={handleResetOutline} variant="ghost">
                Reset
              </Button>
            </div>
          </div>

          <div
            className="h-[560px] w-full bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),transparent_38%),linear-gradient(180deg,rgba(7,11,24,0.84)_0%,rgba(10,15,31,0.96)_100%)]"
            ref={mapNodeRef}
          />

          <div className="border-t border-white/8 px-5 py-4 text-sm text-slate-300">
            {mapError ? (
              <p className="text-rose-300">{mapError}</p>
            ) : (
              <p>
                Step 1: drop a pin on the correct structure. Step 2: click Start outline and
                trace the roof edge. Step 3: drag vertices to fine-tune the footprint.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Measurement summary</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                MVP output returns footprint area and perimeter only.
              </p>
            </div>

            {addressResult ? (
              <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
                <p className="text-sm font-semibold text-white">
                  {addressResult.formattedAddress}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {addressResult.lat.toFixed(6)}, {addressResult.lng.toFixed(6)}
                </p>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-black/10 p-4 text-sm text-slate-400">
                Load an address to start the roof measurement flow.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
                <p className="text-sm text-slate-400">Area</p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {metrics ? `${formatNumber(metrics.areaSqFt)} sq ft` : "--"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
                <p className="text-sm text-slate-400">Perimeter</p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {metrics ? `${formatNumber(metrics.perimeterFt)} ft` : "--"}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-black/14 p-4 text-sm text-slate-300">
              <p>Structure pin: {structurePin ? "Confirmed" : "Not confirmed yet"}</p>
              <p>Outline points: {points.length}</p>
              <p>User adjusted: {userAdjusted ? "Yes" : "No"}</p>
              <p>Method: Manual</p>
            </div>

            {statusMessage ? (
              <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {statusMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {errorMessage}
              </div>
            ) : null}

            <Button
              className="w-full"
              disabled={!addressResult || !structurePin || !metrics || isSaving}
              onClick={() => void handleSaveMeasurement()}
              size="lg"
            >
              {isSaving ? "Saving..." : "Save roof measurement"}
            </Button>

            <p className="text-xs leading-6 text-slate-500">
              Measurements are derived from aerial or satellite imagery and user input.
              Results are fast estimates and may require field verification. They are not
              substitutes for on-site inspection or professional estimating.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
