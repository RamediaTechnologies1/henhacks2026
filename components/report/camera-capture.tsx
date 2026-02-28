"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, X, RotateCcw } from "lucide-react";
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
      // Compress image by drawing to canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1024;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(compressed);
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
      <div className="relative rounded-xl overflow-hidden border-2 border-[#00539F]">
        <img
          src={photoPreview}
          alt="Captured maintenance issue"
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 backdrop-blur"
            onClick={() => {
              onClear();
              cameraInputRef.current?.click();
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 backdrop-blur"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Photo ready
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Camera button */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={processing}
          className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-[#00539F]/30 bg-blue-50/50 hover:bg-blue-50 transition-colors"
        >
          <Camera className="h-8 w-8 text-[#00539F]" />
          <span className="text-sm font-medium text-[#00539F]">Take Photo</span>
        </button>

        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ImagePlus className="h-8 w-8 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Upload Image</span>
        </button>
      </div>

      {processing && (
        <p className="text-sm text-center text-gray-400 animate-pulse">
          Processing image...
        </p>
      )}

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
