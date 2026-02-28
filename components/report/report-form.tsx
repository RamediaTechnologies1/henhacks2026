"use client";

import { useState } from "react";
import { Send, Loader2, MapPin, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CameraCapture } from "./camera-capture";
import { AIAnalysisDisplay } from "./ai-analysis-display";
import { FloorPlanViewer } from "@/components/floor-plan/floor-plan-viewer";
import { hasFloorPlan } from "@/lib/floor-plans";
import { DEMO_BUILDINGS } from "@/lib/constants";
import type { AIAnalysis, FloorPlanRoom } from "@/lib/types";

type Step = "photo" | "location" | "details" | "analyzing" | "review" | "submitted";

export function ReportForm() {
  const [step, setStep] = useState<Step>("photo");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [building, setBuilding] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<FloorPlanRoom | null>(null);
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleRoomSelect(roomData: FloorPlanRoom) {
    setSelectedRoom(roomData);
    setRoom(roomData.label);
    setFloor(roomData.floor);
  }

  async function handleAnalyze() {
    if (!photoBase64) return;

    setStep("analyzing");
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: photoBase64.replace(/^data:image\/\w+;base64,/, ""),
        }),
      });

      if (!res.ok) {
        toast.error("AI analysis failed. Try again.");
        setStep("details");
        return;
      }

      const data = await res.json();
      setAiAnalysis(data.analysis);
      setStep("review");
    } catch {
      toast.error("AI analysis failed. Try again.");
      setStep("details");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!aiAnalysis || !photoBase64) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building,
          room: selectedRoom?.label || room,
          floor: selectedRoom?.floor || floor,
          description,
          photo_base64: photoBase64,
          ai_analysis: aiAnalysis,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to submit report.");
        return;
      }

      const data = await res.json();
      if (data.deduplicated) {
        toast.success("Similar report found — your upvote was added!");
      } else {
        toast.success("Report submitted successfully!");
      }
      setStep("submitted");
    } catch {
      toast.error("Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setStep("photo");
    setPhotoBase64(null);
    setBuilding("");
    setSelectedRoom(null);
    setFloor("");
    setRoom("");
    setDescription("");
    setAiAnalysis(null);
  }

  // Step indicator
  const steps = [
    { key: "photo", label: "Photo" },
    { key: "location", label: "Location" },
    { key: "details", label: "Details" },
    { key: "review", label: "Review" },
  ];

  const currentStepIndex = steps.findIndex(
    (s) =>
      s.key === step ||
      (step === "analyzing" && s.key === "review") ||
      (step === "submitted" && s.key === "review")
  );

  if (step === "submitted") {
    return (
      <div className="p-4 text-center py-16">
        <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
        <p className="text-gray-500 mb-6">
          Our AI has dispatched your report to the appropriate team. You&apos;ll receive updates via email.
        </p>
        <Button onClick={resetForm} className="bg-[#00539F] hover:bg-[#004080]">
          Report Another Issue
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Progress Steps */}
      <div className="flex items-center justify-between px-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i <= currentStepIndex
                  ? "bg-[#00539F] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`ml-1.5 text-[11px] font-medium ${
                i <= currentStepIndex ? "text-[#00539F]" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 ${
                  i < currentStepIndex ? "bg-[#00539F]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Photo */}
      {step === "photo" && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Take a Photo</h2>
            <p className="text-sm text-gray-500">
              Snap a photo of the maintenance issue. Our AI will analyze it.
            </p>
            <CameraCapture
              onCapture={(base64) => setPhotoBase64(base64)}
              photoPreview={photoBase64}
              onClear={() => setPhotoBase64(null)}
            />
            <Button
              onClick={() => setStep("location")}
              disabled={!photoBase64}
              className="w-full bg-[#00539F] hover:bg-[#004080]"
            >
              Next: Select Location
              <MapPin className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Location */}
      {step === "location" && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Select Location</h2>
            <p className="text-sm text-gray-500">
              Choose the building and tap the room on the floor plan.
            </p>

            {/* Building Select */}
            <Select value={building} onValueChange={(val) => { setBuilding(val); setSelectedRoom(null); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Building" />
              </SelectTrigger>
              <SelectContent>
                {DEMO_BUILDINGS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Floor Plan or Manual Input */}
            {building && hasFloorPlan(building) && (
              <FloorPlanViewer
                building={building}
                onRoomSelect={handleRoomSelect}
                selectedRoomId={selectedRoom?.id}
              />
            )}

            {selectedRoom && (
              <div className="bg-[#FFD200]/20 border border-[#FFD200] rounded-lg p-3 text-sm">
                <span className="font-medium">Selected:</span> {building}, Floor{" "}
                {selectedRoom.floor}, Room {selectedRoom.label}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("photo")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep("details")}
                disabled={!building || !selectedRoom}
                className="flex-1 bg-[#00539F] hover:bg-[#004080]"
              >
                Next: Add Details
                <MessageSquare className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Details */}
      {step === "details" && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Describe the Issue</h2>
            <p className="text-sm text-gray-500">
              Add any additional details about the maintenance issue.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., The AC unit is making loud rattling noises and not cooling the room..."
              className="w-full h-24 px-3 py-2 text-sm border rounded-lg resize-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]/20 outline-none"
            />

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Location:</span>{" "}
                <span className="font-medium">
                  {building}, Floor {selectedRoom?.floor || floor}, Room{" "}
                  {selectedRoom?.label || room}
                </span>
              </p>
              {photoBase64 && (
                <img
                  src={photoBase64}
                  alt="Preview"
                  className="w-16 h-16 rounded object-cover mt-2"
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("location")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleAnalyze}
                className="flex-1 bg-[#00539F] hover:bg-[#004080]"
              >
                Analyze with AI
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3.5: Analyzing */}
      {step === "analyzing" && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center py-8 space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-[#00539F]/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#00539F] animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-[#00539F]">
                AI Analyzing Your Photo...
              </h3>
              <p className="text-sm text-gray-500">
                Identifying trade type, priority, and recommended action
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === "review" && aiAnalysis && (
        <div className="space-y-4">
          <AIAnalysisDisplay analysis={aiAnalysis} />

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Report Summary</h3>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-gray-500">Location:</span>{" "}
                  {building}, Floor {selectedRoom?.floor || floor}, Room{" "}
                  {selectedRoom?.label || room}
                </p>
                {description && (
                  <p>
                    <span className="text-gray-500">Your note:</span> {description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Submit Report
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
