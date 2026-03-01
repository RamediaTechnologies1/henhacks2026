"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wrench, ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
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
    <div className="fixit-gradient-bg min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Floating ember orbs */}
      <div className="floating-orb w-72 h-72 bg-[#c8a55c] top-10 -left-20" />
      <div className="floating-orb w-96 h-96 bg-[#b87333] bottom-10 -right-20" style={{ animationDelay: "-7s" }} />
      <div className="floating-orb w-48 h-48 bg-[#8b3a1a] top-1/3 right-1/4" style={{ animationDelay: "-12s" }} />

      <div className="relative z-10 w-full max-w-md page-enter">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative star-badge">
              <div className="absolute inset-0 bg-[#c8a55c] rounded-2xl blur-lg opacity-30" />
              <div className="relative bg-gradient-to-br from-[#c8a55c] to-[#9a7d3f] p-4 rounded-2xl shadow-lg shadow-[#c8a55c]/20">
                <ShieldCheck className="h-10 w-10 text-[#0d0a07]" />
              </div>
            </div>
          </div>
          <h1 className="font-[family-name:var(--font-western)] text-3xl text-[#c8a55c] tracking-wide">
            Verify Your Identity
          </h1>
          <p className="text-[#9c8e7c] mt-2 text-sm">
            Enter the 6-digit code sent to
          </p>
          <div className="inline-flex items-center gap-2 mt-1 glass-card-dark px-4 py-2 rounded-full">
            <Mail className="h-3.5 w-3.5 text-[#c8a55c]" />
            <span className="text-sm font-medium text-[#e8d5a3]">{email}</span>
          </div>
        </div>

        {/* PIN Card */}
        <div className="glass-card rounded-2xl p-8 space-y-8">
          <div className="western-divider" />

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
                className={`w-13 h-16 text-center text-2xl font-bold rounded-2xl outline-none transition-all duration-200 disabled:opacity-50 ${
                  digit
                    ? "border-2 border-[#c8a55c] bg-[#c8a55c]/10 text-[#c8a55c] shadow-lg shadow-[#c8a55c]/10"
                    : "border-2 border-[#3d3124] bg-[#1a1410] text-[#f4e4c1] focus:border-[#c8a55c] focus:shadow-lg focus:shadow-[#c8a55c]/10"
                }`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {loading && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-[#3d3124]" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#c8a55c] animate-spin" />
              </div>
              <p className="text-sm text-[#9c8e7c]">Verifying...</p>
            </div>
          )}

          {!loading && (
            <p className="text-center text-xs text-[#6b5e4f]">
              Didn&apos;t receive the code? Check your spam folder.
            </p>
          )}

          <Button
            variant="ghost"
            className="w-full text-[#9c8e7c] hover:text-[#e8d5a3] hover:bg-[#2d2418] rounded-xl"
            onClick={() => router.push("/login")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>

          <div className="western-divider" />
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-[#6b5e4f] font-medium tracking-wide">
          HenHacks 2026 &middot; Automation Systems & Public Infrastructure
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="fixit-gradient-bg min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#c8a55c]" />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
