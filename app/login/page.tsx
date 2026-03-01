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
  gradient: string;
  activeGradient: string;
}[] = [
  {
    value: "user",
    label: "Student",
    icon: <User className="h-7 w-7" />,
    desc: "Report a maintenance issue",
    gradient: "from-blue-500/10 to-cyan-500/10",
    activeGradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    value: "technician",
    label: "Technician",
    icon: <HardHat className="h-7 w-7" />,
    desc: "View & complete work orders",
    gradient: "from-emerald-500/10 to-teal-500/10",
    activeGradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    value: "manager",
    label: "Manager",
    icon: <Shield className="h-7 w-7" />,
    desc: "AI dashboard & oversight",
    gradient: "from-violet-500/10 to-purple-500/10",
    activeGradient: "from-violet-500/20 to-purple-500/20",
  },
];

const ROLE_BORDER: Record<UserRole, string> = {
  user: "border-blue-500 shadow-blue-500/20",
  technician: "border-emerald-500 shadow-emerald-500/20",
  manager: "border-violet-500 shadow-violet-500/20",
};

const ROLE_TEXT: Record<UserRole, string> = {
  user: "text-blue-600",
  technician: "text-emerald-600",
  manager: "text-violet-600",
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
      {/* Floating decorative orbs */}
      <div className="floating-orb w-72 h-72 bg-[#FFD200] top-10 -left-20" />
      <div className="floating-orb w-96 h-96 bg-blue-400 bottom-10 -right-20" style={{ animationDelay: "-7s" }} />
      <div className="floating-orb w-48 h-48 bg-cyan-400 top-1/3 right-1/4" style={{ animationDelay: "-12s" }} />

      <div className="relative z-10 w-full max-w-md page-enter">
        {/* Logo + Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFD200] rounded-2xl blur-lg opacity-40" />
              <div className="relative bg-[#FFD200] p-4 rounded-2xl shadow-lg">
                <Wrench className="h-10 w-10 text-[#00296b]" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            FixIt AI
          </h1>
          <p className="text-blue-200/80 mt-1 text-sm font-medium">
            University of Delaware Campus Maintenance
          </p>

          {/* Feature pills */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[
              { icon: Camera, label: "Snap" },
              { icon: Brain, label: "AI Analyze" },
              { icon: Zap, label: "Auto-Fix" },
            ].map((f, i) => (
              <div
                key={f.label}
                className="glass-card-dark flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-blue-100"
              >
                <f.icon className="h-3 w-3 text-[#FFD200]" />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select your role to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-2.5 stagger-enter">
              {ROLES.map((r) => {
                const isActive = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`w-full flex items-center gap-4 rounded-2xl p-4 border-2 transition-all duration-200 text-left press-scale ${
                      isActive
                        ? `${ROLE_BORDER[r.value]} bg-gradient-to-r ${r.activeGradient} shadow-lg`
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${r.gradient} transition-colors ${
                        isActive ? ROLE_TEXT[r.value] : "text-gray-400"
                      }`}
                    >
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-[15px] ${
                          isActive ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {r.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                        isActive
                          ? `${ROLE_BORDER[r.value].split(" ")[0]} bg-current`
                          : "border-gray-200"
                      }`}
                    >
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-13 pl-11 text-[15px] rounded-xl border-gray-200 focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]/20 bg-gray-50/50"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!email || !role || loading}
              className={`w-full h-13 rounded-xl text-[15px] font-semibold transition-all duration-300 shadow-lg ${
                role
                  ? "bg-gradient-to-r from-[#00539F] to-[#0066cc] hover:from-[#004080] hover:to-[#00539F] shadow-blue-500/25"
                  : "bg-gray-300"
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
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-blue-300/60 font-medium">
          HenHacks 2026 &middot; Automation Systems & Public Infrastructure
        </p>
      </div>
    </div>
  );
}
