"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wrench, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "";

  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email || !role) {
      router.replace("/login");
    }
  }, [email, role, router]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newPin.every((d) => d !== "")) {
      verifyPin(newPin.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newPin = pasted.split("");
      setPin(newPin);
      verifyPin(pasted);
    }
  }

  async function verifyPin(code: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin: code, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Invalid PIN");
        setPin(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      toast.success("Logged in!");
      router.replace(`/${role}`);
    } catch {
      toast.error("Verification failed. Try again.");
      setPin(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[#00539F] to-[#003d75]">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-[#FFD200] p-3 rounded-2xl">
              <Wrench className="h-8 w-8 text-[#00539F]" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center">Enter Your PIN</h2>
          <p className="text-sm text-gray-500 text-center">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* PIN Input */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]/20 outline-none transition-all disabled:opacity-50"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {loading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#00539F]" />
              </div>
            )}

            <Button
              variant="ghost"
              className="w-full text-gray-500"
              onClick={() => router.push("/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#00539F] to-[#003d75]">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
