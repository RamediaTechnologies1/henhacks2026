"use client";

import { useRouter } from "next/navigation";
import { Wrench, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/lib/types";

const ROLE_LABELS: Record<UserRole, string> = {
  user: "Student",
  technician: "Technician",
  manager: "Manager",
};

const ROLE_COLORS: Record<UserRole, string> = {
  user: "bg-blue-100 text-blue-700",
  technician: "bg-green-100 text-green-700",
  manager: "bg-purple-100 text-purple-700",
};

interface PortalHeaderProps {
  role: UserRole;
  email: string;
}

export function PortalHeader({ role, email }: PortalHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-[#FFD200] p-1.5 rounded-lg">
            <Wrench className="h-4 w-4 text-[#00539F]" />
          </div>
          <span className="font-bold text-[#00539F] text-lg">FixIt AI</span>
          <Badge variant="secondary" className={ROLE_COLORS[role]}>
            {ROLE_LABELS[role]}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">{email}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
