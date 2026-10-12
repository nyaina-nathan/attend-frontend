"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { defaultMarkerIcon } from "./markerIcon";

interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
  error?: string;
}

interface Place {
  street: string | null;
  city: string | null;
  full: string | null;
}

/** A point the user dropped on the map, with its reverse-geocoded address. */
export interface PickedLocation {
  lat: number;
  lng: number;
  street: string | null;
  city: string | null;
  full: string | null;
}

interface PointPickerProps {
  /** Current coordinates to mark and centre on; `null` for the default view. */
  value?: { lat: number; lng: number } | null;
  /** Called after a click is reverse-geocoded. */
  onPick: (location: PickedLocation) => void;
  /** Initial centre when no `value` is given. */
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

async function reverseGeocode(lat: number, lng: number): Promise<Place> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&accept-language=fr&lat=${lat}&lon=${lng}`
  );
  if (!res.ok) throw new Error("Geocoding failed");

  const data: NominatimResponse = await res.json();
  if (data.error) throw new Error(data.error);

  const a = data.address ?? {};
  return {
    street: a.road ?? a.pedestrian ?? a.suburb ?? null,
    city: a.city ?? a.town ?? a.village ?? a.municipality ?? null,
    full: data.display_name ?? null,
  };
}

interface ClickHandlerProps {
  onPick: (location: PickedLocation) => void;
  onStatus: (status: { loading: boolean; error?: boolean }) => void;
}

function ClickHandler({ onPick, onStatus }: ClickHandlerProps) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onStatus({ loading: true });
      try {
        const place = await reverseGeocode(lat, lng);
        onStatus({ loading: false });
        onPick({ lat, lng, ...place });
      } catch {
        // Coordinates are still useful without an address, so report them too.
        onStatus({ loading: false, error: true });
        onPick({ lat, lng, street: null, city: null, full: null });
      }
    },
  });
  return null;
}

/**
 * Click-to-pick map used by the event form. Reports the chosen coordinates (and
 * address) through `onPick` so the caller can store `latitude`/`longitude`
 * alongside the manually typed location.
 */
export default function PointPicker({
  value = null,
  onPick,
  defaultCenter = [-18.9, 47.5],
  defaultZoom = 12,
}: PointPickerProps) {
  const [status, setStatus] = useState<{ loading: boolean; error?: boolean }>({
    loading: false,
  });

  const position: [number, number] | null = value
    ? [value.lat, value.lng]
    : null;

  return (
    <>
      <MapContainer
        center={position ?? defaultCenter}
        zoom={position ? 15 : defaultZoom}
        scrollWheelZoom={false}
        style={{ height: 320, width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onPick={onPick} onStatus={setStatus} />
        {position && <Marker position={position} icon={defaultMarkerIcon} />}
      </MapContainer>

      <div className="mt-2 flex min-h-5 items-center gap-2 text-xs text-ink-soft">
        {status.loading ? (
          <span>Looking up address…</span>
        ) : status.error ? (
          <span className="font-semibold text-danger">
            Could not find an address for this point.
          </span>
        ) : (
          <span>Click the map to drop a pin at the exact location.</span>
        )}
      </div>
    </>
  );
}
