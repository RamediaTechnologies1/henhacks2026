"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Glasses, Mic, MicOff, Volume2, Camera, X } from "lucide-react";
import { useVoiceAssistant } from "@/lib/hooks/use-voice-assistant";
import type { Assignment } from "@/lib/types";

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
function priorityRank(p: string) {
  return PRIORITY_ORDER[p as keyof typeof PRIORITY_ORDER] ?? 4;
}

interface GlassesAssistantProps {
  email: string;
}

export function GlassesAssistant({ email }: GlassesAssistantProps) {
  const [active, setActive] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [techName, setTechName] = useState("Technician");
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState("");
  const [lastHeard, setLastHeard] = useState("");
  const [expanded, setExpanded] = useState(false);

  const assignmentsRef = useRef<Assignment[]>([]);
  const prevIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const capturedImageRef = useRef<string | null>(null);

  assignmentsRef.current = assignments;
  capturedImageRef.current = capturedImage;

  function getActiveJobs() {
    return assignmentsRef.current
      .filter((a) => ["pending", "accepted", "in_progress"].includes(a.status))
      .sort((a, b) => priorityRank(a.report?.priority || "low") - priorityRank(b.report?.priority || "low"));
  }

  function handleCameraCapture() {
    cameraInputRef.current?.click();
  }

  function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      speak("Photo captured. What would you like to know? Or say analyze.", true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function sendImageQuery(question: string) {
    if (!capturedImage) return;
    setProcessing(true);
    const image = capturedImage;
    setCapturedImage(null);

    try {
      const jobContext = getActiveJobs().map((a) => ({
        id: a.report?.id || "", assignmentId: a.id, status: a.status,
        building: a.report?.building || "", room: a.report?.room || "",
        trade: a.report?.trade || "", priority: a.report?.priority || "",
        description: a.report?.description || "",
        aiDescription: a.report?.ai_description || "",
        suggestedAction: a.report?.suggested_action || "",
      }));

      const res = await fetch("/api/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: question, image, context: { technicianName: techName, currentJobs: jobContext } }),
      });
      if (res.ok) {
        const { response } = await res.json();
        setLastMessage(response);
        speak(response);
      } else {
        speak("Sorry, couldn't analyze the image.");
      }
    } catch {
      speak("Error analyzing image.");
    } finally {
      setProcessing(false);
    }
  }

  const handleCommand = useCallback(async (transcript: string) => {
    const cmd = transcript.toLowerCase().trim();
    setLastHeard(transcript);

    const activeJobs = getActiveJobs();
    const currentJob = activeJobs.find((a) => a.status === "in_progress") ||
      activeJobs.find((a) => a.status === "accepted") || activeJobs[0];

    // Camera commands
    if (cmd.includes("take photo") || cmd.includes("camera") || cmd.includes("take picture") || cmd.includes("snap")) {
      handleCameraCapture();
      return;
    }

    // Image query
    if (capturedImageRef.current) {
      await sendImageQuery(transcript);
      return;
    }

    // Accept
    if (cmd.includes("accept") && (cmd.includes("job") || cmd === "accept" || cmd === "yes")) {
      const pending = activeJobs.find((a) => a.status === "pending");
      if (!pending) { speak("No pending jobs to accept."); return; }
      try {
        const res = await fetch(`/api/assignments/${pending.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "accepted" }),
        });
        if (res.ok) {
          const r = pending.report;
          const msg = `Job accepted. ${r?.priority || ""} priority ${r?.trade || ""} at ${r?.building || "building"}${r?.room ? ", room " + r.room : ""}. ${r?.suggested_action || ""}`;
          setLastMessage(msg);
          speak(msg, true);
          loadAssignments();
        }
      } catch { speak("Error accepting job."); }
      return;
    }

    // Start
    if (cmd.includes("start") && (cmd.includes("job") || cmd.includes("work"))) {
      const target = activeJobs.find((a) => a.status === "accepted");
      if (!target) { speak("No accepted jobs to start."); return; }
      try {
        await fetch(`/api/assignments/${target.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in_progress" }),
        });
        const r = target.report;
        const msg = `Job started. Head to ${r?.building || "building"}${r?.room ? ", room " + r.room : ""}. ${r?.suggested_action || ""}`;
        setLastMessage(msg);
        speak(msg, true);
        loadAssignments();
      } catch { speak("Error starting job."); }
      return;
    }

    // Complete
    if (cmd.includes("complete") || cmd.includes("finish") || cmd.includes("done")) {
      const target = activeJobs.find((a) => a.status === "in_progress");
      if (!target) { speak("No job in progress to complete."); return; }
      try {
        await fetch(`/api/assignments/${target.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed", completion_notes: "Completed via smart glasses" }),
        });
        setLastMessage("Job complete. Great work!");
        speak("Job marked complete. Great work!", true);
        loadAssignments();
      } catch { speak("Error completing job."); }
      return;
    }

    // Queue
    if (cmd.includes("jobs") || cmd.includes("queue") || cmd.includes("what's next") || cmd.includes("whats next") || cmd.includes("what do i have") || cmd.includes("my jobs") || cmd.includes("assignments") || cmd.includes("next") || cmd.includes("list")) {
      if (activeJobs.length === 0) { speak("No active jobs. You're all clear."); return; }
      const summary = activeJobs.map((a, i) => `Job ${i + 1}: ${a.report?.priority || "medium"} priority ${a.report?.trade || ""} at ${a.report?.building || "building"}. Status: ${a.status}.`).join(" ");
      const msg = `You have ${activeJobs.length} active job${activeJobs.length > 1 ? "s" : ""}. ${summary}`;
      setLastMessage(msg);
      speak(msg);
      return;
    }

    // Describe
    if (cmd.includes("describe") || cmd.includes("details") || cmd.includes("tell me about") || cmd.includes("current job") || cmd.includes("this job")) {
      if (!currentJob?.report) { speak("No current job to describe."); return; }
      const r = currentJob.report;
      const msg = `${r.priority} priority ${r.trade?.replace("_", " ")} at ${r.building}${r.room ? ", room " + r.room : ""}. ${r.ai_description || r.description || "No description."}. Recommended: ${r.suggested_action || "None specified"}. ${r.safety_concern ? "Warning: safety concern flagged." : ""}`;
      setLastMessage(msg);
      speak(msg);
      return;
    }

    // AI fallback
    setProcessing(true);
    try {
      const jobContext = activeJobs.map((a) => ({
        id: a.report?.id || "", assignmentId: a.id, status: a.status,
        building: a.report?.building || "", room: a.report?.room || "",
        trade: a.report?.trade || "", priority: a.report?.priority || "",
        description: a.report?.description || "",
        aiDescription: a.report?.ai_description || "",
        suggestedAction: a.report?.suggested_action || "",
      }));
      const res = await fetch("/api/voice-command", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: transcript, context: { technicianName: techName, currentJobs: jobContext } }),
      });
      if (res.ok) {
        const { response } = await res.json();
        setLastMessage(response);
        speak(response);
      } else { speak("Sorry, couldn't process that."); }
    } catch { speak("Error connecting to AI."); }
    finally { setProcessing(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [techName]);

  const { isListening, isSpeaking, supported, startListening, stopListening, speak, stopSpeaking } =
    useVoiceAssistant({ onCommand: handleCommand });

  const loadAssignments = useCallback(async () => {
    try {
      const res = await fetch(`/api/assignments?technician_email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const data = await res.json();
      const list: Assignment[] = data.assignments || [];
      setAssignments(list);

      if (list.length > 0 && list[0].technician?.name) {
        setTechName(list[0].technician.name);
      }

      const currentPendingIds = new Set(list.filter((a) => a.status === "pending").map((a) => a.id));
      const newJobs = list.filter((a) => a.status === "pending" && !prevIdsRef.current.has(a.id));

      if (initialLoadDoneRef.current && newJobs.length > 0 && active) {
        for (const job of newJobs) {
          const r = job.report;
          const msg = `Attention. New job assigned. ${r?.priority || ""} priority ${r?.trade || ""} at ${r?.building || "building"}${r?.room ? ", room " + r.room : ""}. ${r?.ai_description || r?.description || ""}. Say accept to take this job.`;
          setLastMessage(msg);
          speak(msg, true);
        }
      }

      prevIdsRef.current = currentPendingIds;
      initialLoadDoneRef.current = true;
    } catch { /* ignore */ }
  }, [email, speak, active]);

  // Poll
  useEffect(() => {
    loadAssignments();
    const interval = setInterval(loadAssignments, 10000);
    return () => clearInterval(interval);
  }, [loadAssignments]);

  // Wake lock to keep screen on
  useEffect(() => {
    if (!active) return;
    let wakeLock: WakeLockSentinel | null = null;
    async function requestWakeLock() {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch { /* ignore */ }
    }
    requestWakeLock();
    return () => { wakeLock?.release(); };
  }, [active]);

  function handleActivate() {
    setActive(true);
    startListening();
    const activeJobs = getActiveJobs();
    const greeting = `FixIt AI glasses connected. Welcome ${techName}. You have ${activeJobs.length} active job${activeJobs.length !== 1 ? "s" : ""}. ${activeJobs.length > 0 ? "Say what's my queue to hear your jobs, or accept to take a pending job." : "No jobs right now. I'll notify you when one comes in."} You can also take a photo anytime for AI help.`;
    setLastMessage(greeting);
    speak(greeting);
  }

  function handleDeactivate() {
    setActive(false);
    stopListening();
    stopSpeaking();
  }

  if (!supported) return null;

  return (
    <>
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelected} />

      {/* Floating glasses button — always visible */}
      {!active && (
        <button
          onClick={handleActivate}
          className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/25 flex items-center justify-center hover:bg-[#2563EB] active:scale-95 transition-all"
        >
          <Glasses className="h-6 w-6" />
        </button>
      )}

      {/* Active glasses bar — fixed at top when active */}
      {active && (
        <div className="fixed bottom-16 left-0 right-0 z-50 px-3 pb-2">
          <div className="max-w-[640px] mx-auto">
            {/* Captured image preview */}
            {capturedImage && (
              <div className="mb-2 bg-[#141415] border border-[#262626] rounded-xl p-3 flex items-center gap-3">
                <img src={capturedImage} alt="Captured" className="w-14 h-14 object-cover rounded-lg border border-[#262626]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#E5E7EB]">Photo ready</p>
                  <p className="text-[11px] text-[#9CA3AF]">Say your question or &quot;analyze&quot;</p>
                </div>
                <button onClick={() => setCapturedImage(null)} className="h-7 w-7 flex items-center justify-center rounded-full bg-[#262626] text-[#9CA3AF]">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Main control bar */}
            <div
              className="bg-[#141415] border border-[#262626] rounded-2xl shadow-xl shadow-black/20 overflow-hidden"
            >
              {/* Expandable last message */}
              {expanded && lastMessage && (
                <div className="px-4 py-3 border-b border-[#262626] max-h-32 overflow-y-auto">
                  <p className="text-[13px] text-[#E5E7EB] leading-relaxed">{lastMessage}</p>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-2.5">
                {/* Glasses indicator */}
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <div className="h-9 w-9 rounded-full bg-[#3B82F6]/15 flex items-center justify-center flex-shrink-0">
                    <Glasses className="h-4.5 w-4.5 text-[#3B82F6]" />
                  </div>
                  <div className="min-w-0 text-left">
                    {isSpeaking ? (
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 text-[#3B82F6] animate-pulse flex-shrink-0" />
                        <span className="text-[12px] text-[#3B82F6]">Speaking...</span>
                      </div>
                    ) : isListening ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
                          <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                          <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                        </div>
                        <span className="text-[12px] text-emerald-400">Listening...</span>
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#6B7280]">Glasses paused</span>
                    )}
                    {lastHeard && !expanded && (
                      <p className="text-[11px] text-[#9CA3AF] truncate max-w-[180px]">&quot;{lastHeard}&quot;</p>
                    )}
                    {lastMessage && !expanded && !lastHeard && (
                      <p className="text-[11px] text-[#6B7280] truncate max-w-[180px]">{lastMessage}</p>
                    )}
                  </div>
                </button>

                {/* Camera */}
                <button
                  onClick={handleCameraCapture}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-[#1C1C1E] text-[#9CA3AF] hover:text-white border border-[#262626] flex-shrink-0"
                >
                  <Camera className="h-4 w-4" />
                </button>

                {/* Mic toggle */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`h-9 w-9 flex items-center justify-center rounded-full flex-shrink-0 ${
                    isListening ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                  }`}
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </button>

                {/* Close */}
                <button
                  onClick={handleDeactivate}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-[#1C1C1E] text-[#6B7280] hover:text-white border border-[#262626] flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {active && processing && (
        <div className="fixed bottom-44 left-1/2 -translate-x-1/2 z-50 bg-[#141415] border border-[#262626] rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
          <div className="h-3 w-3 rounded-full bg-[#3B82F6] animate-pulse" />
          <span className="text-[12px] text-[#9CA3AF]">AI thinking...</span>
        </div>
      )}
    </>
  );
}
