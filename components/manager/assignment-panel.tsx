"use client";

import { User, Clock, MapPin, ArrowRight, Sparkles, ClipboardCheck } from "lucide-react";
import type { Assignment } from "@/lib/types";

function getAssignmentSLA(assignment: Assignment): { label: string; color: string } {
  const created = new Date(assignment.created_at).getTime();
  const now = Date.now();
  const hours = Math.floor((now - created) / (1000 * 60 * 60));
  const mins = Math.floor((now - created) / (1000 * 60)) % 60;
  const label = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  if (assignment.status === "completed") return { label, color: "text-[#10B981]" };
  if (hours >= 4) return { label, color: "text-[#DC2626]" };
  if (hours >= 2) return { label, color: "text-[#F59E0B]" };
  return { label, color: "text-[#9CA3AF]" };
}

interface AssignmentPanelProps {
  assignments: Assignment[];
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", border: "border-[#6B7280]/20" },
  accepted: { bg: "bg-[#EFF6FF]", text: "text-[#00539F]", border: "border-[#00539F]/20" },
  in_progress: { bg: "bg-[#FFFBEB]", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
  completed: { bg: "bg-[#ECFDF5]", text: "text-[#10B981]", border: "border-[#10B981]/20" },
  cancelled: { bg: "bg-[#F3F4F6]", text: "text-[#9CA3AF]", border: "border-[#9CA3AF]/20" },
};

export function AssignmentPanel({ assignments }: AssignmentPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[16px] font-medium text-[#111111]">Assignments</h2>
        <p className="text-[13px] text-[#6B7280]">{assignments.length} total</p>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[14px] text-[#6B7280]">No assignments yet</p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">Use AI Assign to automatically route reports to technicians.</p>
        </div>
      )}

      <div className="space-y-2">
        {assignments.map((a) => {
          const status = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
          const sla = getAssignmentSLA(a);
          return (
            <div key={a.id} className="bg-white border border-[#E5E7EB] rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-4 hover:border-[#D1D5DB] transition-colors duration-150">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium border ${status.bg} ${status.text} ${status.border}`}>
                    {a.status.replace("_", " ")}
                  </span>
                  {a.assigned_by === "ai" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#EFF6FF] text-[#00539F] border border-[#00539F]/20">
                      <Sparkles className="h-2.5 w-2.5" /> AI
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-[#9CA3AF] font-mono">
                  #{a.id.slice(0, 8)}
                </span>
              </div>

              {/* Route visualization */}
              <div className="flex items-center gap-2 mb-2">
                {a.report && (
                  <div className="flex items-center gap-1.5 text-[13px]">
                    <MapPin className="h-3.5 w-3.5 text-[#6B7280]" />
                    <span className="text-[#111111]">
                      {a.report.building}
                      {a.report.room ? `, ${a.report.room}` : ""}
                    </span>
                  </div>
                )}
                <ArrowRight className="h-3 w-3 text-[#9CA3AF] flex-shrink-0" />
                {a.technician && (
                  <div className="flex items-center gap-1.5 text-[13px]">
                    <User className="h-3.5 w-3.5 text-[#6B7280]" />
                    <span className="font-medium text-[#111111]">{a.technician.name}</span>
                  </div>
                )}
              </div>

              {a.report && (
                <p className="text-[13px] text-[#6B7280] truncate">
                  {a.report.ai_description}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2 text-[12px] text-[#9CA3AF]">
                <Clock className="h-3 w-3" />
                {new Date(a.created_at).toLocaleString()}
                {a.status !== "completed" && (
                  <span className={`font-medium ${sla.color}`}>({sla.label})</span>
                )}
                {a.notes && <span className="text-[#6B7280]">— {a.notes}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
