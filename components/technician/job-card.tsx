"use client";

import { MapPin, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import type { Assignment } from "@/lib/types";

interface JobCardProps {
  assignment: Assignment;
  onClick: () => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", border: "border-[#6B7280]/20", label: "New" },
  accepted: { bg: "bg-[#EFF6FF]", text: "text-[#00539F]", border: "border-[#00539F]/20", label: "Accepted" },
  in_progress: { bg: "bg-[#FFFBEB]", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20", label: "In progress" },
  completed: { bg: "bg-[#ECFDF5]", text: "text-[#10B981]", border: "border-[#10B981]/20", label: "Done" },
  cancelled: { bg: "bg-[#F3F4F6]", text: "text-[#9CA3AF]", border: "border-[#9CA3AF]/20", label: "Cancelled" },
};

const PRIORITY_BORDER: Record<string, string> = {
  critical: "border-l-[#DC2626]",
  high: "border-l-[#F59E0B]",
  medium: "border-l-[#00539F]",
  low: "border-l-[#10B981]",
};

export function JobCard({ assignment, onClick }: JobCardProps) {
  const report = assignment.report;
  if (!report) return null;

  const status = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.pending;

  return (
    <div
      className={`cursor-pointer bg-white border border-[#E5E7EB] rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden border-l-[3px] hover:border-[#D1D5DB] hover:bg-[#FAFAFA] transition-colors duration-150 ${PRIORITY_BORDER[report.priority] || ""}`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-[4px] border border-[#E5E7EB]">
              {report.trade.replace("_", " ")}
            </span>
            {report.priority === "critical" && (
              <span className="text-[12px] font-medium text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-[4px] border border-[#DC2626]/20">
                urgent
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium border ${status.bg} ${status.text} ${status.border}`}>
              {status.label}
            </span>
            <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
          </div>
        </div>

        <p className="text-[14px] font-medium text-[#111111] mb-2 leading-snug">
          {report.ai_description}
        </p>

        <div className="flex items-center gap-3 text-[13px] text-[#6B7280]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {report.building}{report.room ? `, ${report.room}` : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(assignment.created_at).toLocaleDateString()}
          </span>
          {report.safety_concern && (
            <span className="flex items-center gap-1 text-[#DC2626] font-medium">
              <AlertTriangle className="h-3 w-3" /> safety
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
