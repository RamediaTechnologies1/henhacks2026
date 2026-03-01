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
    color: "text-[#ffffff]",
    bg: "bg-[#ffffff]/10 border-[#ffffff]/30",
    dot: "bg-[#ffffff]",
  },
  technician: {
    label: "Technician",
    color: "text-[#ffffff]",
    bg: "bg-[#ffffff]/10 border-[#ffffff]/30",
    dot: "bg-[#ffffff]",
  },
  manager: {
    label: "Manager",
    color: "text-[#888888]",
    bg: "bg-[#888888]/10 border-[#888888]/30",
    dot: "bg-[#888888]",
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
            <div className="absolute inset-0 bg-[#ffffff] rounded-xl blur-sm opacity-30" />
            <div className="relative bg-gradient-to-br from-[#ffffff] to-[#ffffff] p-1.5 rounded-xl shadow-sm shadow-[#ffffff]/20">
              <Wrench className="h-4 w-4 text-black" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-outfit)] text-[#ffffff] text-lg tracking-wide">
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
          <span className="text-[11px] text-[#666666] hidden sm:block max-w-[140px] truncate">
            {email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 w-8 p-0 rounded-xl text-[#666666] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
