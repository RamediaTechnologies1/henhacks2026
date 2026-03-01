"use client";

import { MapPin, Clock, AlertTriangle, Bot, Sparkles, Inbox, User, UserCheck } from "lucide-react";
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
import type { Report, Assignment } from "@/lib/types";

function getSLAInfo(report: Report): { label: string; color: string; urgent: boolean } {
  const created = new Date(report.created_at).getTime();
  const now = Date.now();
  const hours = Math.floor((now - created) / (1000 * 60 * 60));
  const mins = Math.floor((now - created) / (1000 * 60)) % 60;

  const label = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  if (report.status === "resolved") return { label, color: "text-[#22c55e]", urgent: false };
  if (report.priority === "critical" && hours >= 2) return { label, color: "text-[#ef4444]", urgent: true };
  if (report.priority === "critical" && hours >= 1) return { label, color: "text-[#f97316]", urgent: true };
  if (report.priority === "high" && hours >= 4) return { label, color: "text-[#ef4444]", urgent: true };
  if (report.priority === "high" && hours >= 2) return { label, color: "text-[#f97316]", urgent: true };
  if (hours >= 8) return { label, color: "text-[#f97316]", urgent: true };
  if (hours >= 4) return { label, color: "text-[#eab308]", urgent: false };
  return { label, color: "text-[#666666]", urgent: false };
}

interface ReportsTableProps {
  reports: Report[];
  assignments: Assignment[];
  onAssign: (reportId: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  submitted: { bg: "bg-[#ffffff]/15", text: "text-[#ffffff]", dot: "bg-[#ffffff]" },
  analyzing: { bg: "bg-[#888888]/15", text: "text-[#888888]", dot: "bg-[#888888]" },
  dispatched: { bg: "bg-[#a1a1a1]/15", text: "text-[#a1a1a1]", dot: "bg-[#a1a1a1]" },
  in_progress: { bg: "bg-[#cccccc]/15", text: "text-[#cccccc]", dot: "bg-[#cccccc]" },
  resolved: { bg: "bg-[#ffffff]/15", text: "text-[#ffffff]", dot: "bg-[#ffffff]" },
};

const PRIORITY_STRIP: Record<string, string> = {
  critical: "priority-strip-critical",
  high: "priority-strip-high",
  medium: "priority-strip-medium",
  low: "priority-strip-low",
};

export function ReportsTable({
  reports,
  assignments,
  onAssign,
  statusFilter,
  onStatusFilterChange,
}: ReportsTableProps) {
  // Build a map of report_id -> assignment for quick lookup
  const assignmentByReport: Record<string, Assignment> = {};
  for (const a of assignments) {
    if (a.report_id) assignmentByReport[a.report_id] = a;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h2 className="font-bold text-lg text-[#ededed] font-[family-name:var(--font-outfit)]">Reports</h2>
          <p className="text-xs text-[#666666] mt-0.5">{reports.length} total</p>
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40 rounded-xl border-white/[0.08] bg-[#000000] text-[#a1a1a1] h-10">
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
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-7 w-7 text-[#666666]" />
          </div>
          <p className="text-[#666666] font-medium">No reports found</p>
          <p className="text-[#666666] text-sm mt-1">Reports will appear here when submitted.</p>
        </div>
      )}

      <div className="space-y-2.5 stagger-enter">
        {reports.map((report) => {
          const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.submitted;
          const reportAssignment = assignmentByReport[report.id];
          return (
            <Card key={report.id} className={`overflow-hidden rounded-2xl card-hover-lift border-white/[0.08] bg-white/[0.04] ${PRIORITY_STRIP[report.priority] || ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] font-bold rounded-lg bg-white/10 text-[#a1a1a1] border-white/[0.08]">
                      {report.trade.replace("_", " ").toUpperCase()}
                    </Badge>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {report.status.replace("_", " ").toUpperCase()}
                    </div>
                    {report.safety_concern && (
                      <Badge className="text-[10px] font-bold bg-[#ef4444] text-[#ededed] border-none">
                        <AlertTriangle className="h-3 w-3 mr-0.5" /> Safety
                      </Badge>
                    )}
                    {report.upvote_count > 1 && (
                      <Badge variant="outline" className="text-[10px] font-semibold border-white/[0.08] text-[#666666]">
                        {report.upvote_count} reports
                      </Badge>
                    )}
                  </div>
                  {report.status === "submitted" && (
                    <Button
                      size="sm"
                      onClick={() => onAssign(report.id)}
                      className="bg-[#ffffff] hover:bg-[#e5e5e5] text-black text-xs rounded-lg h-8"
                    >
                      <Sparkles className="h-3 w-3 mr-1" /> AI Assign
                    </Button>
                  )}
                </div>

                <p className="text-sm font-semibold text-[#ededed] mb-2 leading-snug">
                  {report.ai_description}
                </p>

                {/* Assignment status */}
                {reportAssignment ? (
                  <div className="flex items-center gap-2 mb-2.5 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                    <UserCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                    <span className="text-xs text-[#a1a1a1]">
                      Assigned to <span className="font-semibold text-[#ededed]">{reportAssignment.technician?.name || "Technician"}</span>
                    </span>
                    <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      reportAssignment.status === "completed" ? "bg-[#22c55e]/15 text-[#22c55e]" :
                      reportAssignment.status === "in_progress" ? "bg-[#eab308]/15 text-[#eab308]" :
                      "bg-white/10 text-[#a1a1a1]"
                    }`}>
                      {reportAssignment.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2.5 px-3 py-2 rounded-lg bg-[#ef4444]/5 border border-[#ef4444]/15">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
                    <span className="text-xs text-[#ef4444]/80 font-medium">Unassigned</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-[#666666] flex-wrap">
                  {/* Reporter */}
                  {report.reporter_email && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {report.reporter_name || report.reporter_email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {report.building}
                    {report.room ? `, ${report.room}` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                  {/* SLA Timer */}
                  {report.status !== "resolved" && (() => {
                    const sla = getSLAInfo(report);
                    return (
                      <span className={`flex items-center gap-1 font-semibold ${sla.color}`}>
                        {sla.urgent && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                        {sla.label} elapsed
                      </span>
                    );
                  })()}
                  <span className="text-[10px] font-mono text-[#444444]">
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
