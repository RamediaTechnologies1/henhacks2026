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
  EyeOff,
  Eye,
  ShieldAlert,
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
import { VoiceInput } from "./voice-input";
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

interface ReportFormProps {
  prefill?: { building: string; floor: string; room: string };
}

export function ReportForm({ prefill }: ReportFormProps) {
  const [step, setStep] = useState<Step>("photo");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [building, setBuilding] = useState(prefill?.building || "");
  const [selectedRoom, setSelectedRoom] = useState<FloorPlanRoom | null>(null);
  const [floor, setFloor] = useState(prefill?.floor || "");
  const [room, setRoom] = useState(prefill?.room || "");
  const [description, setDescription] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

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
        body: JSON.stringify({ photo_base64: photoBase64 }),
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
          anonymous,
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
    setFloor(""); setRoom(""); setDescription(""); setAiAnalysis(null); setAnonymous(false);
  }

  const currentStepIndex = STEPS.findIndex(
    (s) => s.key === step || (step === "analyzing" && s.key === "review") || (step === "submitted" && s.key === "review")
  );

  if (step === "submitted") {
    const isSafety = aiAnalysis?.safety_concern;
    const isCritical = aiAnalysis?.priority === "critical";
    return (
      <div className="p-6 text-center py-10 page-enter space-y-5">
        <div className="relative inline-block mb-2">
          <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-20" />
          <div className="relative bg-gradient-to-br from-white to-[#e5e5e5] p-5 rounded-full shadow-lg shadow-white/30">
            <PartyPopper className="h-10 w-10 text-black" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#ededed]">Report Submitted!</h2>
        <p className="text-[#666666] max-w-xs mx-auto leading-relaxed">
          Our AI has analyzed and dispatched your report to the maintenance team.
        </p>

        {/* Safety escalation transparency */}
        {isSafety && (
          <div className="text-left mx-auto max-w-xs bg-[#ef4444]/[0.05] border border-[#ef4444]/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#ef4444]" />
              <span className="text-xs font-bold text-[#ef4444]">Safety Alert Triggered</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-[#a1a1a1]">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-[#22c55e] flex-shrink-0" />
                Safety team notified immediately
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-[#22c55e] flex-shrink-0" />
                Report prioritized in dispatch queue
              </p>
              {isCritical && (
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-[#22c55e] flex-shrink-0" />
                  Auto-escalated to campus safety director
                </p>
              )}
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-[#22c55e] flex-shrink-0" />
                Technician dispatched for immediate response
              </p>
            </div>
          </div>
        )}

        {/* Privacy confirmation */}
        {anonymous && (
          <div className="text-left mx-auto max-w-xs bg-[#22c55e]/[0.05] border border-[#22c55e]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <EyeOff className="h-4 w-4 text-[#22c55e]" />
              <span className="text-xs font-bold text-[#22c55e]">Identity Protected</span>
            </div>
            <p className="text-[11px] text-[#a1a1a1] leading-relaxed">
              Your report was submitted anonymously. Your name and email are not stored or visible to anyone.
            </p>
          </div>
        )}

        {/* Data transparency */}
        <div className="text-left mx-auto max-w-xs bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
          <p className="text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-2">What happens with your data</p>
          <div className="space-y-1.5 text-[10px] text-[#666666]">
            <p>Your photo is analyzed by AI and stored securely for the work order.</p>
            <p>Location data is used only to dispatch the correct maintenance team.</p>
            {!anonymous && <p>Your contact info may be used for follow-up on this report only.</p>}
            <p>Reports are automatically deleted after resolution + 90 days.</p>
          </div>
        </div>

        <Button onClick={resetForm} className="btn-western rounded-xl h-12 px-8">
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
                      ? "bg-gradient-to-br from-white to-white text-black shadow-lg shadow-white/30 scale-110"
                      : isActive
                        ? "bg-white text-black"
                        : "bg-white/5 text-[#64748b]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "text-white" : "text-[#64748b]"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-10 h-0.5 mx-1 mb-4 rounded-full transition-colors ${i < currentStepIndex ? "bg-white" : "bg-white/[0.08]"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Photo */}
      {step === "photo" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#ededed]">Capture the Issue</h2>
            <p className="text-sm text-[#666666] mt-1">Take a clear photo so our AI can analyze it.</p>
          </div>
          <CameraCapture
            onCapture={(base64) => setPhotoBase64(base64)}
            photoPreview={photoBase64}
            onClear={() => setPhotoBase64(null)}
          />
          <Button
            onClick={() => setStep("location")}
            disabled={!photoBase64}
            className="w-full h-12 rounded-xl btn-western text-[15px] font-semibold transition-all"
          >
            Next: Select Location <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Location */}
      {step === "location" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#ededed]">Where is the issue?</h2>
            <p className="text-sm text-[#666666] mt-1">Select the building and tap the room.</p>
          </div>

          <Select value={building} onValueChange={(val) => { setBuilding(val); setSelectedRoom(null); }}>
            <SelectTrigger className="h-12 rounded-xl text-[15px] border-white/[0.08] bg-white/[0.03] text-[#ededed]">
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
            <div className="flex items-center gap-2 bg-white/10 border border-white/30 rounded-xl p-3.5">
              <MapPin className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-[#a1a1a1]">
                {building}, Floor {selectedRoom.floor}, Room {selectedRoom.label}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("photo")} className="flex-1 h-12 rounded-xl border-white/[0.08] text-[#666666] hover:bg-white/5 hover:text-[#a1a1a1]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => setStep("details")}
              disabled={!building || !selectedRoom}
              className="flex-1 h-12 rounded-xl btn-western"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === "details" && (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#ededed]">Describe the Issue</h2>
              <p className="text-sm text-[#666666] mt-1">Type or use voice input.</p>
            </div>
            <VoiceInput
              onTranscript={(text) => setDescription((prev) => prev ? `${prev} ${text}` : text)}
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., The AC unit is making loud rattling noises and not cooling the room..."
            className="w-full h-28 px-4 py-3 text-sm border border-white/[0.08] rounded-xl resize-none focus:border-white focus:ring-2 focus:ring-white/10 outline-none bg-white/[0.03] text-[#ededed] placeholder:text-[#64748b]"
          />

          {/* Anonymous Reporting Toggle */}
          <button
            type="button"
            onClick={() => setAnonymous(!anonymous)}
            className={`flex items-center gap-2.5 w-full p-3 rounded-xl border transition-all ${
              anonymous
                ? "bg-[#22c55e]/10 border-[#22c55e]/30"
                : "bg-white/[0.03] border-white/[0.08]"
            }`}
          >
            {anonymous ? (
              <EyeOff className="h-4 w-4 text-[#22c55e]" />
            ) : (
              <Eye className="h-4 w-4 text-[#666666]" />
            )}
            <div className="text-left">
              <p className={`text-xs font-semibold ${anonymous ? "text-[#22c55e]" : "text-[#a1a1a1]"}`}>
                {anonymous ? "Anonymous Report — Identity Protected" : "Report Anonymously"}
              </p>
              <p className="text-[10px] text-[#666666]">
                {anonymous ? "Your identity will not be shared with anyone" : "Toggle to hide your identity from technicians and reports"}
              </p>
            </div>
          </button>

          {/* Mini summary */}
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.08]">
            {photoBase64 && <img src={photoBase64} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />}
            <div className="text-xs text-[#666666]">
              <p className="font-semibold text-[#a1a1a1]">{building}</p>
              <p>Floor {selectedRoom?.floor || floor}, Room {selectedRoom?.label || room}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("location")} className="flex-1 h-12 rounded-xl border-white/[0.08] text-[#666666] hover:bg-white/5 hover:text-[#a1a1a1]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleAnalyze}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-white to-[#cccccc] hover:from-white hover:to-[#b3b3b3] text-black font-bold shadow-lg shadow-white/20"
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
            <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-white/[0.08]" />
              <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-[#cccccc] animate-spin" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white to-white flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-black" />
              </div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-[#ededed]">AI Analyzing Your Photo</h3>
          <p className="text-sm text-[#666666] mt-2 max-w-xs mx-auto">
            Identifying trade type, assessing priority, and generating recommended actions...
          </p>
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white animate-bounce"
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
          <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.08]">
            {photoBase64 && <img src={photoBase64} alt="Preview" className="w-14 h-14 rounded-xl object-cover shadow" />}
            <div className="text-sm">
              <p className="font-semibold text-[#a1a1a1]">{building}, Room {selectedRoom?.label || room}</p>
              <p className="text-[#64748b] text-xs">Floor {selectedRoom?.floor || floor}</p>
              {description && <p className="text-[#666666] text-xs mt-1 line-clamp-1">{description}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("details")} className="flex-1 h-12 rounded-xl border-white/[0.08] text-[#666666] hover:bg-white/5 hover:text-[#a1a1a1]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 h-12 rounded-xl btn-sage"
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
