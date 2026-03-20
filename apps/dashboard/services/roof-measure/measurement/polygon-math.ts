import type { LatLng } from "@/types/geometry";

const EARTH_RADIUS_METERS = 6_378_137;
const FEET_PER_METER = 3.280839895;
const SQUARE_FEET_PER_SQUARE_METER = 10.76391041671;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function round(value: number, precision = 2) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

export function closePolygon(points: LatLng[]) {
  if (points.length === 0) {
    return [];
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (firstPoint.lat === lastPoint.lat && firstPoint.lng === lastPoint.lng) {
    return [...points];
  }

  return [...points, firstPoint];
}

function getAveragePoint(points: LatLng[]): LatLng {
  const totals = points.reduce(
    (accumulator, point) => ({
      lat: accumulator.lat + point.lat,
      lng: accumulator.lng + point.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: totals.lat / points.length,
    lng: totals.lng / points.length,
  };
}

function toLocalPoint(origin: LatLng, point: LatLng) {
  return {
    x:
      EARTH_RADIUS_METERS *
      toRadians(point.lng - origin.lng) *
      Math.cos(toRadians(origin.lat)),
    y: EARTH_RADIUS_METERS * toRadians(point.lat - origin.lat),
  };
}

function fromLocalPoint(origin: LatLng, point: { x: number; y: number }): LatLng {
  return {
    lat: origin.lat + (point.y / EARTH_RADIUS_METERS) * (180 / Math.PI),
    lng:
      origin.lng +
      (point.x / (EARTH_RADIUS_METERS * Math.cos(toRadians(origin.lat)))) *
        (180 / Math.PI),
  };
}

function getClosedPolygon(points: LatLng[]) {
  return closePolygon(points).filter(
    (point, index, allPoints) =>
      index === 0 ||
      point.lat !== allPoints[index - 1]?.lat ||
      point.lng !== allPoints[index - 1]?.lng,
  );
}

export function calculatePolygonAreaSquareMeters(points: LatLng[]) {
  const closedPolygon = getClosedPolygon(points);

  if (closedPolygon.length < 4) {
    return 0;
  }

  const origin = getAveragePoint(closedPolygon.slice(0, -1));
  const localPoints = closedPolygon.map((point) => toLocalPoint(origin, point));

  let twiceArea = 0;

  for (let index = 0; index < localPoints.length - 1; index += 1) {
    const currentPoint = localPoints[index];
    const nextPoint = localPoints[index + 1];
    twiceArea += currentPoint.x * nextPoint.y - nextPoint.x * currentPoint.y;
  }

  return Math.abs(twiceArea) / 2;
}

export function calculatePolygonPerimeterMeters(points: LatLng[]) {
  const closedPolygon = getClosedPolygon(points);

  if (closedPolygon.length < 4) {
    return 0;
  }

  const origin = getAveragePoint(closedPolygon.slice(0, -1));
  const localPoints = closedPolygon.map((point) => toLocalPoint(origin, point));

  let perimeter = 0;

  for (let index = 0; index < localPoints.length - 1; index += 1) {
    const currentPoint = localPoints[index];
    const nextPoint = localPoints[index + 1];
    perimeter += Math.hypot(nextPoint.x - currentPoint.x, nextPoint.y - currentPoint.y);
  }

  return perimeter;
}

export function calculatePolygonCentroid(points: LatLng[]): LatLng {
  const closedPolygon = getClosedPolygon(points);

  if (closedPolygon.length < 4) {
    return getAveragePoint(points);
  }

  const origin = getAveragePoint(closedPolygon.slice(0, -1));
  const localPoints = closedPolygon.map((point) => toLocalPoint(origin, point));

  let signedAreaFactor = 0;
  let centroidX = 0;
  let centroidY = 0;

  for (let index = 0; index < localPoints.length - 1; index += 1) {
    const currentPoint = localPoints[index];
    const nextPoint = localPoints[index + 1];
    const crossProduct = currentPoint.x * nextPoint.y - nextPoint.x * currentPoint.y;

    signedAreaFactor += crossProduct;
    centroidX += (currentPoint.x + nextPoint.x) * crossProduct;
    centroidY += (currentPoint.y + nextPoint.y) * crossProduct;
  }

  if (signedAreaFactor === 0) {
    return getAveragePoint(points);
  }

  return fromLocalPoint(origin, {
    x: centroidX / (3 * signedAreaFactor),
    y: centroidY / (3 * signedAreaFactor),
  });
}

export function derivePolygonMetrics(points: LatLng[]) {
  const areaSqMeters = calculatePolygonAreaSquareMeters(points);
  const perimeterMeters = calculatePolygonPerimeterMeters(points);

  return {
    areaSqMeters: round(areaSqMeters),
    areaSqFt: round(areaSqMeters * SQUARE_FEET_PER_SQUARE_METER),
    perimeterMeters: round(perimeterMeters),
    perimeterFt: round(perimeterMeters * FEET_PER_METER),
    centroid: calculatePolygonCentroid(points),
  };
}
