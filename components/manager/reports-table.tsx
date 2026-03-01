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
  submitted: { bg: "bg-[#4a6fa5]/15", text: "text-[#6a8fc5]", dot: "bg-[#4a6fa5]" },
  analyzing: { bg: "bg-[#c8a55c]/15", text: "text-[#c8a55c]", dot: "bg-[#c8a55c]" },
  dispatched: { bg: "bg-[#b87333]/15", text: "text-[#d89343]", dot: "bg-[#b87333]" },
  in_progress: { bg: "bg-[#b87333]/15", text: "text-[#d89343]", dot: "bg-[#b87333]" },
  resolved: { bg: "bg-[#6b7c5e]/15", text: "text-[#8b9c7e]", dot: "bg-[#6b7c5e]" },
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
          <h2 className="font-bold text-lg text-[#f4e4c1]">Reports</h2>
          <p className="text-xs text-[#6b5e4f] mt-0.5">{reports.length} total</p>
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40 rounded-xl border-[#3d3124] bg-[#1a1410] text-[#e8d5a3] h-10">
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
          <div className="w-16 h-16 rounded-full bg-[#2d2418] flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-7 w-7 text-[#6b5e4f]" />
          </div>
          <p className="text-[#9c8e7c] font-medium">No reports found</p>
          <p className="text-[#6b5e4f] text-sm mt-1">Reports will appear here when submitted.</p>
        </div>
      )}

      <div className="space-y-2.5 stagger-enter">
        {reports.map((report) => {
          const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.submitted;
          return (
            <Card key={report.id} className={`overflow-hidden rounded-2xl card-hover-lift border-[#3d3124] bg-[#231c14] ${PRIORITY_STRIP[report.priority] || ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] font-bold rounded-lg bg-[#2d2418] text-[#e8d5a3] border-[#3d3124]">
                      {report.trade.replace("_", " ").toUpperCase()}
                    </Badge>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {report.status.replace("_", " ").toUpperCase()}
                    </div>
                    {report.safety_concern && (
                      <Badge className="text-[10px] font-bold bg-[#c44536] text-[#f4e4c1] border-none">
                        <AlertTriangle className="h-3 w-3 mr-0.5" /> Safety
                      </Badge>
                    )}
                    {report.upvote_count > 1 && (
                      <Badge variant="outline" className="text-[10px] font-semibold border-[#3d3124] text-[#9c8e7c]">
                        {report.upvote_count} reports
                      </Badge>
                    )}
                  </div>
                  {report.status === "submitted" && (
                    <Button
                      size="sm"
                      onClick={() => onAssign(report.id)}
                      className="btn-western text-xs rounded-lg h-8"
                    >
                      <Sparkles className="h-3 w-3 mr-1" /> AI Assign
                    </Button>
                  )}
                </div>

                <p className="text-sm font-semibold text-[#f4e4c1] mb-2 leading-snug">
                  {report.ai_description}
                </p>

                <div className="flex items-center gap-3 text-xs text-[#6b5e4f]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {report.building}
                    {report.room ? `, ${report.room}` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-[#4d3f30]">
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
