"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, X, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  photoPreview: string | null;
  onClear: () => void;
}

export function CameraCapture({ onCapture, photoPreview, onClear }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  function handleFile(file: File) {
    setProcessing(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1024;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) { height = (height / width) * maxSize; width = maxSize; }
          else { width = (width / height) * maxSize; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        onCapture(canvas.toDataURL("image/jpeg", 0.8));
        setProcessing(false);
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  if (photoPreview) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-lg group">
        <img
          src={photoPreview}
          alt="Captured maintenance issue"
          className="w-full h-52 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={() => { onClear(); cameraInputRef.current?.click(); }}
            className="bg-[#1a1410]/90 backdrop-blur-sm p-2 rounded-xl shadow-lg hover:bg-[#2d2418] transition"
          >
            <RotateCcw className="h-4 w-4 text-[#e8d5a3]" />
          </button>
          <button
            type="button"
            onClick={onClear}
            className="bg-[#1a1410]/90 backdrop-blur-sm p-2 rounded-xl shadow-lg hover:bg-[#2d2418] transition"
          >
            <X className="h-4 w-4 text-[#e8d5a3]" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 bg-[#6b7c5e] text-[#f4e4c1] text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Photo captured
          </div>
        </div>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleInputChange} className="hidden" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={processing}
          className="group flex flex-col items-center justify-center gap-3 h-36 rounded-2xl border-2 border-dashed border-[#c8a55c]/30 bg-[#c8a55c]/5 hover:bg-[#c8a55c]/10 hover:border-[#c8a55c]/50 transition-all duration-200 active:scale-[0.98]"
        >
          <div className="bg-[#c8a55c]/15 p-3 rounded-2xl group-hover:bg-[#c8a55c]/20 transition">
            <Camera className="h-7 w-7 text-[#c8a55c]" />
          </div>
          <span className="text-sm font-semibold text-[#c8a55c]">Take Photo</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="group flex flex-col items-center justify-center gap-3 h-36 rounded-2xl border-2 border-dashed border-[#3d3124] bg-[#1a1410] hover:bg-[#2d2418] hover:border-[#4d3f30] transition-all duration-200 active:scale-[0.98]"
        >
          <div className="bg-[#2d2418] p-3 rounded-2xl group-hover:bg-[#3d3124] transition">
            <ImagePlus className="h-7 w-7 text-[#9c8e7c]" />
          </div>
          <span className="text-sm font-semibold text-[#9c8e7c]">Upload Image</span>
        </button>
      </div>

      {processing && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="w-4 h-4 rounded-full border-2 border-[#c8a55c]/30 border-t-[#c8a55c] animate-spin" />
          <span className="text-sm text-[#9c8e7c]">Processing...</span>
        </div>
      )}

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleInputChange} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
    </div>
  );
}
