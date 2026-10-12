import L from "leaflet";

/**
 * Leaflet resolves its default marker images relative to the page URL, which
 * 404s under a bundler. The images are copied to `public/leaflet` and referenced
 * by absolute URL instead.
 */
export const defaultMarkerIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
