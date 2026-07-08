"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  submissionCount: number;
  topCategory: string | null;
  avgUrgency: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Education: "#2854d6",
  Health: "#e11d48",
  Roads: "#b45309",
  Water: "#0891b2",
  Electricity: "#ca8a04",
  Sanitation: "#65a30d",
  Employment: "#7c3aed",
  Safety: "#dc2626",
  Other: "#64748b",
};

export default function HotspotMap() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  useEffect(() => {
    fetch("/api/hotspots")
      .then((r) => r.json())
      .then((d) => setHotspots(d.hotspots ?? []));
  }, []);

  const center: [number, number] =
    hotspots.length > 0 ? [hotspots[0].lat, hotspots[0].lng] : [17.39, 78.48];

  return (
    <div className="h-[420px] w-full rounded-xl overflow-hidden border border-slate-200">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotspots.map((h) => (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.lng]}
            radius={Math.max(8, Math.min(30, h.submissionCount * 3))}
            pathOptions={{
              color: CATEGORY_COLORS[h.topCategory ?? "Other"],
              fillColor: CATEGORY_COLORS[h.topCategory ?? "Other"],
              fillOpacity: 0.5,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{h.name}</p>
                <p>{h.submissionCount} submissions</p>
                <p>Top issue: {h.topCategory ?? "—"}</p>
                <p>Avg urgency: {h.avgUrgency}/5</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
