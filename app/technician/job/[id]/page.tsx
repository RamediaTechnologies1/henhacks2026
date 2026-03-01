"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  AlertTriangle,
  PlayCircle,
  Loader2,
  Wrench,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FloorPlanViewer } from "@/components/floor-plan/floor-plan-viewer";
import { CompletionForm } from "@/components/technician/completion-form";
import { hasFloorPlan } from "@/lib/floor-plans";
import { toast } from "sonner";
import type { Assignment } from "@/lib/types";

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-[#ef4444]/15 border-[#ef4444]/30", text: "text-[#ef4444]" },
  high: { bg: "bg-[#f97316]/15 border-[#f97316]/30", text: "text-[#f97316]" },
  medium: { bg: "bg-[#eab308]/15 border-[#eab308]/30", text: "text-[#eab308]" },
  low: { bg: "bg-[#22c55e]/15 border-[#22c55e]/30", text: "text-[#22c55e]" },
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assignments?status=`);
        if (res.ok) {
          const data = await res.json();
          const found = data.assignments?.find(
            (a: Assignment) => a.id === params.id
          );
          setAssignment(found || null);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleAccept() {
    if (!assignment) return;
    setAccepting(true);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });
      if (res.ok) {
        toast.success("Job accepted!");
        setAssignment({ ...assignment, status: "accepted" });
      }
    } catch {
      toast.error("Failed to accept.");
    } finally {
      setAccepting(false);
    }
  }

  async function handleStartWork() {
    if (!assignment) return;
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      if (res.ok) {
        toast.success("Work started!");
        setAssignment({ ...assignment, status: "in_progress" });
      }
    } catch {
      toast.error("Failed to start.");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-white/[0.08]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-white animate-spin" />
        </div>
        <p className="text-sm text-[#666666]">Loading job details...</p>
      </div>
    );
  }

  if (!assignment || !assignment.report) {
    return (
      <div className="p-4 text-center py-16">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Wrench className="h-7 w-7 text-[#64748b]" />
        </div>
        <p className="text-[#666666] font-medium mb-1">Job not found</p>
        <p className="text-[#64748b] text-sm mb-4">This assignment may have been removed.</p>
        <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-white/[0.08] text-[#666666] hover:bg-white/5">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const report = assignment.report;
  const priority = PRIORITY_STYLES[report.priority] || PRIORITY_STYLES.medium;

  const highlightedRooms: Record<string, string> = {};
  if (report.room) {
    const roomId = `${report.building === "Gore Hall" ? "GOR" : "SMI"}-${report.room}`;
    highlightedRooms[roomId] = report.priority === "critical" ? "#ef4444" : report.priority === "high" ? "#f97316" : "#ffffff";
  }

  return (
    <div className="p-4 space-y-4 page-enter">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl text-[#666666] hover:text-[#a1a1a1] hover:bg-white/10">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Jobs
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <Badge className={`${priority.bg} ${priority.text} border font-bold text-[11px]`}>
            {report.priority === "critical" && <Zap className="h-3 w-3 mr-0.5" />}
            {report.priority.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="font-bold text-[11px] bg-white/5 text-[#a1a1a1] border-white/[0.08]">
            {report.trade.replace("_", " ").toUpperCase()}
          </Badge>
          {report.safety_concern && (
            <Badge className="font-bold text-[11px] bg-[#ef4444] text-[#ededed] border-none">
              <AlertTriangle className="h-3 w-3 mr-1" /> Safety Hazard
            </Badge>
          )}
        </div>
        <h1 className="text-lg font-bold text-[#ededed] leading-snug">{report.ai_description}</h1>
      </div>

      {/* Location + Floor Plan */}
      <Card className="rounded-2xl overflow-hidden border-white/[0.08] bg-white/[0.04]">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-white/15 p-2 rounded-xl">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-[#a1a1a1]">
              {report.building}
              {report.floor ? `, Floor ${report.floor}` : ""}
              {report.room ? `, Room ${report.room}` : ""}
            </span>
          </div>

          {report.building && hasFloorPlan(report.building) && (
            <FloorPlanViewer
              building={report.building}
              highlightedRooms={highlightedRooms}
              initialFloor={report.floor || "1"}
            />
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="rounded-2xl overflow-hidden border-white/[0.08] bg-white/[0.04]">
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">Recommended Action</p>
            <p className="text-sm text-[#a1a1a1] bg-white/10 rounded-xl p-3.5 border border-white/20 leading-relaxed">
              {report.suggested_action}
            </p>
          </div>

          <Separator className="bg-white/[0.08]" />

          <div className="bg-white/10 rounded-xl p-3 text-center border border-white/20">
            <div className="bg-white/15 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <p className="text-[10px] text-[#64748b] font-medium">Est. Time</p>
            <p className="text-xs font-bold text-[#ededed] mt-0.5">{report.estimated_time}</p>
          </div>

          {report.description && (
            <>
              <Separator className="bg-white/[0.08]" />
              <div>
                <p className="text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-1.5">Reporter Notes</p>
                <p className="text-sm text-[#a1a1a1] leading-relaxed">{report.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Photo */}
      {report.photo_base64 && (
        <Card className="rounded-2xl overflow-hidden border-white/[0.08] bg-white/[0.04]">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-2.5">Reported Photo</p>
            <img
              src={report.photo_base64}
              alt="Maintenance issue"
              className="w-full rounded-xl shadow-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {assignment.status === "pending" && (
        <Button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full h-13 rounded-xl btn-western text-[15px] font-semibold transition-all"
        >
          {accepting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" /> Accept Job
            </>
          )}
        </Button>
      )}

      {assignment.status === "accepted" && (
        <Button
          onClick={handleStartWork}
          className="w-full h-13 rounded-xl bg-gradient-to-r from-white to-[#cccccc] hover:from-[#e5e5e5] hover:to-[#b3b3b3] text-black font-bold shadow-lg shadow-white/20 text-[15px] transition-all"
        >
          <PlayCircle className="mr-2 h-5 w-5" /> Start Work
        </Button>
      )}

      {assignment.status === "in_progress" && (
        <Card className="rounded-2xl overflow-hidden border-white/30 bg-white/5">
          <CardContent className="p-5">
            <CompletionForm
              assignmentId={assignment.id}
              onComplete={() => router.push("/technician")}
            />
          </CardContent>
        </Card>
      )}

      {assignment.status === "completed" && (
        <div className="bg-white/10 border border-white/30 rounded-2xl p-5 text-center">
          <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <p className="text-[#cccccc] font-semibold text-sm">Job Completed</p>
          {assignment.completion_notes && (
            <p className="text-sm text-white mt-1">{assignment.completion_notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
