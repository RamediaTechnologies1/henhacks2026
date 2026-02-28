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

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00539F]" />
      </div>
    );
  }

  if (!assignment || !assignment.report) {
    return (
      <div className="p-4 text-center py-12">
        <p className="text-gray-400">Job not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const report = assignment.report;

  // Build room highlights for the floor plan
  const highlightedRooms: Record<string, string> = {};
  if (report.room) {
    // Find the room ID that matches this report's room label
    const roomId = `${report.building === "Gore Hall" ? "GOR" : "SMI"}-${report.room}`;
    highlightedRooms[roomId] = report.priority === "critical" ? "#fca5a5" : report.priority === "high" ? "#fed7aa" : "#fef08a";
  }

  return (
    <div className="p-4 space-y-4">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Jobs
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge className={PRIORITY_STYLES[report.priority]}>
            {report.priority.toUpperCase()}
          </Badge>
          <Badge variant="secondary">
            {report.trade.replace("_", " ").toUpperCase()}
          </Badge>
          {report.safety_concern && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" /> Safety
            </Badge>
          )}
        </div>
        <h1 className="text-lg font-bold text-gray-900">{report.ai_description}</h1>
      </div>

      {/* Location + Floor Plan */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-[#00539F]" />
            <span className="font-medium">
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
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">Suggested Action</h3>
          <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">
            {report.suggested_action}
          </p>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Est. Cost</span>
              <p className="font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> {report.estimated_cost}
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Est. Time</span>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> {report.estimated_time}
              </p>
            </div>
          </div>

          {report.description && (
            <>
              <Separator />
              <div>
                <span className="text-gray-500 text-xs">Reporter Notes</span>
                <p className="text-sm">{report.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Photo */}
      {report.photo_base64 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">Reported Photo</h3>
            <img
              src={report.photo_base64}
              alt="Maintenance issue"
              className="w-full rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {assignment.status === "pending" && (
        <Button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full bg-[#00539F] hover:bg-[#004080] h-12"
        >
          {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept Job"}
        </Button>
      )}

      {assignment.status === "accepted" && (
        <Button
          onClick={handleStartWork}
          className="w-full bg-orange-500 hover:bg-orange-600 h-12"
        >
          <PlayCircle className="mr-2 h-4 w-4" /> Start Work
        </Button>
      )}

      {assignment.status === "in_progress" && (
        <Card>
          <CardContent className="p-4">
            <CompletionForm
              assignmentId={assignment.id}
              onComplete={() => router.push("/technician")}
            />
          </CardContent>
        </Card>
      )}

      {assignment.status === "completed" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-green-700 font-medium">Job Completed</p>
          {assignment.completion_notes && (
            <p className="text-sm text-green-600 mt-1">{assignment.completion_notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
