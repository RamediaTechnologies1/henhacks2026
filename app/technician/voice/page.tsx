"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Glasses,
  AlertTriangle,
  Loader2,
  Radio,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceAssistant } from "@/lib/hooks/use-voice-assistant";
import type { Assignment } from "@/lib/types";

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function priorityRank(p: string) {
  return PRIORITY_ORDER[p as keyof typeof PRIORITY_ORDER] ?? 4;
}

function VoiceAssistantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusJobId = searchParams.get("job");

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [techName, setTechName] = useState("Technician");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [commandLog, setCommandLog] = useState<
    { role: "user" | "assistant"; text: string; time: string }[]
  >([]);
  const [connected, setConnected] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const prevIdsRef = useRef<Set<string>>(new Set());
  const assignmentsRef = useRef<Assignment[]>([]);

  // Keep ref in sync with state — fixes stale closure issue
  assignmentsRef.current = assignments;

  // Active jobs sorted by priority
  function getActiveJobs() {
    return assignmentsRef.current
      .filter((a) => ["pending", "accepted", "in_progress"].includes(a.status))
      .sort((a, b) => priorityRank(a.report?.priority || "low") - priorityRank(b.report?.priority || "low"));
  }

  // Focused job (if accessed from job detail page)
  function getFocusedJob() {
    if (!focusJobId) return null;
    return assignmentsRef.current.find((a) => a.id === focusJobId) || null;
  }

  function addLog(role: "user" | "assistant", text: string) {
    setCommandLog((prev) => [
      ...prev,
      { role, text, time: new Date().toLocaleTimeString() },
    ]);
  }

  // Process voice commands — uses refs so always has latest data
  const handleCommand = useCallback(
    async (transcript: string) => {
      const cmd = transcript.toLowerCase().trim();
      addLog("user", transcript);

      const activeJobs = getActiveJobs();
      const focused = getFocusedJob();
      const currentJob = focused ||
        activeJobs.find((a) => a.status === "in_progress") ||
        activeJobs.find((a) => a.status === "accepted") ||
        activeJobs[0];

      // --- Accept job ---
      if (cmd.includes("accept") && (cmd.includes("job") || cmd.includes("assignment") || cmd === "accept" || cmd === "yes")) {
        const pending = focused?.status === "pending" ? focused : activeJobs.find((a) => a.status === "pending");
        if (!pending) {
          const msg = "No pending jobs to accept.";
          addLog("assistant", msg);
          speak(msg);
          return;
        }
        try {
          const res = await fetch(`/api/assignments/${pending.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "accepted" }),
          });
          if (res.ok) {
            const r = pending.report;
            const msg = `Job accepted. ${r?.priority || ""} priority ${r?.trade || ""} issue at ${r?.building || "building"}${r?.room ? ", room " + r.room : ""}. ${r?.suggested_action || ""}`;
            addLog("assistant", msg);
            speak(msg, true);
            loadAssignments();
          } else {
            speak("Failed to accept job. Try again.");
          }
        } catch {
          speak("Error accepting job.");
        }
        return;
      }

      // --- Start job ---
      if (cmd.includes("start") && (cmd.includes("job") || cmd.includes("work"))) {
        const target = focused?.status === "accepted" ? focused : activeJobs.find((a) => a.status === "accepted");
        if (!target) {
          speak("No accepted jobs to start. Say accept job first.");
          return;
        }
        try {
          await fetch(`/api/assignments/${target.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "in_progress" }),
          });
          const r = target.report;
          const msg = `Job started. Head to ${r?.building || "building"}${r?.room ? ", room " + r.room : ""}. ${r?.suggested_action || ""}`;
          addLog("assistant", msg);
          speak(msg, true);
          loadAssignments();
        } catch {
          speak("Error starting job.");
        }
        return;
      }

      // --- Complete job ---
      if (cmd.includes("complete") || cmd.includes("finish") || cmd.includes("done") || cmd.includes("mark complete")) {
        const target = focused?.status === "in_progress" ? focused : activeJobs.find((a) => a.status === "in_progress");
        if (!target) {
          speak("No job in progress to complete.");
          return;
        }
        try {
          await fetch(`/api/assignments/${target.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "completed", completion_notes: "Completed via smart glasses voice command" }),
          });
          const msg = "Job marked complete. Great work! Moving to next assignment.";
          addLog("assistant", msg);
          speak(msg, true);
          loadAssignments();
        } catch {
          speak("Error completing job.");
        }
        return;
      }

      // --- List jobs / queue ---
      if (cmd.includes("jobs") || cmd.includes("queue") || cmd.includes("assignments") || cmd.includes("what do i have") || cmd.includes("what's next") || cmd.includes("whats next") || cmd.includes("next job")) {
        if (activeJobs.length === 0) {
          const msg = "You have no active jobs right now. You're all clear.";
          addLog("assistant", msg);
          speak(msg);
          return;
        }
        const summary = activeJobs.map((a, i) => {
          const r = a.report;
          return `Job ${i + 1}: ${r?.priority || "medium"} priority ${r?.trade || "maintenance"} at ${r?.building || "building"}${r?.room ? " room " + r.room : ""}. Status: ${a.status}.`;
        }).join(" ");
        const msg = `You have ${activeJobs.length} active job${activeJobs.length > 1 ? "s" : ""}. ${summary}`;
        addLog("assistant", msg);
        speak(msg);
        return;
      }

      // --- Describe current job ---
      if (cmd.includes("describe") || cmd.includes("details") || cmd.includes("tell me about") || cmd.includes("current job") || cmd.includes("this job") || cmd.includes("what is this")) {
        if (!currentJob?.report) {
          speak("No current job to describe.");
          return;
        }
        const r = currentJob.report;
        const msg = `${r.priority} priority ${r.trade?.replace("_", " ")} issue at ${r.building}${r.room ? ", room " + r.room : ""}${r.floor ? ", floor " + r.floor : ""}. ${r.ai_description || r.description || "No description available."}. Recommended action: ${r.suggested_action || "None specified"}. Estimated time: ${r.estimated_time || "unknown"}. ${r.safety_concern ? "Warning: safety concern has been flagged for this job." : ""}`;
        addLog("assistant", msg);
        speak(msg);
        return;
      }

      // --- Status ---
      if (cmd.includes("status") || cmd.includes("where am i")) {
        if (!currentJob) {
          speak("No active job. Say what's next to check your queue.");
          return;
        }
        const r = currentJob.report;
        const msg = `Current job status: ${currentJob.status}. ${r?.trade || ""} at ${r?.building || "building"}${r?.room ? ", room " + r.room : ""}.`;
        addLog("assistant", msg);
        speak(msg);
        return;
      }

      // --- AI-powered command (anything else → OpenAI) ---
      setProcessing(true);
      try {
        const jobContext = activeJobs.map((a) => ({
          id: a.report?.id || "",
          assignmentId: a.id,
          status: a.status,
          building: a.report?.building || "",
          room: a.report?.room || "",
          trade: a.report?.trade || "",
          priority: a.report?.priority || "",
          description: a.report?.description || "",
          aiDescription: a.report?.ai_description || "",
          suggestedAction: a.report?.suggested_action || "",
        }));

        const res = await fetch("/api/voice-command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command: transcript,
            context: { technicianName: techName, currentJobs: jobContext },
          }),
        });

        if (res.ok) {
          const { response } = await res.json();
          addLog("assistant", response);
          speak(response);
        } else {
          speak("Sorry, I couldn't process that. Try again.");
        }
      } catch {
        speak("Error connecting to AI assistant.");
      } finally {
        setProcessing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [techName, focusJobId]
  );

  const { isListening, isSpeaking, supported, startListening, stopListening, speak, stopSpeaking } =
    useVoiceAssistant({ onCommand: handleCommand });

  // Load assignments
  const loadAssignments = useCallback(async () => {
    try {
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) {
        router.replace("/login");
        return;
      }
      const { email, role } = await sessionRes.json();
      if (role !== "technician") {
        router.replace("/login");
        return;
      }

      const res = await fetch(`/api/assignments?technician_email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        const list: Assignment[] = data.assignments || [];
        setAssignments(list);

        if (list.length > 0 && list[0].technician?.name) {
          setTechName(list[0].technician.name);
        }

        // Detect new pending assignments
        const currentPendingIds = new Set(list.filter((a) => a.status === "pending").map((a) => a.id));
        const newJobs = list.filter((a) => a.status === "pending" && !prevIdsRef.current.has(a.id));

        if (prevIdsRef.current.size > 0 && newJobs.length > 0 && connected) {
          for (const job of newJobs) {
            const r = job.report;
            const msg = `Attention. New job assigned. ${r?.priority || ""} priority ${r?.trade || ""} issue at ${r?.building || "building"}${r?.room ? ", room " + r.room : ""}. ${r?.ai_description || r?.description || ""}. Say accept to take this job.`;
            addLog("assistant", msg);
            speak(msg, true);
          }
        }

        prevIdsRef.current = currentPendingIds;
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router, speak, connected]);

  // Poll for assignments
  useEffect(() => {
    loadAssignments();
    const interval = setInterval(loadAssignments, 10000);
    return () => clearInterval(interval);
  }, [loadAssignments]);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [commandLog]);

  // Connect and greet
  function handleConnect() {
    setConnected(true);
    startListening();

    const activeJobs = getActiveJobs();
    const focused = getFocusedJob();

    let greeting: string;
    if (focused) {
      const r = focused.report;
      greeting = `FixIt AI glasses connected. Welcome ${techName}. Loading job details. ${r?.priority || ""} priority ${r?.trade?.replace("_", " ") || ""} issue at ${r?.building || "building"}${r?.room ? ", room " + r.room : ""}. ${r?.ai_description || r?.description || ""}. Recommended action: ${r?.suggested_action || "Check on site."}. ${focused.status === "pending" ? "Say accept to take this job." : focused.status === "accepted" ? "Say start job to begin work." : "Job is in progress. Say help if you need guidance."}`;
    } else {
      greeting = `FixIt AI glasses connected. Welcome ${techName}. You have ${activeJobs.length} active job${activeJobs.length !== 1 ? "s" : ""}. ${activeJobs.length > 0 ? "Say what's my queue to hear your jobs, or accept to take a pending job." : "No jobs right now. I'll notify you when one comes in."}`;
    }
    addLog("assistant", greeting);
    speak(greeting);
  }

  if (!supported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0B]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-[18px] font-medium text-[#E5E7EB]">Speech not supported</h1>
          <p className="text-[13px] text-[#6B7280] mt-2">Use Chrome or Edge for voice commands.</p>
        </div>
      </div>
    );
  }

  const activeJobs = assignments
    .filter((a) => ["pending", "accepted", "in_progress"].includes(a.status))
    .sort((a, b) => priorityRank(a.report?.priority || "low") - priorityRank(b.report?.priority || "low"));

  const focusedJob = focusJobId ? assignments.find((a) => a.id === focusJobId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-[#E5E7EB]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#141415] border-b border-[#262626] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="h-8 w-8 flex items-center justify-center rounded-full bg-[#1C1C1E] text-[#9CA3AF] hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Glasses className="h-5 w-5 text-[#3B82F6]" />
            <span className="text-[15px] font-medium">FixIt AI Glasses</span>
            {connected && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                <Radio className="h-3 w-3 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {connected && (
              <>
                <button
                  onClick={isSpeaking ? stopSpeaking : undefined}
                  className={`h-8 w-8 flex items-center justify-center rounded-full ${isSpeaking ? "bg-[#3B82F6]/20 text-[#3B82F6]" : "bg-[#1C1C1E] text-[#6B7280]"}`}
                >
                  {isSpeaking ? <Volume2 className="h-4 w-4 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`h-8 w-8 flex items-center justify-center rounded-full ${isListening ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {!connected ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
            <div className="w-24 h-24 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
              <Glasses className="h-12 w-12 text-[#3B82F6]" />
            </div>
            <div className="text-center">
              <h1 className="text-[22px] font-medium tracking-[-0.01em]">
                FixIt AI Voice Assistant
              </h1>
              <p className="text-[14px] text-[#9CA3AF] mt-2 max-w-[300px]">
                {focusedJob
                  ? `Ready to guide you through: ${focusedJob.report?.trade?.replace("_", " ")} at ${focusedJob.report?.building || "building"}`
                  : "Connect your Meta Ray-Ban glasses and manage jobs hands-free."}
              </p>
            </div>

            {focusedJob && (
              <div className="w-full max-w-sm bg-[#1C1C1E] border border-[#262626] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    focusedJob.report?.priority === "critical" ? "bg-red-500/20 text-red-400" :
                    focusedJob.report?.priority === "high" ? "bg-amber-500/20 text-amber-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>{focusedJob.report?.priority}</span>
                  <span className="text-[11px] text-[#6B7280]">{focusedJob.report?.trade?.replace("_", " ")}</span>
                </div>
                <p className="text-[13px] text-[#E5E7EB]">{focusedJob.report?.ai_description || focusedJob.report?.description}</p>
                <p className="text-[12px] text-[#6B7280] mt-1">{focusedJob.report?.building}{focusedJob.report?.room ? ` — Room ${focusedJob.report.room}` : ""}</p>
              </div>
            )}

            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
            ) : (
              <Button
                onClick={handleConnect}
                className="h-12 px-8 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[15px] font-medium"
              >
                <Mic className="mr-2 h-5 w-5" />
                Connect &amp; Start Listening
              </Button>
            )}

            <div className="text-[12px] text-[#6B7280] text-center space-y-1 mt-2">
              <p>Voice commands:</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[#9CA3AF]">
                <span>&quot;Accept job&quot;</span>
                <span>&quot;Start job&quot;</span>
                <span>&quot;What&apos;s my queue&quot;</span>
                <span>&quot;Describe job&quot;</span>
                <span>&quot;Complete job&quot;</span>
                <span>&quot;Help with...&quot;</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Job status bar */}
            <div className="px-4 py-2 bg-[#1C1C1E] border-b border-[#262626] flex items-center gap-3 text-[12px] overflow-x-auto">
              <span className="text-[#9CA3AF] whitespace-nowrap">{techName}</span>
              <span className="text-[#333]">|</span>
              {focusedJob && (
                <span className="text-[#3B82F6] whitespace-nowrap">
                  Focused: {focusedJob.report?.building}{focusedJob.report?.room ? ` R${focusedJob.report.room}` : ""}
                </span>
              )}
              <span className="text-emerald-400 whitespace-nowrap">
                {activeJobs.filter((a) => a.status === "in_progress").length} working
              </span>
              <span className="text-amber-400 whitespace-nowrap">
                {activeJobs.filter((a) => a.status === "pending").length} pending
              </span>
            </div>

            {/* Conversation log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {commandLog.map((entry, i) => (
                <div key={i} className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                    entry.role === "user"
                      ? "bg-[#3B82F6] text-white rounded-br-md"
                      : "bg-[#1C1C1E] text-[#E5E7EB] border border-[#262626] rounded-bl-md"
                  }`}>
                    <p className="text-[14px] leading-relaxed">{entry.text}</p>
                    <p className={`text-[10px] mt-1 ${entry.role === "user" ? "text-blue-200" : "text-[#6B7280]"}`}>
                      {entry.time}
                    </p>
                  </div>
                </div>
              ))}
              {processing && (
                <div className="flex justify-start">
                  <div className="bg-[#1C1C1E] border border-[#262626] px-4 py-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="h-4 w-4 animate-spin text-[#3B82F6]" />
                  </div>
                </div>
              )}
              <div ref={logEndRef} />
            </div>

            {/* Bottom status */}
            <div className="px-4 py-3 bg-[#141415] border-t border-[#262626]">
              <div className="flex items-center justify-center gap-2">
                {isListening && !isSpeaking ? (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="w-1 h-5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                      <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                    </div>
                    <span className="text-[13px] text-emerald-400">Listening...</span>
                  </>
                ) : isSpeaking ? (
                  <>
                    <Volume2 className="h-4 w-4 text-[#3B82F6] animate-pulse" />
                    <span className="text-[13px] text-[#3B82F6]">Speaking...</span>
                  </>
                ) : (
                  <>
                    <MicOff className="h-4 w-4 text-[#6B7280]" />
                    <span className="text-[13px] text-[#6B7280]">Mic paused</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function GlassesVoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
          <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
        </div>
      }
    >
      <VoiceAssistantContent />
    </Suspense>
  );
}
