"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results[event.results.length - 1];
        if (last.isFinal) {
          onTranscript(last[0].transcript);
        }
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  function toggle() {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={disabled}
      className={`rounded-xl h-9 px-3 border-white/[0.08] transition-all ${
        listening
          ? "bg-[#ef4444]/15 border-[#ef4444]/30 text-[#ef4444] animate-pulse"
          : "text-[#666666] hover:bg-white/5 hover:text-[#a1a1a1]"
      }`}
    >
      {listening ? (
        <>
          <MicOff className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Stop</span>
        </>
      ) : (
        <>
          <Mic className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Voice</span>
        </>
      )}
    </Button>
  );
}
