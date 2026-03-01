"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";

const ROLES: {
  value: UserRole;
  label: string;
  desc: string;
}[] = [
  {
    value: "user",
    label: "Student",
    desc: "Report a maintenance issue",
  },
  {
    value: "technician",
    label: "Technician",
    desc: "View & complete work orders",
  },
  {
    value: "manager",
    label: "Manager",
    desc: "AI dashboard & oversight",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !role) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to send PIN");
        return;
      }

      toast.success("PIN sent! Check your email.");
      router.push(`/verify?email=${encodeURIComponent(email)}&role=${role}`);
    } catch {
      toast.error("Something went wrong. Try again.");
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#374151]">
                Select your role
              </label>
              <div className="space-y-2">
                {ROLES.map((r) => {
                  const isActive = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`w-full flex items-center justify-between rounded-[6px] p-3 border text-left transition-colors duration-150 ${
                        isActive
                          ? "border-[#00539F] bg-[#EFF6FF]"
                          : "border-[#E5E7EB] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      <div>
                        <p className={`text-[14px] font-medium ${isActive ? "text-[#00539F]" : "text-[#111111]"}`}>
                          {r.label}
                        </p>
                        <p className="text-[13px] text-[#6B7280]">{r.desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isActive
                            ? "border-[#00539F]"
                            : "border-[#D1D5DB]"
                        }`}
                      >
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-[#00539F]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#374151]">
                Email address
              </label>
              <Input
                type="email"
                placeholder="you@udel.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-[14px] rounded-[6px] border-[#E5E7EB] bg-white text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#00539F] focus:ring-0"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!email || !role || loading}
              className="w-full h-11 rounded-[6px] text-[14px] font-medium bg-[#00539F] hover:bg-[#003d75] text-white transition-colors duration-150 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Send login PIN
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center mt-4 text-[13px] text-[#9CA3AF]">
          HenHacks 2026
        </p>
      </div>
    </div>
  );
}
