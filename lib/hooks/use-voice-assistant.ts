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
  const listeningRef = useRef(false);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Persistent audio element — unlocked once on user gesture, reused for all TTS
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  const onCommandRef = useRef(options.onCommand);
  onCommandRef.current = options.onCommand;

  // Unlock audio on mobile — call this from a user gesture (tap)
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;

    // Create persistent audio element
    const audio = new Audio();
    audio.volume = 1.0;
    audioElRef.current = audio;

    // Play silent audio to unlock
    audio.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBqpAAAAAAD/+1DEAAAGAAGn9AAAIgAANP8AAAQAAP8A/wAABB//7UMQBgAEAAGf4AAAIAAA0/wAABAAAAA//tQxAIAAADSAAAAAAAAANIAAAAA";
    audio.play().then(() => {
      audioUnlockedRef.current = true;
    }).catch(() => {
      // ignore — will retry on next gesture
    });

    // Also unlock Web Speech
    const utterance = new SpeechSynthesisUtterance("");
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);
  }, []);

  const resumeListening = useCallback(() => {
    if (listeningRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch { /* already started */ }
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
        onCommandRef.current?.(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
      if (event.error === "no-speech" && listeningRef.current && !speakingRef.current) {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognition.onend = () => {
      if (listeningRef.current && !speakingRef.current) {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [continuous]);

  // Activate Bluetooth mic
  const activateMic = useCallback(async () => {
    try {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      micStreamRef.current = stream;
      return true;
    } catch {
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) return;

    // Unlock audio on this user gesture
    unlockAudio();

    // Activate Bluetooth mic
    await activateMic();

    listeningRef.current = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch { /* already started */ }
  }, [activateMic, unlockAudio]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    if (!recognitionRef.current) return;
    recognitionRef.current.abort();
    setIsListening(false);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
  }, []);

  // ElevenLabs TTS — reuses unlocked audio element
  const speakElevenLabs = useCallback(async (text: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return false;

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Use the persistent unlocked audio element
      const audio = audioElRef.current || new Audio();
      audioElRef.current = audio;

      return new Promise<boolean>((resolve) => {
        const cleanup = () => {
          URL.revokeObjectURL(audioUrl);
          audio.onended = null;
          audio.onerror = null;
        };
        audio.onended = () => { cleanup(); resolve(true); };
        audio.onerror = () => { cleanup(); resolve(false); };
        audio.src = audioUrl;
        audio.play().catch(() => { cleanup(); resolve(false); });
      });
    } catch {
      return false;
    }
  }, []);

  // Web Speech TTS fallback
  const speakWebSpeech = useCallback((text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Cancel any pending speech first
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      // Small delay helps mobile browsers
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);

      // Safety timeout — if speech doesn't finish in 30s, resolve anyway
      setTimeout(() => resolve(true), 30000);
    });
  }, []);

  // Main speak function
  const speak = useCallback(
    (text: string, priority = false) => {
      if (priority) {
        speechQueueRef.current = [text];
        window.speechSynthesis.cancel();
        const audio = audioElRef.current;
        if (audio) { audio.pause(); audio.currentTime = 0; }
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
        try { recognitionRef.current?.abort(); } catch { /* ignore */ }

        // Try ElevenLabs first, fall back to Web Speech
        let success = false;
        if (useElevenLabs) {
          success = await speakElevenLabs(next);
        }
        if (!success) {
          success = await speakWebSpeech(next);
        }

        // Continue queue regardless
        processQueue();
      }

      if (!speakingRef.current) processQueue();
    },
    [useElevenLabs, speakElevenLabs, speakWebSpeech, resumeListening]
  );

  const stopSpeaking = useCallback(() => {
    speechQueueRef.current = [];
    window.speechSynthesis.cancel();
    const audio = audioElRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
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
