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
  user: "border-white bg-white/10 shadow-white/20",
  technician: "border-white bg-white/10 shadow-white/20",
  manager: "border-[#888888] bg-[#888888]/10 shadow-[#888888]/20",
};

const ROLE_ICON_ACTIVE: Record<UserRole, string> = {
  user: "text-white bg-white/15",
  technician: "text-white bg-white/15",
  manager: "text-[#888888] bg-[#888888]/15",
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
      <div className="relative z-10 w-full max-w-md page-enter">
        {/* Logo + Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl blur-lg opacity-30" />
              <div className="relative bg-gradient-to-br from-white to-[#cccccc] p-4 rounded-2xl shadow-lg shadow-white/20">
                <Wrench className="h-10 w-10 text-black" />
              </div>
            </div>
          </div>
          <h1 className="font-[family-name:var(--font-outfit)] text-4xl text-white tracking-wide">
            FixIt AI
          </h1>
          <p className="text-[#666666] mt-1 text-sm font-medium">
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
                className="glass-card-dark flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-[#a1a1a1]"
              >
                <f.icon className="h-3 w-3 text-white" />
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
            <h2 className="text-xl font-bold text-[#ededed]">Welcome back</h2>
            <p className="text-sm text-[#666666] mt-1">
              Select your role to continue
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
                        : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isActive ? ROLE_ICON_ACTIVE[r.value] : "text-[#666666] bg-white/[0.04]"
                      }`}
                    >
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-[15px] ${isActive ? "text-[#ededed]" : "text-[#a1a1a1]"}`}>
                        {r.label}
                      </p>
                      <p className="text-xs text-[#666666] mt-0.5">{r.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                        isActive
                          ? "border-white bg-white"
                          : "border-white/[0.08]"
                      }`}
                    >
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-black" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-13 pl-11 text-[15px] rounded-xl border-white/[0.08] bg-white/5 text-[#ededed] placeholder:text-[#484f58]"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!email || !role || loading}
              className={`w-full h-13 rounded-xl text-[15px] font-bold transition-all duration-300 ${
                role
                  ? "btn-western"
                  : "bg-white/5 text-[#484f58] border border-white/[0.08]"
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
        <p className="text-center mt-6 text-xs text-[#484f58] font-medium tracking-wide">
          HenHacks 2026 &middot; Automation Systems & Public Infrastructure
        </p>
      </div>
    </div>
  );
}
