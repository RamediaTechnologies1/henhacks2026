"use client";

import { Bot, User, Clock, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Assignment } from "@/lib/types";

interface AssignmentPanelProps {
  assignments: Assignment[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export function AssignmentPanel({ assignments }: AssignmentPanelProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg">
        Assignments ({assignments.length})
      </h2>

      {assignments.length === 0 && (
        <p className="text-center text-gray-400 py-8">No assignments yet.</p>
      )}

      {assignments.map((a) => (
        <Card key={a.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className={STATUS_STYLES[a.status] || ""}>
                  {a.status.replace("_", " ").toUpperCase()}
                </Badge>
                {a.assigned_by === "ai" && (
                  <Badge variant="outline" className="text-[10px] text-purple-600">
                    <Bot className="h-3 w-3 mr-0.5" /> AI
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                #{a.id.slice(0, 8)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm mb-1">
              {a.report && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  {a.report.building}
                  {a.report.room ? `, ${a.report.room}` : ""}
                </span>
              )}
              <ArrowRight className="h-3 w-3 text-gray-300" />
              {a.technician && (
                <span className="flex items-center gap-1 font-medium">
                  <User className="h-3 w-3 text-gray-400" />
                  {a.technician.name}
                </span>
              )}
            </div>

            {a.report && (
              <p className="text-xs text-gray-500 truncate">
                {a.report.ai_description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
              <Clock className="h-3 w-3" />
              {new Date(a.created_at).toLocaleString()}
              {a.notes && <span className="italic">— {a.notes}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
