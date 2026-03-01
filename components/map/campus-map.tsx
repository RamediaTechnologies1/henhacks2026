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

    UDEL_BUILDINGS.forEach((building) => {
      const buildingReports = reports.filter(
        (r) => r.building === building.name && r.status !== "resolved"
      );

      const hasReports = buildingReports.length > 0;
      const color = hasReports
        ? PRIORITY_COLORS[
            buildingReports.sort(
              (a, b) => (b.urgency_score || 0) - (a.urgency_score || 0)
            )[0].priority
          ]
        : "#94a3b8";

      const size = hasReports ? 32 : 22;

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${hasReports ? 12 : 10}px;
          font-weight: 700;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          transition: transform 0.2s ease;
          cursor: pointer;
          ${hasReports ? "animation: pulse 2s ease-in-out infinite;" : ""}
        ">${hasReports ? buildingReports.length : ""}</div>
        <style>
          @keyframes pulse {
            0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 0 0 0 ${color}40; }
            50% { box-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 0 0 6px ${color}00; }
          }
        </style>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([building.lat, building.lng], { icon }).addTo(map);

      const popupContent = hasReports
        ? `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 4px 0;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #111827;">${building.name}</div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${buildingReports.length} active report${buildingReports.length !== 1 ? "s" : ""}</div>
            ${buildingReports.slice(0, 3).map((r) => `<div style="font-size: 11px; color: #374151; padding: 3px 0; border-top: 1px solid #f3f4f6;">&#8226; ${r.ai_description?.slice(0, 45)}${(r.ai_description?.length || 0) > 45 ? "..." : ""}</div>`).join("")}
           </div>`
        : `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 4px 0;">
            <div style="font-weight: 700; font-size: 14px; color: #111827;">${building.name}</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">No active reports</div>
           </div>`;

      marker.bindPopup(popupContent, {
        className: "custom-popup",
        maxWidth: 280,
        closeButton: false,
      });
    });

    setMapRef(map);

    return () => {
      map.remove();
      setMapRef(null);
    };
  }, [mounted, L, reports]);

  if (!mounted) {
    return (
      <div className="h-[450px] bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-3 border-gray-200 border-t-gray-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="campus-map"
      className="h-[450px] rounded-2xl overflow-hidden"
    />
  );
}
