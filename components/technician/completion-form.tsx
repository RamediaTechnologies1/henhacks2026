"use client";

import { useState, useRef } from "react";
import { Camera, CheckCircle2, Loader2, RotateCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CompletionFormProps {
  assignmentId: string;
  onComplete: () => void;
}

export function CompletionForm({ assignmentId, onComplete }: CompletionFormProps) {
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 800;
        let { width, height } = img;
        if (width > max || height > max) {
          if (width > height) { height = (height / width) * max; width = max; }
          else { width = (width / height) * max; height = max; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          completion_notes: notes || "Job completed",
          completion_photo_base64: photo,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to complete job.");
        return;
      }

      toast.success("Job marked as complete!");
      onComplete();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="section-header">
        <h3 className="font-semibold text-sm text-gray-900">Complete This Job</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Add a completion photo and notes</p>
      </div>

      {/* Completion photo */}
      <div>
        {photo ? (
          <div className="relative rounded-2xl overflow-hidden shadow-md">
            <img src={photo} alt="Completion" className="w-full h-36 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-md hover:bg-white transition"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gray-700" />
            </button>
            <div className="absolute bottom-2.5 left-2.5">
              <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] px-2.5 py-1 rounded-full font-semibold shadow">
                <CheckCircle2 className="h-3 w-3" />
                Photo added
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-28 rounded-2xl border-2 border-dashed border-emerald-300/70 bg-gradient-to-br from-emerald-50/80 to-green-50/50 flex flex-col items-center justify-center gap-2 hover:from-emerald-50 hover:to-green-50 hover:border-emerald-400/70 transition-all active:scale-[0.98]"
          >
            <div className="bg-emerald-100 p-2.5 rounded-xl">
              <Camera className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-xs text-emerald-700 font-semibold">Take Completion Photo</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
      </div>

      {/* Notes */}
      <div className="relative">
        <FileText className="absolute left-3.5 top-3 h-4 w-4 text-gray-300" />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Completion notes (e.g., replaced filter, adjusted thermostat)..."
          className="w-full h-24 pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-2xl resize-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none bg-gray-50/50 placeholder:text-gray-400"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/20 text-[15px] font-semibold transition-all"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Mark as Complete
          </>
        )}
      </Button>
    </div>
  );
}
