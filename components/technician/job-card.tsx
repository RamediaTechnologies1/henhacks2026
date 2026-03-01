"use client";

import { MapPin, Clock, AlertTriangle, ChevronRight, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Assignment } from "@/lib/types";

interface JobCardProps {
  assignment: Assignment;
  onClick: () => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: "bg-[#c8a55c]/15", text: "text-[#c8a55c]", dot: "bg-[#c8a55c]", label: "NEW" },
  accepted: { bg: "bg-[#4a6fa5]/15", text: "text-[#6a8fc5]", dot: "bg-[#4a6fa5]", label: "ACCEPTED" },
  in_progress: { bg: "bg-[#b87333]/15", text: "text-[#d89343]", dot: "bg-[#b87333]", label: "IN PROGRESS" },
  completed: { bg: "bg-[#6b7c5e]/15", text: "text-[#8b9c7e]", dot: "bg-[#6b7c5e]", label: "DONE" },
  cancelled: { bg: "bg-[#3d3124]", text: "text-[#6b5e4f]", dot: "bg-[#6b5e4f]", label: "CANCELLED" },
};

const PRIORITY_STRIP: Record<string, string> = {
  critical: "priority-strip-critical",
  high: "priority-strip-high",
  medium: "priority-strip-medium",
  low: "priority-strip-low",
};

export function JobCard({ assignment, onClick }: JobCardProps) {
  const report = assignment.report;
  if (!report) return null;

  const status = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.pending;

  return (
    <Card
      className={`cursor-pointer card-hover-lift rounded-2xl overflow-hidden border-[#3d3124] bg-[#231c14] ${PRIORITY_STRIP[report.priority] || ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#2d2418] text-[#e8d5a3] uppercase tracking-wide">
              {report.trade.replace("_", " ")}
            </span>
            {report.priority === "critical" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-[#c44536]/15 text-[#e85a4a]">
                <Zap className="h-3 w-3" /> URGENT
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${assignment.status === "pending" ? "dot-breathing" : ""}`} />
              {status.label}
            </span>
            <ChevronRight className="h-4 w-4 text-[#4d3f30]" />
          </div>
        </div>

        <p className="text-sm font-semibold text-[#f4e4c1] mb-2.5 leading-snug">
          {report.ai_description}
        </p>

        <div className="flex items-center gap-3 text-xs text-[#6b5e4f]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {report.building}{report.room ? `, ${report.room}` : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(assignment.created_at).toLocaleDateString()}
          </span>
          {report.safety_concern && (
            <span className="flex items-center gap-1 text-[#c44536] font-semibold rounded-full px-1.5">
              <AlertTriangle className="h-3 w-3" /> Safety
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
