"use client";

import { useRouter } from "next/navigation";
import { Wrench, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types";

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; color: string; bg: string; dot: string }
> = {
  user: {
    label: "Student",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
  technician: {
    label: "Technician",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  manager: {
    label: "Manager",
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
    dot: "bg-violet-500",
  },
};

interface PortalHeaderProps {
  role: UserRole;
  email: string;
}

export function PortalHeader({ role, email }: PortalHeaderProps) {
  const router = useRouter();
  const config = ROLE_CONFIG[role];

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center justify-between max-w-5xl mx-auto px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#FFD200] to-[#f5c400] p-1.5 rounded-xl shadow-sm">
            <Wrench className="h-4 w-4 text-[#00296b]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#00539F] text-lg tracking-tight">
              FixIt
            </span>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${config.bg} ${config.color}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 hidden sm:block max-w-[140px] truncate">
            {email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 w-8 p-0 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
