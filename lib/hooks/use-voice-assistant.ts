"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseVoiceAssistantOptions {
  onCommand?: (transcript: string) => void;
  continuous?: boolean;
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const { onCommand, continuous = true } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const speakingRef = useRef(false);

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
        onCommand?.(transcript);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we should still be listening
      if (recognitionRef.current && !speakingRef.current) {
        try {
          recognition.start();
        } catch {
          // ignore - already started
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuous]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // already started
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.abort();
    setIsListening(false);
  }, []);

  // Text-to-speech
  const speak = useCallback(
    (text: string, priority = false) => {
      if (priority) {
        speechQueueRef.current = [text];
        window.speechSynthesis.cancel();
      } else {
        speechQueueRef.current.push(text);
      }

      if (speakingRef.current && !priority) return;

      function processQueue() {
        const next = speechQueueRef.current.shift();
        if (!next) {
          speakingRef.current = false;
          setIsSpeaking(false);
          // Resume listening after speaking
          if (isListening) {
            try {
              recognitionRef.current?.start();
            } catch {
              // ignore
            }
          }
          return;
        }

        speakingRef.current = true;
        setIsSpeaking(true);

        // Pause recognition while speaking to avoid echo
        try {
          recognitionRef.current?.abort();
        } catch {
          // ignore
        }

        const utterance = new SpeechSynthesisUtterance(next);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = "en-US";

        utterance.onend = () => {
          processQueue();
        };

        utterance.onerror = () => {
          processQueue();
        };

        window.speechSynthesis.speak(utterance);
      }

      if (!speakingRef.current) processQueue();
    },
    [isListening]
  );

  const stopSpeaking = useCallback(() => {
    speechQueueRef.current = [];
    window.speechSynthesis.cancel();
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
