"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { defaultMarkerIcon } from "../map/markerIcon";

interface SavedLocation {
  lat: number;
  lng: number;
  label?: string | null;
}

/**
 * Leaflet implementation of the read-only event map. Loaded client-only through
 * `LocationViewer` because Leaflet needs `window` at module evaluation time and
 * would otherwise break server rendering.
 */
export default function LeafletLocationViewer({
  location,
}: {
  location: SavedLocation;
}) {
  const position: [number, number] = [location.lat, location.lng];

  return (
    <>
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: 300, width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={defaultMarkerIcon} />
      </MapContainer>
      {location.label ? (
        <p className="mt-2 text-sm text-ink-soft">{location.label}</p>
      ) : null}
    </>
  );
}
