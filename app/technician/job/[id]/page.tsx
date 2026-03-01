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
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloorPlanViewer } from "@/components/floor-plan/floor-plan-viewer";
import { CompletionForm } from "@/components/technician/completion-form";
import { hasFloorPlan } from "@/lib/floor-plans";
import { toast } from "sonner";
import type { Assignment } from "@/lib/types";

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", border: "border-[#DC2626]/20" },
  high: { bg: "bg-[#FFFBEB]", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
  medium: { bg: "bg-[#EFF6FF]", text: "text-[#00539F]", border: "border-[#00539F]/20" },
  low: { bg: "bg-[#ECFDF5]", text: "text-[#10B981]", border: "border-[#10B981]/20" },
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
        <div className="w-8 h-8 rounded-full border-2 border-[#E5E7EB] border-t-[#00539F] animate-spin" />
        <p className="text-[13px] text-[#6B7280]">Loading job details...</p>
      </div>
    );
  }

  if (!assignment || !assignment.report) {
    return (
      <div className="p-6 text-center py-16">
        <p className="text-[14px] text-[#6B7280] mb-1">Job not found</p>
        <p className="text-[13px] text-[#9CA3AF] mb-4">This assignment may have been removed.</p>
        <Button variant="outline" onClick={() => router.back()} className="rounded-[6px] border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </Button>
      </div>
    );
  }

  const report = assignment.report;
  const priority = PRIORITY_CONFIG[report.priority] || PRIORITY_CONFIG.medium;

  const highlightedRooms: Record<string, string> = {};
  if (report.room) {
    const roomId = `${report.building === "Gore Hall" ? "GOR" : "SMI"}-${report.room}`;
    highlightedRooms[roomId] = report.priority === "critical" ? "#DC2626" : report.priority === "high" ? "#F59E0B" : "#00539F";
  }

  return (
    <div className="p-6 space-y-4">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-[6px] text-[13px] text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6] -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to jobs
      </Button>

      {/* Header badges */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium border ${priority.bg} ${priority.text} ${priority.border}`}>
            {report.priority}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
            {report.trade.replace("_", " ")}
          </span>
          {report.safety_concern && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[12px] font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
              <AlertTriangle className="h-3 w-3" /> safety hazard
            </span>
          )}
        </div>
        <h1 className="text-[16px] font-medium text-[#111111] leading-snug">{report.ai_description}</h1>
      </div>

      {/* Location + Floor Plan */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] space-y-3">
        <div className="flex items-center gap-2 text-[14px]">
          <MapPin className="h-4 w-4 text-[#6B7280]" />
          <span className="text-[#111111]">
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
      </div>

      {/* Details */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] space-y-4">
        <div>
          <p className="text-[13px] text-[#6B7280] mb-1">Recommended action</p>
          <p className="text-[14px] text-[#111111] leading-relaxed">
            {report.suggested_action}
          </p>
        </div>

        <div className="border-t border-[#E5E7EB] pt-3">
          <div className="flex items-center gap-2 text-[14px]">
            <Clock className="h-4 w-4 text-[#6B7280]" />
            <span className="text-[13px] text-[#6B7280]">Est. time:</span>
            <span className="text-[14px] font-medium text-[#111111]">{report.estimated_time}</span>
          </div>
        </div>

        {report.description && (
          <div className="border-t border-[#E5E7EB] pt-3">
            <p className="text-[13px] text-[#6B7280] mb-1">Reporter notes</p>
            <p className="text-[14px] text-[#111111] leading-relaxed">{report.description}</p>
          </div>
        )}
      </div>

      {/* Photo */}
      {report.photo_base64 && (
        <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-[13px] text-[#6B7280] mb-2">Reported photo</p>
          <img
            src={report.photo_base64}
            alt="Maintenance issue"
            className="w-full rounded-[6px] border border-[#E5E7EB]"
          />
        </div>
      )}

      {/* Actions */}
      {assignment.status === "pending" && (
        <Button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full h-11 rounded-[6px] bg-[#00539F] hover:bg-[#003d75] text-white text-[14px] font-medium disabled:opacity-50"
        >
          {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept job"}
        </Button>
      )}

      {assignment.status === "accepted" && (
        <Button
          onClick={handleStartWork}
          className="w-full h-11 rounded-[6px] bg-[#00539F] hover:bg-[#003d75] text-white text-[14px] font-medium"
        >
          <PlayCircle className="mr-2 h-4 w-4" /> Start work
        </Button>
      )}

      {assignment.status === "in_progress" && (
        <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <CompletionForm
            assignmentId={assignment.id}
            onComplete={() => router.push("/technician")}
          />
        </div>
      )}

      {assignment.status === "completed" && (
        <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-[6px] p-4 text-center">
          <CheckCircle2 className="h-6 w-6 text-[#10B981] mx-auto mb-2" />
          <p className="text-[14px] font-medium text-[#10B981]">Job completed</p>
          {assignment.completion_notes && (
            <p className="text-[13px] text-[#6B7280] mt-1">{assignment.completion_notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
