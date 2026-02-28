"use client";

import { MapPin, Clock, AlertTriangle, Bot, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Report } from "@/lib/types";

interface ReportsTableProps {
  reports: Report[];
  onAssign: (reportId: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  analyzing: "bg-yellow-100 text-yellow-700",
  dispatched: "bg-purple-100 text-purple-700",
  in_progress: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
};

const PRIORITY_ICONS: Record<string, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

export function ReportsTable({
  reports,
  onAssign,
  statusFilter,
  onStatusFilterChange,
}: ReportsTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Reports ({reports.length})</h2>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="dispatched">Dispatched</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reports.length === 0 && (
        <p className="text-center text-gray-400 py-8">No reports found.</p>
      )}

      {reports.map((report) => (
        <Card key={report.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{PRIORITY_ICONS[report.priority]}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {report.trade.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge className={`text-[10px] ${STATUS_STYLES[report.status] || ""}`}>
                  {report.status.replace("_", " ").toUpperCase()}
                </Badge>
                {report.safety_concern && (
                  <Badge variant="destructive" className="text-[10px]">
                    <AlertTriangle className="h-3 w-3 mr-0.5" /> Safety
                  </Badge>
                )}
                {report.upvote_count > 1 && (
                  <Badge variant="outline" className="text-[10px]">
                    {report.upvote_count} reports
                  </Badge>
                )}
              </div>
              {report.status === "submitted" && (
                <Button
                  size="sm"
                  onClick={() => onAssign(report.id)}
                  className="bg-[#00539F] hover:bg-[#004080] text-xs"
                >
                  <Bot className="h-3 w-3 mr-1" /> AI Assign
                </Button>
              )}
            </div>

            <p className="text-sm font-medium text-gray-900 mb-1">
              {report.ai_description}
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {report.building}
                {report.room ? `, Room ${report.room}` : ""}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(report.created_at).toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                #{report.id.slice(0, 8)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
