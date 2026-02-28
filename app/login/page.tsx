"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, User, HardHat, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";

const ROLES: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: "user",
    label: "Student",
    icon: <User className="h-6 w-6" />,
    desc: "Report a maintenance issue",
  },
  {
    value: "technician",
    label: "Technician",
    icon: <HardHat className="h-6 w-6" />,
    desc: "View and complete work orders",
  },
  {
    value: "manager",
    label: "Manager",
    icon: <Shield className="h-6 w-6" />,
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

      toast.success("PIN sent to your email!");
      router.push(`/verify?email=${encodeURIComponent(email)}&role=${role}`);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[#00539F] to-[#003d75]">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="bg-[#FFD200] p-3 rounded-2xl">
            <Wrench className="h-8 w-8 text-[#00539F]" />
          </div>
          <h1 className="text-4xl font-bold text-white">FixIt AI</h1>
        </div>
        <p className="text-blue-200 text-sm">
          University of Delaware Campus Maintenance
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <h2 className="text-xl font-semibold text-center">Sign In</h2>
          <p className="text-sm text-gray-500 text-center">
            Select your role and enter your email to receive a login PIN
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 border-2 transition-all ${
                    role === r.value
                      ? "border-[#00539F] bg-blue-50 text-[#00539F]"
                      : "border-gray-200 hover:border-gray-300 text-gray-500"
                  }`}
                >
                  {r.icon}
                  <span className="text-xs font-medium">{r.label}</span>
                </button>
              ))}
            </div>

            {role && (
              <p className="text-xs text-center text-gray-400">
                {ROLES.find((r) => r.value === role)?.desc}
              </p>
            )}

            {/* Email Input */}
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!email || !role || loading}
              className="w-full h-12 bg-[#00539F] hover:bg-[#004080] text-base font-medium"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Send Login PIN
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-blue-300">
        HenHacks 2026 — Automation Systems & Public Infrastructure
      </p>
    </div>
  );
}
