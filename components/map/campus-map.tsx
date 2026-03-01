"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/lib/types";
import { UDEL_MAP_CENTER, UDEL_MAP_ZOOM, UDEL_BUILDINGS } from "@/lib/constants";

interface CampusMapProps {
  reports: Report[];
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#DC2626",
  high: "#F59E0B",
  medium: "#00539F",
  low: "#10B981",
};

export function CampusMap({ reports }: CampusMapProps) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [mapRef, setMapRef] = useState<import("leaflet").Map | null>(null);
  const [markersLayer, setMarkersLayer] = useState<import("leaflet").LayerGroup | null>(null);

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
      maxZoom: 20,
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    setMarkersLayer(layer);
    setMapRef(map);

    return () => {
      map.remove();
      setMapRef(null);
      setMarkersLayer(null);
    };
  }, [mounted, L]);

  useEffect(() => {
    if (!L || !mapRef || !markersLayer) return;

    markersLayer.clearLayers();

    UDEL_BUILDINGS.forEach((building) => {
      const buildingReports = reports.filter((r) => r.building === building.name);
      const openReports = buildingReports.filter((r) => r.status !== "resolved");
      const hasReports = openReports.length > 0;
      const hasSafety = openReports.some((r) => r.safety_concern);

      const color = hasSafety
        ? "#DC2626"
        : hasReports
          ? PRIORITY_COLORS[
              openReports.sort((a, b) => (b.urgency_score || 0) - (a.urgency_score || 0))[0].priority
            ]
          : "#9CA3AF";

      const size = 12;

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          cursor: pointer;
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([building.lat, building.lng], { icon });

      const popupContent = `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 8px; min-width: 160px;">
          <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px; color: #111111;">${building.name}</div>
          ${hasReports ? `
            <div style="font-size: 13px; color: #6B7280; margin-bottom: 6px;">${openReports.length} active report${openReports.length !== 1 ? "s" : ""}</div>
            ${openReports.slice(0, 3).map((r) => `<div style="font-size: 13px; color: #111111; padding: 3px 0; border-top: 1px solid #E5E7EB; display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${PRIORITY_COLORS[r.priority] || '#6B7280'}; flex-shrink: 0;"></span>
              ${r.ai_description?.slice(0, 50)}${(r.ai_description?.length || 0) > 50 ? "..." : ""}
            </div>`).join("")}
          ` : `<div style="font-size: 13px; color: #10B981;">No active issues</div>`}
        </div>`;

      marker.bindPopup(popupContent, {
        className: "custom-popup",
        maxWidth: 300,
        closeButton: false,
      });

      markersLayer.addLayer(marker);
    });
  }, [L, mapRef, markersLayer, reports]);

  if (!mounted) {
    return (
      <div className="h-[450px] bg-[#FAFAFA] rounded-[6px] border border-[#E5E7EB] flex items-center justify-center">
        <div className="w-48 h-1 rounded-full overflow-hidden bg-[#E5E7EB]">
          <div className="h-full w-1/3 bg-[#00539F] rounded-full skeleton-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        id="campus-map"
        className="h-[450px] rounded-[6px] overflow-hidden border border-[#E5E7EB]"
      />
      {/* Map Legend */}
      <div className="flex items-center gap-4 px-1 text-[12px] text-[#6B7280]">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Safe
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Caution
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Critical
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF]" /> No issues
        </span>
      </div>
    </div>
  );
}
