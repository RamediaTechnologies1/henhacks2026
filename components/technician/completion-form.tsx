"use client";

import { useState, useRef } from "react";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";
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
      <h3 className="font-semibold text-sm">Complete This Job</h3>

      {/* Completion photo */}
      <div>
        {photo ? (
          <div className="relative rounded-lg overflow-hidden">
            <img src={photo} alt="Completion" className="w-full h-32 object-cover" />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 text-xs"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-24 rounded-lg border-2 border-dashed border-green-300 bg-green-50 flex flex-col items-center justify-center gap-1 hover:bg-green-100 transition"
          >
            <Camera className="h-6 w-6 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Take Completion Photo</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Completion notes (e.g., replaced filter, adjusted thermostat)..."
        className="w-full h-20 px-3 py-2 text-sm border rounded-lg resize-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
      />

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as Complete
          </>
        )}
      </Button>
    </div>
  );
}
