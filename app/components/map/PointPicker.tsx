"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

interface PickedPoint extends Partial<Place> {
  lat: number;
  lng: number;
  loading: boolean;
  error?: boolean;
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
  onPick: (point: PickedPoint) => void;
}

function ClickHandler({ onPick }: ClickHandlerProps) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onPick({ lat, lng, loading: true });
      try {
        const place = await reverseGeocode(lat, lng);
        onPick({ lat, lng, ...place, loading: false });
      } catch {
        onPick({ lat, lng, loading: false, error: true });
      }
    },
  });
  return null;
}

export default function PointPicker() {
  const [point, setPoint] = useState<PickedPoint | null>(null);

  return (
    <>
      <MapContainer
        center={[-18.9, 47.5]}
        zoom={12}
        style={{ height: 400, width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onPick={setPoint} />
        {point && <Marker position={[point.lat, point.lng]} />}
      </MapContainer>

      {point?.loading && <p>Looking up address…</p>}
      {point?.error && <p>Could not find an address for this point.</p>}
      {(point?.street || point?.city) && (
        <p>
          {[point.street, point.city].filter(Boolean).join(", ")}
        </p>
      )}
    </>
  );
}