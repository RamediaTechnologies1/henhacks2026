"use client";

import { MapPin, Clock, AlertTriangle, Bot, Sparkles, Inbox } from "lucide-react";
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

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  submitted: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  analyzing: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  dispatched: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  in_progress: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  resolved: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
};

const PRIORITY_STRIP: Record<string, string> = {
  critical: "priority-strip-critical",
  high: "priority-strip-high",
  medium: "priority-strip-medium",
  low: "priority-strip-low",
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
        <div className="section-header">
          <h2 className="font-bold text-lg text-gray-900">Reports</h2>
          <p className="text-xs text-gray-400 mt-0.5">{reports.length} total</p>
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40 rounded-xl border-gray-200 h-10">
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
        <div className="text-center py-16">
          <div className="empty-state-circle w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No reports found</p>
          <p className="text-gray-400 text-sm mt-1">Reports will appear here when submitted.</p>
        </div>
      )}

      <div className="space-y-2.5 stagger-enter">
        {reports.map((report) => {
          const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.submitted;
          return (
            <Card key={report.id} className={`overflow-hidden rounded-2xl card-hover-lift border-gray-100 ${PRIORITY_STRIP[report.priority] || ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] font-bold rounded-lg">
                      {report.trade.replace("_", " ").toUpperCase()}
                    </Badge>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {report.status.replace("_", " ").toUpperCase()}
                    </div>
                    {report.safety_concern && (
                      <Badge variant="destructive" className="text-[10px] font-bold badge-glow-red">
                        <AlertTriangle className="h-3 w-3 mr-0.5" /> Safety
                      </Badge>
                    )}
                    {report.upvote_count > 1 && (
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {report.upvote_count} reports
                      </Badge>
                    )}
                  </div>
                  {report.status === "submitted" && (
                    <Button
                      size="sm"
                      onClick={() => onAssign(report.id)}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-xs rounded-lg shadow-sm shadow-violet-500/20 h-8"
                    >
                      <Sparkles className="h-3 w-3 mr-1" /> AI Assign
                    </Button>
                  )}
                </div>

                <p className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
                  {report.ai_description}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {report.building}
                    {report.room ? `, ${report.room}` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-gray-300">
                    #{report.id.slice(0, 8)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
