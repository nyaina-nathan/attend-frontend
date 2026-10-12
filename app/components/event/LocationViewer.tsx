"use client";

import dynamic from "next/dynamic";

const LeafletLocationViewer = dynamic(
  () => import("./LeafletLocationViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse bg-ink/10" />
    ),
  },
);

interface SavedLocation {
  lat: number;
  lng: number;
  label?: string | null;
}

/**
 * Read-only map of a saved event location. Wraps the Leaflet implementation in a
 * client-only dynamic import so it can be rendered from server components.
 */
export default function LocationViewer({
  location,
}: {
  location: SavedLocation;
}) {
  return <LeafletLocationViewer location={location} />;
}
