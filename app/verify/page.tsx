"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    if (!email || !role) router.replace("/login");
  }, [email, role, router]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newPin.every((d) => d !== "")) verifyPin(newPin.join(""));
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
      setPin(pasted.split(""));
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
        toast.error("Invalid or expired PIN");
        setPin(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }
      toast.success("Welcome to FixIt AI!");
      router.replace(`/${role}`);
    } catch {
      toast.error("Verification failed");
      setPin(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA]">
      <div className="w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-medium text-[#111111] tracking-[-0.01em]">
              FixIt AI
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-1">
              University of Delaware
            </p>
          </div>

          <div className="text-center mb-6">
            <p className="text-[14px] text-[#111111]">
              Enter the 6-digit code sent to
            </p>
            <p className="text-[13px] font-medium text-[#00539F] mt-1">{email}</p>
          </div>

          {/* PIN Input */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
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
                className={`w-11 h-12 text-center text-[18px] font-semibold rounded-[6px] border outline-none transition-colors duration-150 disabled:opacity-50 ${
                  digit
                    ? "border-[#00539F] bg-[#EFF6FF] text-[#111111]"
                    : "border-[#E5E7EB] bg-white text-[#111111] focus:border-[#00539F]"
                }`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Loader2 className="h-4 w-4 animate-spin text-[#00539F]" />
              <p className="text-[13px] text-[#6B7280]">Verifying...</p>
            </div>
          )}

          {!loading && (
            <p className="text-center text-[13px] text-[#9CA3AF] mb-6">
              Didn&apos;t receive the code? Check your spam folder.
            </p>
          )}

          <Button
            variant="ghost"
            className="w-full text-[14px] text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6] rounded-[6px] h-10"
            onClick={() => router.push("/login")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </div>

        <p className="text-center mt-4 text-[13px] text-[#9CA3AF]">
          HenHacks 2026
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-48 h-1 rounded-full overflow-hidden bg-[#E5E7EB]">
            <div className="h-full w-1/3 bg-[#00539F] rounded-full skeleton-pulse" />
          </div>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
