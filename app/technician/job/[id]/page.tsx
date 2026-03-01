"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  AlertTriangle,
  DollarSign,
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
  critical: { bg: "bg-[#c44536]/15 border-[#c44536]/30", text: "text-[#e85a4a]" },
  high: { bg: "bg-[#b87333]/15 border-[#b87333]/30", text: "text-[#d89343]" },
  medium: { bg: "bg-[#c8a55c]/15 border-[#c8a55c]/30", text: "text-[#c8a55c]" },
  low: { bg: "bg-[#6b7c5e]/15 border-[#6b7c5e]/30", text: "text-[#8b9c7e]" },
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
          <div className="absolute inset-0 rounded-full border-4 border-[#3d3124]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#c8a55c] animate-spin" />
        </div>
        <p className="text-sm text-[#9c8e7c]">Loading job details...</p>
      </div>
    );
  }

  if (!assignment || !assignment.report) {
    return (
      <div className="p-4 text-center py-16">
        <div className="w-16 h-16 rounded-full bg-[#2d2418] flex items-center justify-center mx-auto mb-4">
          <Wrench className="h-7 w-7 text-[#6b5e4f]" />
        </div>
        <p className="text-[#9c8e7c] font-medium mb-1">Job not found</p>
        <p className="text-[#6b5e4f] text-sm mb-4">This assignment may have been removed.</p>
        <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-[#3d3124] text-[#9c8e7c] hover:bg-[#2d2418]">
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
    highlightedRooms[roomId] = report.priority === "critical" ? "#c44536" : report.priority === "high" ? "#b87333" : "#c8a55c";
  }

  return (
    <div className="p-4 space-y-4 page-enter">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl text-[#9c8e7c] hover:text-[#e8d5a3] hover:bg-[#2d2418]">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Jobs
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <Badge className={`${priority.bg} ${priority.text} border font-bold text-[11px]`}>
            {report.priority === "critical" && <Zap className="h-3 w-3 mr-0.5" />}
            {report.priority.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="font-bold text-[11px] bg-[#2d2418] text-[#e8d5a3] border-[#3d3124]">
            {report.trade.replace("_", " ").toUpperCase()}
          </Badge>
          {report.safety_concern && (
            <Badge className="font-bold text-[11px] bg-[#c44536] text-[#f4e4c1] border-none">
              <AlertTriangle className="h-3 w-3 mr-1" /> Safety Hazard
            </Badge>
          )}
        </div>
        <h1 className="text-lg font-bold text-[#f4e4c1] leading-snug">{report.ai_description}</h1>
      </div>

      {/* Location + Floor Plan */}
      <Card className="rounded-2xl overflow-hidden border-[#3d3124] bg-[#231c14]">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-[#c8a55c]/15 p-2 rounded-xl">
              <MapPin className="h-4 w-4 text-[#c8a55c]" />
            </div>
            <span className="font-semibold text-[#e8d5a3]">
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
      <Card className="rounded-2xl overflow-hidden border-[#3d3124] bg-[#231c14]">
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-[11px] font-bold text-[#c8a55c] uppercase tracking-wider mb-2">Recommended Action</p>
            <p className="text-sm text-[#e8d5a3] bg-[#c8a55c]/10 rounded-xl p-3.5 border border-[#c8a55c]/20 leading-relaxed">
              {report.suggested_action}
            </p>
          </div>

          <Separator className="bg-[#3d3124]" />

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#6b7c5e]/10 rounded-xl p-3 text-center border border-[#6b7c5e]/20">
              <div className="bg-[#6b7c5e]/15 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <DollarSign className="h-4 w-4 text-[#6b7c5e]" />
              </div>
              <p className="text-[10px] text-[#6b5e4f] font-medium">Est. Cost</p>
              <p className="text-xs font-bold text-[#f4e4c1] mt-0.5">{report.estimated_cost}</p>
            </div>
            <div className="bg-[#4a6fa5]/10 rounded-xl p-3 text-center border border-[#4a6fa5]/20">
              <div className="bg-[#4a6fa5]/15 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <Clock className="h-4 w-4 text-[#4a6fa5]" />
              </div>
              <p className="text-[10px] text-[#6b5e4f] font-medium">Est. Time</p>
              <p className="text-xs font-bold text-[#f4e4c1] mt-0.5">{report.estimated_time}</p>
            </div>
          </div>

          {report.description && (
            <>
              <Separator className="bg-[#3d3124]" />
              <div>
                <p className="text-[11px] font-bold text-[#9c8e7c] uppercase tracking-wider mb-1.5">Reporter Notes</p>
                <p className="text-sm text-[#e8d5a3] leading-relaxed">{report.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Photo */}
      {report.photo_base64 && (
        <Card className="rounded-2xl overflow-hidden border-[#3d3124] bg-[#231c14]">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold text-[#9c8e7c] uppercase tracking-wider mb-2.5">Reported Photo</p>
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
          className="w-full h-13 rounded-xl bg-gradient-to-r from-[#b87333] to-[#c8a55c] hover:from-[#a86323] hover:to-[#b8953c] text-[#0d0a07] font-bold shadow-lg shadow-[#b87333]/20 text-[15px] transition-all"
        >
          <PlayCircle className="mr-2 h-5 w-5" /> Start Work
        </Button>
      )}

      {assignment.status === "in_progress" && (
        <Card className="rounded-2xl overflow-hidden border-[#6b7c5e]/30 bg-[#6b7c5e]/5">
          <CardContent className="p-5">
            <CompletionForm
              assignmentId={assignment.id}
              onComplete={() => router.push("/technician")}
            />
          </CardContent>
        </Card>
      )}

      {assignment.status === "completed" && (
        <div className="bg-[#6b7c5e]/10 border border-[#6b7c5e]/30 rounded-2xl p-5 text-center">
          <div className="bg-[#6b7c5e]/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="h-6 w-6 text-[#6b7c5e]" />
          </div>
          <p className="text-[#8b9c7e] font-semibold text-sm">Job Completed</p>
          {assignment.completion_notes && (
            <p className="text-sm text-[#6b7c5e] mt-1">{assignment.completion_notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
