export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapViewport {
  northeast: LatLng;
  southwest: LatLng;
}
