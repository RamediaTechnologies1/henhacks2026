"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, MapPin, AlertTriangle, ClipboardList, Camera, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import type { Report } from "@/lib/types";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  submitted: { bg: "bg-[#ffffff]/15", text: "text-[#ffffff]", dot: "bg-[#ffffff]" },
  analyzing: { bg: "bg-[#888888]/15", text: "text-[#888888]", dot: "bg-[#888888]" },
  dispatched: { bg: "bg-[#a1a1a1]/15", text: "text-[#a1a1a1]", dot: "bg-[#a1a1a1]" },
  in_progress: { bg: "bg-[#cccccc]/15", text: "text-[#cccccc]", dot: "bg-[#cccccc]" },
  resolved: { bg: "bg-[#22c55e]/15", text: "text-[#22c55e]", dot: "bg-[#22c55e]" },
};

const STATUS_STEPS = ["submitted", "dispatched", "in_progress", "resolved"];

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const created = new Date(dateStr).getTime();
  const diff = now - created;
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

function StatusTimeline({ status }: { status: string }) {
  const currentIndex = STATUS_STEPS.indexOf(status);
  const progress = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i <= progress;
        const isCurrent = i === progress;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-full h-1.5 rounded-full transition-all ${
                  isCompleted
                    ? status === "resolved" && i === STATUS_STEPS.length - 1
                      ? "bg-[#22c55e]"
                      : "bg-white"
                    : "bg-white/[0.08]"
                } ${isCurrent && status !== "resolved" ? "animate-pulse" : ""}`}
              />
              <span className={`text-[8px] mt-1 font-semibold ${
                isCompleted ? "text-[#a1a1a1]" : "text-[#444444]"
              }`}>
                {step.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const PRIORITY_STRIP: Record<string, string> = {
  critical: "priority-strip-critical",
  high: "priority-strip-high",
  medium: "priority-strip-medium",
  low: "priority-strip-low",
};

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 10000);
    return () => clearInterval(interval);
  }, [loadReports]);

  return (
    <div className="p-4 space-y-4 page-enter">
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h1 className="text-xl font-bold text-[#ededed]">My Reports</h1>
          <p className="text-xs text-[#64748b] mt-0.5">Track the status of your submissions</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setRefreshing(true); loadReports(); }}
          className="rounded-xl h-9 w-9 p-0 border-white/[0.08] text-[#666666] hover:bg-white/5"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Quick Stats */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#ededed]">{reports.length}</p>
            <p className="text-[9px] text-[#666666] font-medium">Total</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#ededed]">
              {reports.filter((r) => r.status !== "resolved").length}
            </p>
            <p className="text-[9px] text-[#666666] font-medium">Active</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#22c55e]">
              {reports.filter((r) => r.status === "resolved").length}
            </p>
            <p className="text-[9px] text-[#666666] font-medium">Resolved</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-3 stagger-enter">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />
          ))}
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-8 w-8 text-[#64748b]" />
          </div>
          <p className="text-[#666666] font-medium mb-1">No reports yet</p>
          <p className="text-[#64748b] text-sm mb-6">Submit your first maintenance report to get started.</p>
          <Link href="/user">
            <Button className="btn-western rounded-xl h-11 px-6">
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
              className={`overflow-hidden rounded-2xl card-hover-lift border-white/[0.08] bg-white/[0.04] ${PRIORITY_STRIP[report.priority] || ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-bold rounded-lg bg-white/5 text-[#a1a1a1] border-white/[0.08]">
                      {report.trade.replace("_", " ").toUpperCase()}
                    </Badge>
                    {report.safety_concern && (
                      <Badge className="text-[10px] font-bold bg-[#ef4444] text-[#ededed] border-none">
                        <AlertTriangle className="h-3 w-3 mr-0.5" /> Safety
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#666666] font-medium">{getTimeAgo(report.created_at)}</span>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${report.status === "in_progress" ? "dot-breathing" : ""}`} />
                      {report.status === "resolved" ? (
                        <><CheckCircle2 className="h-3 w-3" /> RESOLVED</>
                      ) : (
                        report.status.replace("_", " ").toUpperCase()
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold text-[#ededed] mb-1 leading-snug">
                  {report.ai_description}
                </p>

                <div className="flex items-center gap-3 text-xs text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {report.building}
                    {report.room ? `, ${report.room}` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Status Timeline */}
                <StatusTimeline status={report.status} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
