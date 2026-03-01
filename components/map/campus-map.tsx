"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/lib/types";
import { UDEL_MAP_CENTER, UDEL_MAP_ZOOM, UDEL_BUILDINGS } from "@/lib/constants";

interface CampusMapProps {
  reports: Report[];
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

function computeBuildingSafetyScore(buildingReports: Report[]): number {
  const open = buildingReports.filter((r) => r.status !== "resolved");
  const safetyCount = open.filter((r) => r.safety_concern).length;
  const criticalCount = open.filter((r) => r.priority === "critical").length;
  const highCount = open.filter((r) => r.priority === "high").length;
  return Math.min(10, Math.round(safetyCount * 3 + criticalCount * 2.5 + highCount * 1.5 + open.length * 0.3));
}

function getSafetyColor(score: number): string {
  if (score >= 7) return "#ef4444";
  if (score >= 4) return "#f97316";
  if (score >= 2) return "#eab308";
  if (score >= 1) return "#a3a3a3";
  return "#22c55e";
}

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
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    UDEL_BUILDINGS.forEach((building) => {
      const buildingReports = reports.filter((r) => r.building === building.name);
      const openReports = buildingReports.filter((r) => r.status !== "resolved");
      const safetyReports = openReports.filter((r) => r.safety_concern);
      const safetyScore = computeBuildingSafetyScore(buildingReports);

      const hasReports = openReports.length > 0;
      const hasSafety = safetyReports.length > 0;

      // Color by safety score, not just priority
      const color = hasSafety
        ? getSafetyColor(safetyScore)
        : hasReports
          ? PRIORITY_COLORS[
              openReports.sort((a, b) => (b.urgency_score || 0) - (a.urgency_score || 0))[0].priority
            ]
          : "#64748b";

      const size = hasSafety ? 36 : hasReports ? 32 : 22;

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid ${hasSafety ? '#ffffff' : '#ededed'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.4)${hasSafety ? `, 0 0 12px ${color}60` : ''};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${hasReports ? 12 : 10}px;
          font-weight: 700;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          transition: transform 0.2s ease;
          cursor: pointer;
          ${hasSafety ? "animation: safetyPulse 1.5s ease-in-out infinite;" : hasReports ? "animation: pulse 2s ease-in-out infinite;" : ""}
        ">${hasSafety ? '⚠' : hasReports ? openReports.length : ""}</div>
        <style>
          @keyframes pulse {
            0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 0 ${color}40; }
            50% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 6px ${color}00; }
          }
          @keyframes safetyPulse {
            0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 12px ${color}60, 0 0 0 0 ${color}40; transform: scale(1); }
            50% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 20px ${color}80, 0 0 0 8px ${color}00; transform: scale(1.05); }
          }
        </style>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([building.lat, building.lng], { icon }).addTo(map);

      // Enhanced popup with safety info
      const safetyLabel = safetyScore >= 7 ? "CRITICAL" : safetyScore >= 4 ? "AT RISK" : safetyScore >= 2 ? "CAUTION" : "SAFE";
      const safetyColor = getSafetyColor(safetyScore);

      const popupContent = `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 10px; background: rgba(0,0,0,0.95); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); min-width: 180px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #ededed;">${building.name}</div>
          ${hasReports ? `
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              <span style="font-size: 11px; color: #666666;">${openReports.length} active report${openReports.length !== 1 ? "s" : ""}</span>
              ${hasSafety ? `<span style="font-size: 10px; font-weight: 700; color: ${safetyColor}; background: ${safetyColor}20; padding: 2px 6px; border-radius: 4px;">⚠ ${safetyReports.length} SAFETY</span>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px; padding: 6px 8px; background: ${safetyColor}15; border-radius: 6px; border: 1px solid ${safetyColor}30;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${safetyColor};"></div>
              <span style="font-size: 11px; font-weight: 700; color: ${safetyColor};">Safety: ${safetyLabel} (${safetyScore}/10)</span>
            </div>
            ${openReports.slice(0, 3).map((r) => `<div style="font-size: 11px; color: #a1a1a1; padding: 3px 0; border-top: 1px solid rgba(255,255,255,0.06);">
              ${r.safety_concern ? '⚠ ' : '● '}${r.ai_description?.slice(0, 50)}${(r.ai_description?.length || 0) > 50 ? "..." : ""}
            </div>`).join("")}
          ` : `<div style="font-size: 12px; color: #22c55e; margin-top: 2px;">✓ No active issues</div>`}
        </div>`;

      marker.bindPopup(popupContent, {
        className: "custom-popup",
        maxWidth: 300,
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
      <div className="h-[450px] bg-[#000000] rounded-2xl animate-pulse flex items-center justify-center border border-white/[0.08]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-3 border-white/[0.08] border-t-[#ffffff] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#666666] font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        id="campus-map"
        className="h-[450px] rounded-2xl overflow-hidden border border-white/[0.08]"
      />
      {/* Map Legend */}
      <div className="flex items-center gap-4 px-2 text-[10px] text-[#666666]">
        <span className="font-semibold text-[#a1a1a1]">Safety:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Safe
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> Caution
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" /> At Risk
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Critical
        </span>
      </div>
    </div>
  );
}
