"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, AlertTriangle, ClipboardList, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import type { Report } from "@/lib/types";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  submitted: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  analyzing: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  dispatched: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  in_progress: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  resolved: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
};

const PRIORITY_STRIP: Record<string, string> = {
  critical: "priority-strip-critical",
  high: "priority-strip-high",
  medium: "priority-strip-medium",
  low: "priority-strip-low",
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
    <div className="p-4 space-y-4 page-enter">
      <div className="section-header">
        <h1 className="text-xl font-bold text-gray-900">My Reports</h1>
        <p className="text-xs text-gray-400 mt-0.5">Track the status of your submissions</p>
      </div>

      {loading && (
        <div className="space-y-3 stagger-enter">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="text-center py-16">
          <div className="empty-state-circle w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium mb-1">No reports yet</p>
          <p className="text-gray-400 text-sm mb-6">Submit your first maintenance report to get started.</p>
          <Link href="/user">
            <Button className="bg-gradient-to-r from-[#00539F] to-[#0066cc] rounded-xl h-11 px-6 shadow-lg shadow-blue-500/20">
              <Camera className="mr-2 h-4 w-4" />
              Report an Issue
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-3 stagger-enter">
        {reports.map((report) => {
          const status = STATUS_STYLES[report.status] || STATUS_STYLES.submitted;
          return (
            <Card
              key={report.id}
              className={`overflow-hidden rounded-2xl card-hover-lift ${PRIORITY_STRIP[report.priority] || ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-bold rounded-lg">
                      {report.trade.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${report.status === "in_progress" ? "dot-breathing" : ""}`} />
                    {report.status.replace("_", " ").toUpperCase()}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
                  {report.ai_description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
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
                    <span className="flex items-center gap-1 text-red-500 font-semibold">
                      <AlertTriangle className="h-3 w-3" />
                      Safety
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
