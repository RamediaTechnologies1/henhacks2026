"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/lib/types";
import { UDEL_MAP_CENTER, UDEL_MAP_ZOOM, UDEL_BUILDINGS } from "@/lib/constants";

interface CampusMapProps {
  reports: Report[];
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#16a34a",
};

export function CampusMap({ reports }: CampusMapProps) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [mapRef, setMapRef] = useState<import("leaflet").Map | null>(null);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !L || mapRef) return;

    // Add CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const container = document.getElementById("campus-map");
    if (!container) return;

    const map = L.map(container).setView(UDEL_MAP_CENTER, UDEL_MAP_ZOOM);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Building markers
    UDEL_BUILDINGS.forEach((building) => {
      const buildingReports = reports.filter(
        (r) => r.building === building.name && r.status !== "resolved"
      );

      const color = buildingReports.length > 0
        ? PRIORITY_COLORS[
            buildingReports.sort(
              (a, b) =>
                (b.urgency_score || 0) - (a.urgency_score || 0)
            )[0].priority
          ]
        : "#6b7280";

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: ${buildingReports.length > 0 ? 28 : 20}px;
          height: ${buildingReports.length > 0 ? 28 : 20}px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: bold;
        ">${buildingReports.length > 0 ? buildingReports.length : ""}</div>`,
        iconSize: [buildingReports.length > 0 ? 28 : 20, buildingReports.length > 0 ? 28 : 20],
        iconAnchor: [
          buildingReports.length > 0 ? 14 : 10,
          buildingReports.length > 0 ? 14 : 10,
        ],
      });

      const marker = L.marker([building.lat, building.lng], { icon }).addTo(map);

      const popupContent = buildingReports.length > 0
        ? `<b>${building.name}</b><br/>${buildingReports.length} active report(s)<br/>${buildingReports.map((r) => `• ${r.ai_description?.slice(0, 40)}...`).join("<br/>")}`
        : `<b>${building.name}</b><br/>No active reports`;

      marker.bindPopup(popupContent);
    });

    setMapRef(map);

    return () => {
      map.remove();
      setMapRef(null);
    };
  }, [mounted, L, reports]);

  if (!mounted) return <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <div
      id="campus-map"
      className="h-[400px] rounded-xl overflow-hidden border border-gray-200"
    />
  );
}
