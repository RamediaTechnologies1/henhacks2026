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
    color: "text-[#4a6fa5]",
    bg: "bg-[#4a6fa5]/10 border-[#4a6fa5]/30",
    dot: "bg-[#4a6fa5]",
  },
  technician: {
    label: "Technician",
    color: "text-[#6b7c5e]",
    bg: "bg-[#6b7c5e]/10 border-[#6b7c5e]/30",
    dot: "bg-[#6b7c5e]",
  },
  manager: {
    label: "Manager",
    color: "text-[#c8a55c]",
    bg: "bg-[#c8a55c]/10 border-[#c8a55c]/30",
    dot: "bg-[#c8a55c]",
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
    <header className="sticky top-0 z-50 header-glass">
      <div className="flex items-center justify-between max-w-5xl mx-auto px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#c8a55c] rounded-xl blur-sm opacity-30" />
            <div className="relative bg-gradient-to-br from-[#c8a55c] to-[#9a7d3f] p-1.5 rounded-xl shadow-sm shadow-[#c8a55c]/20">
              <Wrench className="h-4 w-4 text-[#0d0a07]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-western)] text-[#c8a55c] text-lg tracking-wide">
              FixIt
            </span>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${config.bg} ${config.color}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${config.dot} dot-breathing`} />
              {config.label}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#6b5e4f] hidden sm:block max-w-[140px] truncate">
            {email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 w-8 p-0 rounded-xl text-[#9c8e7c] hover:text-[#c44536] hover:bg-[#c44536]/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
