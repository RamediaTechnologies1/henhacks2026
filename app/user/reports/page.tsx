"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Report } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  analyzing: "bg-yellow-100 text-yellow-700",
  dispatched: "bg-purple-100 text-purple-700",
  in_progress: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
};

const PRIORITY_ICONS: Record<string, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reports");
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">My Reports</h1>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && reports.length === 0 && (
        <p className="text-center text-gray-400 py-8">
          No reports yet. Submit your first report!
        </p>
      )}

      {reports.map((report) => (
        <Card key={report.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{PRIORITY_ICONS[report.priority]}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {report.trade.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
              <Badge className={`text-[10px] ${STATUS_STYLES[report.status] || ""}`}>
                {report.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {report.ai_description}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {report.building}
                {report.room ? `, ${report.room}` : ""}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(report.created_at).toLocaleDateString()}
              </span>
              {report.safety_concern && (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertTriangle className="h-3 w-3" />
                  Safety
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
