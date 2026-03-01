"use client";

import { Bot, User, Clock, MapPin, ArrowRight, Sparkles, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Assignment } from "@/lib/types";

interface AssignmentPanelProps {
  assignments: Assignment[];
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-[#c8a55c]/15", text: "text-[#c8a55c]", dot: "bg-[#c8a55c]" },
  accepted: { bg: "bg-[#4a6fa5]/15", text: "text-[#6a8fc5]", dot: "bg-[#4a6fa5]" },
  in_progress: { bg: "bg-[#b87333]/15", text: "text-[#d89343]", dot: "bg-[#b87333]" },
  completed: { bg: "bg-[#6b7c5e]/15", text: "text-[#8b9c7e]", dot: "bg-[#6b7c5e]" },
  cancelled: { bg: "bg-[#3d3124]", text: "text-[#6b5e4f]", dot: "bg-[#6b5e4f]" },
};

export function AssignmentPanel({ assignments }: AssignmentPanelProps) {
  return (
    <div className="space-y-3">
      <div className="section-header">
        <h2 className="font-bold text-lg text-[#f4e4c1]">Assignments</h2>
        <p className="text-xs text-[#6b5e4f] mt-0.5">{assignments.length} total</p>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-[#2d2418] flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="h-7 w-7 text-[#6b5e4f]" />
          </div>
          <p className="text-[#9c8e7c] font-medium">No assignments yet</p>
          <p className="text-[#6b5e4f] text-sm mt-1">Use AI Assign to automatically route reports to technicians.</p>
        </div>
      )}

      <div className="space-y-2.5 stagger-enter">
        {assignments.map((a) => {
          const status = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
          return (
            <Card key={a.id} className="rounded-2xl card-hover-lift border-[#3d3124] bg-[#231c14] overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {a.status.replace("_", " ").toUpperCase()}
                    </div>
                    {a.assigned_by === "ai" && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#c8a55c]/15 text-[#c8a55c] border border-[#c8a55c]/20">
                        <Sparkles className="h-2.5 w-2.5" /> AI
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#4d3f30] font-mono">
                    #{a.id.slice(0, 8)}
                  </span>
                </div>

                {/* Route visualization */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  {a.report && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="bg-[#c8a55c]/15 p-1.5 rounded-lg">
                        <MapPin className="h-3 w-3 text-[#c8a55c]" />
                      </div>
                      <span className="font-medium text-xs text-[#e8d5a3]">
                        {a.report.building}
                        {a.report.room ? `, ${a.report.room}` : ""}
                      </span>
                    </div>
                  )}
                  <ArrowRight className="h-3 w-3 text-[#4d3f30] flex-shrink-0" />
                  {a.technician && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="bg-[#6b7c5e]/15 p-1.5 rounded-lg">
                        <User className="h-3 w-3 text-[#6b7c5e]" />
                      </div>
                      <span className="font-semibold text-xs text-[#e8d5a3]">{a.technician.name}</span>
                    </div>
                  )}
                </div>

                {a.report && (
                  <p className="text-xs text-[#9c8e7c] truncate leading-relaxed">
                    {a.report.ai_description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2.5 text-[10px] text-[#6b5e4f]">
                  <Clock className="h-3 w-3" />
                  {new Date(a.created_at).toLocaleString()}
                  {a.notes && <span className="italic text-[#6b5e4f]">— {a.notes}</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
