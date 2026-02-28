"use client";

import { MapPin, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Assignment } from "@/lib/types";

interface JobCardProps {
  assignment: Assignment;
  onClick: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const PRIORITY_ICONS: Record<string, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

export function JobCard({ assignment, onClick }: JobCardProps) {
  const report = assignment.report;
  if (!report) return null;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span>{PRIORITY_ICONS[report.priority]}</span>
            <Badge variant="secondary" className="text-[10px]">
              {report.trade.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Badge className={`text-[10px] ${STATUS_STYLES[assignment.status] || ""}`}>
              {assignment.status.replace("_", " ").toUpperCase()}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </div>
        </div>

        <p className="text-sm font-medium text-gray-900 mb-2">
          {report.ai_description}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {report.building}
            {report.room ? `, Room ${report.room}` : ""}
            {report.floor ? ` (Floor ${report.floor})` : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(assignment.created_at).toLocaleDateString()}
          </span>
          {report.safety_concern && (
            <span className="flex items-center gap-1 text-red-500">
              <AlertTriangle className="h-3 w-3" />
              Safety
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
