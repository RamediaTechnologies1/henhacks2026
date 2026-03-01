"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import type { Report } from "@/lib/types";

export function SafetyAlerts() {
  const [reports, setReports] = useState<Report[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reports?status=submitted");
        if (!res.ok) {
          const allRes = await fetch("/api/reports");
          if (allRes.ok) {
            const data = await allRes.json();
            const safetyReports = (data.reports || []).filter(
              (r: Report) => r.safety_concern && r.status !== "resolved"
            );
            setReports(safetyReports);
          }
          return;
        }
        const data = await res.json();
        const safetyReports = (data.reports || []).filter(
          (r: Report) => r.safety_concern && r.status !== "resolved"
        );
        setReports(safetyReports);
      } catch {
        // silent
      }
    }
    load();
  }, []);

  if (reports.length === 0 || dismissed) return null;

  const criticalCount = reports.filter((r) => r.priority === "critical").length;
  const buildings = [...new Set(reports.map((r) => r.building))];

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/[0.05] overflow-hidden page-enter">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3.5"
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-[#ef4444]/15 p-2 rounded-xl">
            <ShieldAlert className="h-4 w-4 text-[#ef4444]" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#ef4444]">
              {reports.length} Active Safety Alert{reports.length !== 1 ? "s" : ""}
              {criticalCount > 0 && ` (${criticalCount} critical)`}
            </p>
            <p className="text-[10px] text-[#666666]">
              {buildings.slice(0, 3).join(", ")}
              {buildings.length > 3 ? ` +${buildings.length - 3} more` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            className="text-[10px] text-[#666666] hover:text-[#a1a1a1] px-2 py-1"
          >
            Dismiss
          </button>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-[#666666]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#666666]" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-2 stagger-enter">
          <p className="text-[10px] text-[#666666] font-medium px-1">
            Use caution in these locations. Reports are being addressed by maintenance.
          </p>
          {reports.slice(0, 5).map((r) => (
            <div
              key={r.id}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                r.priority === "critical"
                  ? "bg-[#ef4444]/10 border-[#ef4444]/20"
                  : "bg-white/[0.03] border-white/[0.08]"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                r.priority === "critical" ? "bg-[#ef4444] animate-pulse" : "bg-[#f97316]"
              }`} />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#ededed] leading-snug">
                  {r.ai_description}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="h-2.5 w-2.5 text-[#666666]" />
                  <span className="text-[10px] text-[#666666]">
                    {r.building}{r.room ? `, Room ${r.room}` : ""}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    r.priority === "critical"
                      ? "bg-[#ef4444]/15 text-[#ef4444]"
                      : "bg-[#f97316]/15 text-[#f97316]"
                  }`}>
                    {r.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {reports.length > 5 && (
            <p className="text-[10px] text-[#666666] text-center py-1">
              +{reports.length - 5} more alerts
            </p>
          )}
        </div>
      )}
    </div>
  );
}
