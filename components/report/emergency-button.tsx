"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_BUILDINGS } from "@/lib/constants";
import { toast } from "sonner";

export function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const [building, setBuilding] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleEmergency() {
    if (!building) {
      toast.error("Select a building first");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building,
          room: "",
          floor: "",
          description: "EMERGENCY: Safety hazard reported via one-tap emergency button",
          photo_base64: "",
          ai_analysis: {
            trade: "safety_hazard",
            priority: "critical",
            description: "Emergency safety hazard — reported via quick emergency button",
            suggested_action: "Dispatch safety team immediately for on-site assessment",
            safety_concern: true,
            estimated_cost: "N/A",
            estimated_time: "Immediate response required",
            confidence_score: 1.0,
          },
        }),
      });

      if (res.ok) {
        toast.success("Emergency report submitted! Safety team has been notified.");
        setOpen(false);
        setBuilding("");
      } else {
        toast.error("Failed to submit emergency report");
      }
    } catch {
      toast.error("Failed to submit emergency report");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 bg-[#ef4444] hover:bg-[#dc2626] text-white p-4 rounded-full shadow-lg shadow-[#ef4444]/30 transition-all active:scale-95 animate-pulse hover:animate-none"
      >
        <AlertTriangle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 w-72 bg-[#111111] border border-[#ef4444]/30 rounded-2xl p-4 space-y-3 shadow-2xl shadow-[#ef4444]/10">
      <div className="flex items-center gap-2">
        <div className="bg-[#ef4444]/15 p-2 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#ef4444]">Emergency Report</p>
          <p className="text-[10px] text-[#666666]">Quick safety hazard report</p>
        </div>
      </div>

      <Select value={building} onValueChange={setBuilding}>
        <SelectTrigger className="rounded-xl border-[#ef4444]/20 bg-black text-[#a1a1a1] h-10">
          <SelectValue placeholder="Select Building" />
        </SelectTrigger>
        <SelectContent>
          {DEMO_BUILDINGS.map((b) => (
            <SelectItem key={b} value={b}>{b}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setOpen(false); setBuilding(""); }}
          className="flex-1 rounded-xl border-white/[0.08] text-[#666666] hover:bg-white/5 h-10"
        >
          Cancel
        </Button>
        <Button
          onClick={handleEmergency}
          disabled={submitting || !building}
          className="flex-1 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold h-10"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
