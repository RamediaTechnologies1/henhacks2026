"use client";

import { Bot, User, Clock, MapPin, ArrowRight, Sparkles, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Assignment } from "@/lib/types";

interface AssignmentPanelProps {
  assignments: Assignment[];
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  accepted: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  in_progress: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  cancelled: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" },
};

export function AssignmentPanel({ assignments }: AssignmentPanelProps) {
  return (
    <div className="space-y-3">
      <div className="section-header">
        <h2 className="font-bold text-lg text-gray-900">Assignments</h2>
        <p className="text-xs text-gray-400 mt-0.5">{assignments.length} total</p>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-16">
          <div className="empty-state-circle w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No assignments yet</p>
          <p className="text-gray-400 text-sm mt-1">Use AI Assign to automatically route reports to technicians.</p>
        </div>
      )}

      <div className="space-y-2.5 stagger-enter">
        {assignments.map((a) => {
          const status = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
          return (
            <Card key={a.id} className="rounded-2xl card-hover-lift border-gray-100 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {a.status.replace("_", " ").toUpperCase()}
                    </div>
                    {a.assigned_by === "ai" && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-600 border border-violet-100">
                        <Sparkles className="h-2.5 w-2.5" /> AI
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-300 font-mono">
                    #{a.id.slice(0, 8)}
                  </span>
                </div>

                {/* Route visualization */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  {a.report && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <div className="bg-blue-50 p-1.5 rounded-lg">
                        <MapPin className="h-3 w-3 text-[#00539F]" />
                      </div>
                      <span className="font-medium text-xs">
                        {a.report.building}
                        {a.report.room ? `, ${a.report.room}` : ""}
                      </span>
                    </div>
                  )}
                  <ArrowRight className="h-3 w-3 text-gray-300 flex-shrink-0" />
                  {a.technician && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="bg-emerald-50 p-1.5 rounded-lg">
                        <User className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="font-semibold text-xs text-gray-800">{a.technician.name}</span>
                    </div>
                  )}
                </div>

                {a.report && (
                  <p className="text-xs text-gray-500 truncate leading-relaxed">
                    {a.report.ai_description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2.5 text-[10px] text-gray-400">
                  <Clock className="h-3 w-3" />
                  {new Date(a.created_at).toLocaleString()}
                  {a.notes && <span className="italic text-gray-400">— {a.notes}</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
