"use client";

import { useState } from "react";
import {
  Send,
  Loader2,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Camera,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const STEPS = [
  { key: "photo", label: "Photo", icon: Camera },
  { key: "location", label: "Location", icon: MapPin },
  { key: "details", label: "Details", icon: MessageSquare },
  { key: "review", label: "Review", icon: Sparkles },
];

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
        body: JSON.stringify({ image: photoBase64.replace(/^data:image\/\w+;base64,/, "") }),
      });
      if (!res.ok) { toast.error("AI analysis failed"); setStep("details"); return; }
      const data = await res.json();
      setAiAnalysis(data.analysis);
      setStep("review");
    } catch { toast.error("AI analysis failed"); setStep("details"); }
    finally { setLoading(false); }
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
      if (!res.ok) { toast.error("Submission failed"); return; }
      const data = await res.json();
      toast.success(data.deduplicated ? "Similar report found — upvote added!" : "Report submitted!");
      setStep("submitted");
    } catch { toast.error("Submission failed"); }
    finally { setSubmitting(false); }
  }

  function resetForm() {
    setStep("photo"); setPhotoBase64(null); setBuilding(""); setSelectedRoom(null);
    setFloor(""); setRoom(""); setDescription(""); setAiAnalysis(null);
  }

  const currentStepIndex = STEPS.findIndex(
    (s) => s.key === step || (step === "analyzing" && s.key === "review") || (step === "submitted" && s.key === "review")
  );

  if (step === "submitted") {
    return (
      <div className="p-6 text-center py-16 page-enter">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20" />
          <div className="relative bg-gradient-to-br from-emerald-400 to-green-500 p-5 rounded-full shadow-lg shadow-emerald-500/30">
            <PartyPopper className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">
          Our AI has analyzed and dispatched your report to the maintenance team.
        </p>
        <Button onClick={resetForm} className="bg-gradient-to-r from-[#00539F] to-[#0066cc] hover:from-[#004080] hover:to-[#00539F] rounded-xl h-12 px-8 shadow-lg shadow-blue-500/20">
          Report Another Issue
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 page-enter">
      {/* Progress Steps */}
      <div className="flex items-center justify-between px-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i <= currentStepIndex;
          const isCurrent = i === currentStepIndex;
          return (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? "bg-gradient-to-br from-[#00539F] to-[#0066cc] text-white shadow-lg shadow-blue-500/30 scale-110"
                      : isActive
                        ? "bg-[#00539F] text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "text-[#00539F]" : "text-gray-300"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-10 h-0.5 mx-1 mb-4 rounded-full transition-colors ${i < currentStepIndex ? "bg-[#00539F]" : "bg-gray-100"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Photo */}
      {step === "photo" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Capture the Issue</h2>
            <p className="text-sm text-gray-500 mt-1">Take a clear photo so our AI can analyze it.</p>
          </div>
          <CameraCapture
            onCapture={(base64) => setPhotoBase64(base64)}
            photoPreview={photoBase64}
            onClear={() => setPhotoBase64(null)}
          />
          <Button
            onClick={() => setStep("location")}
            disabled={!photoBase64}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00539F] to-[#0066cc] hover:from-[#004080] hover:to-[#00539F] text-[15px] font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            Next: Select Location <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Location */}
      {step === "location" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Where is the issue?</h2>
            <p className="text-sm text-gray-500 mt-1">Select the building and tap the room.</p>
          </div>

          <Select value={building} onValueChange={(val) => { setBuilding(val); setSelectedRoom(null); }}>
            <SelectTrigger className="h-12 rounded-xl text-[15px] border-gray-200">
              <SelectValue placeholder="Select Building" />
            </SelectTrigger>
            <SelectContent>
              {DEMO_BUILDINGS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>

          {building && hasFloorPlan(building) && (
            <FloorPlanViewer
              building={building}
              onRoomSelect={handleRoomSelect}
              selectedRoomId={selectedRoom?.id}
            />
          )}

          {selectedRoom && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFD200]/15 to-amber-50 border border-[#FFD200]/40 rounded-xl p-3.5">
              <MapPin className="h-4 w-4 text-[#00539F]" />
              <span className="text-sm font-medium text-gray-800">
                {building}, Floor {selectedRoom.floor}, Room {selectedRoom.label}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("photo")} className="flex-1 h-12 rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => setStep("details")}
              disabled={!building || !selectedRoom}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#00539F] to-[#0066cc] shadow-lg shadow-blue-500/20"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === "details" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Describe the Issue</h2>
            <p className="text-sm text-gray-500 mt-1">Help the maintenance team understand the problem.</p>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., The AC unit is making loud rattling noises and not cooling the room..."
            className="w-full h-28 px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]/10 outline-none bg-gray-50/50 placeholder:text-gray-400"
          />

          {/* Mini summary */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            {photoBase64 && <img src={photoBase64} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />}
            <div className="text-xs text-gray-500">
              <p className="font-semibold text-gray-700">{building}</p>
              <p>Floor {selectedRoom?.floor || floor}, Room {selectedRoom?.label || room}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("location")} className="flex-1 h-12 rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleAnalyze}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Analyze with AI
            </Button>
          </div>
        </div>
      )}

      {/* Analyzing */}
      {step === "analyzing" && (
        <div className="text-center py-12 page-enter">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-[#00539F] rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#00539F] border-r-[#FFD200] animate-spin" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#00539F] to-[#0066cc] flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">AI Analyzing Your Photo</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
            Identifying trade type, assessing priority, and generating recommended actions...
          </p>
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#00539F] animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === "review" && aiAnalysis && (
        <div className="space-y-4 stagger-enter">
          <AIAnalysisDisplay analysis={aiAnalysis} />

          {/* Location summary */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            {photoBase64 && <img src={photoBase64} alt="Preview" className="w-14 h-14 rounded-xl object-cover shadow" />}
            <div className="text-sm">
              <p className="font-semibold text-gray-800">{building}, Room {selectedRoom?.label || room}</p>
              <p className="text-gray-400 text-xs">Floor {selectedRoom?.floor || floor}</p>
              {description && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{description}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("details")} className="flex-1 h-12 rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/20"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> Submit Report</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
