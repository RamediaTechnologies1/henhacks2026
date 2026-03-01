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
  critical: { bg: "bg-red-50 border-red-200", text: "text-red-700" },
  high: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700" },
  medium: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  low: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
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
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#00539F] animate-spin" />
        </div>
        <p className="text-sm text-gray-400">Loading job details...</p>
      </div>
    );
  }

  if (!assignment || !assignment.report) {
    return (
      <div className="p-4 text-center py-16">
        <div className="empty-state-circle w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wrench className="h-7 w-7 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium mb-1">Job not found</p>
        <p className="text-gray-400 text-sm mb-4">This assignment may have been removed.</p>
        <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
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
    highlightedRooms[roomId] = report.priority === "critical" ? "#fca5a5" : report.priority === "high" ? "#fed7aa" : "#fef08a";
  }

  return (
    <div className="p-4 space-y-4 page-enter">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Jobs
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <Badge className={`${priority.bg} ${priority.text} border font-bold text-[11px]`}>
            {report.priority === "critical" && <Zap className="h-3 w-3 mr-0.5" />}
            {report.priority.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="font-bold text-[11px]">
            {report.trade.replace("_", " ").toUpperCase()}
          </Badge>
          {report.safety_concern && (
            <Badge variant="destructive" className="font-bold text-[11px] badge-glow-red">
              <AlertTriangle className="h-3 w-3 mr-1" /> Safety Hazard
            </Badge>
          )}
        </div>
        <h1 className="text-lg font-bold text-gray-900 leading-snug">{report.ai_description}</h1>
      </div>

      {/* Location + Floor Plan */}
      <Card className="rounded-2xl overflow-hidden border-gray-100">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-blue-50 p-2 rounded-xl">
              <MapPin className="h-4 w-4 text-[#00539F]" />
            </div>
            <span className="font-semibold text-gray-800">
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
      <Card className="rounded-2xl overflow-hidden border-gray-100">
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-[11px] font-bold text-[#00539F] uppercase tracking-wider mb-2">Recommended Action</p>
            <p className="text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3.5 border border-blue-100/60 leading-relaxed">
              {report.suggested_action}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/60 rounded-xl p-3 text-center border border-emerald-100/60">
              <div className="bg-emerald-100 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Est. Cost</p>
              <p className="text-xs font-bold text-gray-800 mt-0.5">{report.estimated_cost}</p>
            </div>
            <div className="bg-blue-50/60 rounded-xl p-3 text-center border border-blue-100/60">
              <div className="bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Est. Time</p>
              <p className="text-xs font-bold text-gray-800 mt-0.5">{report.estimated_time}</p>
            </div>
          </div>

          {report.description && (
            <>
              <Separator />
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reporter Notes</p>
                <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Photo */}
      {report.photo_base64 && (
        <Card className="rounded-2xl overflow-hidden border-gray-100">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Reported Photo</p>
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
          className="w-full h-13 rounded-xl bg-gradient-to-r from-[#00539F] to-[#0066cc] hover:from-[#004080] hover:to-[#00539F] shadow-lg shadow-blue-500/20 text-[15px] font-semibold transition-all"
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
          className="w-full h-13 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 text-[15px] font-semibold transition-all"
        >
          <PlayCircle className="mr-2 h-5 w-5" /> Start Work
        </Button>
      )}

      {assignment.status === "in_progress" && (
        <Card className="rounded-2xl overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-green-50/20">
          <CardContent className="p-5">
            <CompletionForm
              assignmentId={assignment.id}
              onComplete={() => router.push("/technician")}
            />
          </CardContent>
        </Card>
      )}

      {assignment.status === "completed" && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-2xl p-5 text-center">
          <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-emerald-700 font-semibold text-sm">Job Completed</p>
          {assignment.completion_notes && (
            <p className="text-sm text-emerald-600/80 mt-1">{assignment.completion_notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
