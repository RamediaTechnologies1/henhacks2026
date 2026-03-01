"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  User,
  HardHat,
  Shield,
  ArrowRight,
  Loader2,
  Zap,
  Camera,
  Brain,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";

const ROLES: {
  value: UserRole;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
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
    desc: "View & complete work orders",
  },
  {
    value: "manager",
    label: "Manager",
    icon: <Shield className="h-6 w-6" />,
    desc: "AI dashboard & oversight",
  },
];

const ROLE_ACTIVE: Record<UserRole, string> = {
  user: "border-[#4a6fa5] bg-[#4a6fa5]/10 shadow-[#4a6fa5]/20",
  technician: "border-[#6b7c5e] bg-[#6b7c5e]/10 shadow-[#6b7c5e]/20",
  manager: "border-[#c8a55c] bg-[#c8a55c]/10 shadow-[#c8a55c]/20",
};

const ROLE_ICON_ACTIVE: Record<UserRole, string> = {
  user: "text-[#4a6fa5] bg-[#4a6fa5]/15",
  technician: "text-[#6b7c5e] bg-[#6b7c5e]/15",
  manager: "text-[#c8a55c] bg-[#c8a55c]/15",
};

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
    <div className="fixit-gradient-bg min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Floating ember orbs */}
      <div className="floating-orb w-72 h-72 bg-[#c8a55c] top-10 -left-20" />
      <div className="floating-orb w-96 h-96 bg-[#b87333] bottom-10 -right-20" style={{ animationDelay: "-7s" }} />
      <div className="floating-orb w-48 h-48 bg-[#8b3a1a] top-1/3 right-1/4" style={{ animationDelay: "-12s" }} />

      <div className="relative z-10 w-full max-w-md page-enter">
        {/* Logo + Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative star-badge">
              <div className="absolute inset-0 bg-[#c8a55c] rounded-2xl blur-lg opacity-30" />
              <div className="relative bg-gradient-to-br from-[#c8a55c] to-[#9a7d3f] p-4 rounded-2xl shadow-lg shadow-[#c8a55c]/20">
                <Wrench className="h-10 w-10 text-[#0d0a07]" />
              </div>
            </div>
          </div>
          <h1 className="font-[family-name:var(--font-western)] text-4xl text-[#c8a55c] tracking-wide">
            FixIt AI
          </h1>
          <p className="text-[#9c8e7c] mt-1 text-sm font-medium">
            University of Delaware &middot; Campus Maintenance
          </p>

          {/* Feature pills */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[
              { icon: Camera, label: "Snap" },
              { icon: Brain, label: "AI Analyze" },
              { icon: Zap, label: "Auto-Fix" },
            ].map((f) => (
              <div
                key={f.label}
                className="glass-card-dark flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-[#e8d5a3]"
              >
                <f.icon className="h-3 w-3 text-[#c8a55c]" />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          {/* Decorative stitching */}
          <div className="western-divider" />

          <div className="text-center">
            <h2 className="text-xl font-bold text-[#f4e4c1]">Welcome, Partner</h2>
            <p className="text-sm text-[#9c8e7c] mt-1">
              Select your role to ride in
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2.5 stagger-enter">
              {ROLES.map((r) => {
                const isActive = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`w-full flex items-center gap-4 rounded-xl p-4 border transition-all duration-200 text-left press-scale ${
                      isActive
                        ? `${ROLE_ACTIVE[r.value]} shadow-lg border-2`
                        : "border-[#3d3124] hover:border-[#4d3f30] hover:bg-[#2d2418]/50"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isActive ? ROLE_ICON_ACTIVE[r.value] : "text-[#9c8e7c] bg-[#2d2418]"
                      }`}
                    >
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-[15px] ${isActive ? "text-[#f4e4c1]" : "text-[#e8d5a3]"}`}>
                        {r.label}
                      </p>
                      <p className="text-xs text-[#9c8e7c] mt-0.5">{r.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                        isActive
                          ? "border-[#c8a55c] bg-[#c8a55c]"
                          : "border-[#3d3124]"
                      }`}
                    >
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-[#0d0a07]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9c8e7c]" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-13 pl-11 text-[15px] rounded-xl border-[#3d3124] bg-[#1a1410] text-[#f4e4c1] placeholder:text-[#6b5e4f]"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!email || !role || loading}
              className={`w-full h-13 rounded-xl text-[15px] font-bold transition-all duration-300 ${
                role
                  ? "btn-western"
                  : "bg-[#2d2418] text-[#6b5e4f] border border-[#3d3124]"
              }`}
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
