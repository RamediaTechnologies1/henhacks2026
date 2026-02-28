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
      {/* Floating orbs */}
      <div className="floating-orb w-72 h-72 bg-[#FFD200] top-10 -left-20" />
      <div className="floating-orb w-96 h-96 bg-blue-400 bottom-10 -right-20" style={{ animationDelay: "-7s" }} />

      <div className="relative z-10 w-full max-w-md page-enter">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFD200] rounded-2xl blur-lg opacity-40" />
              <div className="relative bg-[#FFD200] p-4 rounded-2xl shadow-lg">
                <ShieldCheck className="h-10 w-10 text-[#00296b]" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Verify Your Identity
          </h1>
          <p className="text-blue-200/70 mt-2 text-sm">
            Enter the 6-digit code sent to
          </p>
          <div className="inline-flex items-center gap-2 mt-1 glass-card-dark px-4 py-2 rounded-full">
            <Mail className="h-3.5 w-3.5 text-[#FFD200]" />
            <span className="text-sm font-medium text-blue-100">{email}</span>
          </div>
        </div>

        {/* PIN Card */}
        <div className="glass-card rounded-3xl p-8 space-y-8">
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
                    ? "border-2 border-[#00539F] bg-blue-50/50 text-[#00539F] shadow-lg shadow-blue-500/10"
                    : "border-2 border-gray-200 bg-gray-50/50 text-gray-900 focus:border-[#00539F] focus:shadow-lg focus:shadow-blue-500/10"
                }`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {loading && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#00539F] animate-spin" />
              </div>
              <p className="text-sm text-gray-400">Verifying...</p>
            </div>
          )}

          {!loading && (
            <p className="text-center text-xs text-gray-400">
              Didn&apos;t receive the code? Check your spam folder.
            </p>
          )}

          <Button
            variant="ghost"
            className="w-full text-gray-400 hover:text-gray-600 rounded-xl"
            onClick={() => router.push("/login")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="fixit-gradient-bg min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
