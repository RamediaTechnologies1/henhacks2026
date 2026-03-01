"use client";

import { MapPin, Clock, AlertTriangle, ChevronRight, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Assignment } from "@/lib/types";

interface JobCardProps {
  assignment: Assignment;
  onClick: () => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: "bg-white/15", text: "text-white", dot: "bg-white", label: "NEW" },
  accepted: { bg: "bg-[#cccccc]/15", text: "text-[#cccccc]", dot: "bg-[#cccccc]", label: "ACCEPTED" },
  in_progress: { bg: "bg-[#888888]/15", text: "text-[#888888]", dot: "bg-[#888888]", label: "IN PROGRESS" },
  completed: { bg: "bg-white/15", text: "text-white", dot: "bg-white", label: "DONE" },
  cancelled: { bg: "bg-[#64748b]/15", text: "text-[#64748b]", dot: "bg-[#64748b]", label: "CANCELLED" },
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
      className={`cursor-pointer card-hover-lift rounded-2xl overflow-hidden border-white/[0.08] bg-white/[0.04] ${PRIORITY_STRIP[report.priority] || ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-[#a1a1a1] uppercase tracking-wide">
              {report.trade.replace("_", " ")}
            </span>
            {report.priority === "critical" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-[#ef4444]/15 text-[#ef4444]">
                <Zap className="h-3 w-3" /> URGENT
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${assignment.status === "pending" ? "dot-breathing" : ""}`} />
              {status.label}
            </span>
            <ChevronRight className="h-4 w-4 text-[#484f58]" />
          </div>
        </div>

        <p className="text-sm font-semibold text-[#ededed] mb-2.5 leading-snug">
          {report.ai_description}
        </p>

        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {report.building}{report.room ? `, ${report.room}` : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(assignment.created_at).toLocaleDateString()}
          </span>
          {report.safety_concern && (
            <span className="flex items-center gap-1 text-[#ef4444] font-semibold rounded-full px-1.5">
              <AlertTriangle className="h-3 w-3" /> Safety
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
