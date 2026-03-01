"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseVoiceAssistantOptions {
  onCommand?: (transcript: string) => void;
  continuous?: boolean;
  useElevenLabs?: boolean;
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const { continuous = true, useElevenLabs = true } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const speakingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listeningRef = useRef(false);

  // Use ref for onCommand to avoid stale closures
  const onCommandRef = useRef(options.onCommand);
  onCommandRef.current = options.onCommand;

  // Resume listening helper
  const resumeListening = useCallback(() => {
    if (listeningRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // already started
      }
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        const transcript = last[0].transcript.trim();
        setLastTranscript(transcript);
        // Always call the latest callback via ref
        onCommandRef.current?.(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we should still be listening and not speaking
      if (listeningRef.current && !speakingRef.current) {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [continuous]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    listeningRef.current = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // already started
    }
  }, []);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    if (!recognitionRef.current) return;
    recognitionRef.current.abort();
    setIsListening(false);
  }, []);

  // ElevenLabs TTS
  const speakElevenLabs = useCallback(
    async (text: string) => {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) return false;

        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        return new Promise<boolean>((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            resolve(true);
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            resolve(false);
          };
          audio.play().catch(() => resolve(false));
        });
      } catch {
        return false;
      }
    },
    []
  );

  // Fallback Web Speech TTS
  const speakWebSpeech = useCallback((text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Main speak function with queue
  const speak = useCallback(
    (text: string, priority = false) => {
      if (priority) {
        speechQueueRef.current = [text];
        window.speechSynthesis.cancel();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      } else {
        speechQueueRef.current.push(text);
      }

      if (speakingRef.current && !priority) return;

      async function processQueue() {
        const next = speechQueueRef.current.shift();
        if (!next) {
          speakingRef.current = false;
          setIsSpeaking(false);
          resumeListening();
          return;
        }

        speakingRef.current = true;
        setIsSpeaking(true);

        // Pause recognition while speaking
        try {
          recognitionRef.current?.abort();
        } catch {
          // ignore
        }

        // Try ElevenLabs first, fall back to Web Speech
        let success = false;
        if (useElevenLabs) {
          success = await speakElevenLabs(next);
        }
        if (!success) {
          await speakWebSpeech(next);
        }

        processQueue();
      }

      if (!speakingRef.current) processQueue();
    },
    [useElevenLabs, speakElevenLabs, speakWebSpeech, resumeListening]
  );

  const stopSpeaking = useCallback(() => {
    speechQueueRef.current = [];
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    speakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    lastTranscript,
    supported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
