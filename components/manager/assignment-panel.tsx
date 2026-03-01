"use client";

import { Bot, User, Clock, MapPin, ArrowRight, Sparkles, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Assignment } from "@/lib/types";

function getAssignmentSLA(assignment: Assignment): { label: string; color: string } {
  const created = new Date(assignment.created_at).getTime();
  const now = Date.now();
  const hours = Math.floor((now - created) / (1000 * 60 * 60));
  const mins = Math.floor((now - created) / (1000 * 60)) % 60;
  const label = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  if (assignment.status === "completed") return { label, color: "text-[#22c55e]" };
  if (hours >= 4) return { label, color: "text-[#ef4444]" };
  if (hours >= 2) return { label, color: "text-[#f97316]" };
  return { label, color: "text-[#666666]" };
}

interface AssignmentPanelProps {
  assignments: Assignment[];
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-[#ffffff]/15", text: "text-[#ffffff]", dot: "bg-[#ffffff]" },
  accepted: { bg: "bg-[#cccccc]/15", text: "text-[#cccccc]", dot: "bg-[#cccccc]" },
  in_progress: { bg: "bg-[#888888]/15", text: "text-[#888888]", dot: "bg-[#888888]" },
  completed: { bg: "bg-[#ffffff]/15", text: "text-[#ffffff]", dot: "bg-[#ffffff]" },
  cancelled: { bg: "bg-white/[0.08]", text: "text-[#666666]", dot: "bg-[#666666]" },
};

export function AssignmentPanel({ assignments }: AssignmentPanelProps) {
  return (
    <div className="space-y-3">
      <div className="section-header">
        <h2 className="font-bold text-lg text-[#ededed] font-[family-name:var(--font-outfit)]">Assignments</h2>
        <p className="text-xs text-[#666666] mt-0.5">{assignments.length} total</p>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="h-7 w-7 text-[#666666]" />
          </div>
          <p className="text-[#666666] font-medium">No assignments yet</p>
          <p className="text-[#666666] text-sm mt-1">Use AI Assign to automatically route reports to technicians.</p>
        </div>
      )}

      <div className="space-y-2.5 stagger-enter">
        {assignments.map((a) => {
          const status = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
          return (
            <Card key={a.id} className="rounded-2xl card-hover-lift border-white/[0.08] bg-white/[0.04] overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {a.status.replace("_", " ").toUpperCase()}
                    </div>
                    {a.assigned_by === "ai" && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#888888]/15 text-[#888888] border border-[#888888]/20">
                        <Sparkles className="h-2.5 w-2.5" /> AI
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#444444] font-mono">
                    #{a.id.slice(0, 8)}
                  </span>
                </div>

                {/* Route visualization */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  {a.report && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="bg-[#ffffff]/15 p-1.5 rounded-lg">
                        <MapPin className="h-3 w-3 text-[#ffffff]" />
                      </div>
                      <span className="font-medium text-xs text-[#a1a1a1]">
                        {a.report.building}
                        {a.report.room ? `, ${a.report.room}` : ""}
                      </span>
                    </div>
                  )}
                  <ArrowRight className="h-3 w-3 text-[#444444] flex-shrink-0" />
                  {a.technician && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="bg-[#ffffff]/15 p-1.5 rounded-lg">
                        <User className="h-3 w-3 text-[#ffffff]" />
                      </div>
                      <span className="font-semibold text-xs text-[#a1a1a1]">{a.technician.name}</span>
                    </div>
                  )}
                </div>

                {a.report && (
                  <p className="text-xs text-[#666666] truncate leading-relaxed">
                    {a.report.ai_description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2.5 text-[10px] text-[#666666]">
                  <Clock className="h-3 w-3" />
                  {new Date(a.created_at).toLocaleString()}
                  {a.status !== "completed" && (() => {
                    const sla = getAssignmentSLA(a);
                    return <span className={`font-semibold ${sla.color}`}>({sla.label})</span>;
                  })()}
                  {a.notes && <span className="italic text-[#a1a1a1]">— {a.notes}</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
