"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, X, RotateCcw } from "lucide-react";

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
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1024;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        onCapture(canvas.toDataURL("image/jpeg", 0.8));
        setProcessing(false);
      };
      img.onerror = () => {
        onCapture(base64);
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
      <div className="relative rounded-[6px] overflow-hidden border border-[#E5E7EB]">
        <img
          src={photoPreview}
          alt="Captured maintenance issue"
          className="w-full h-[200px] object-cover"
        />
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 bg-white border border-[#E5E7EB] px-2 py-1 rounded-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-[12px] font-medium text-[#6B7280] hover:bg-[#F3F4F6] transition-colors duration-150"
        >
          Retake
        </button>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleInputChange} className="hidden" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        disabled={processing}
        className="w-full flex flex-col items-center justify-center gap-2 h-[200px] rounded-[6px] border-2 border-dashed border-[#D1D5DB] bg-white hover:border-[#00539F] hover:bg-[#FAFAFA] transition-colors duration-150"
      >
        <Camera className="h-6 w-6 text-[#9CA3AF]" />
        <span className="text-[14px] text-[#6B7280]">Take a photo or upload</span>
      </button>

      {processing && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="w-4 h-4 rounded-full border-2 border-[#E5E7EB] border-t-[#00539F] animate-spin" />
          <span className="text-[13px] text-[#6B7280]">Processing...</span>
        </div>
      )}

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleInputChange} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
    </div>
  );
}
