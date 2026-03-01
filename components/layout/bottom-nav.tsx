"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav-glass border-t border-[#3d3124] px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-2xl transition-all duration-200 press-scale ${
                isActive
                  ? "text-[#c8a55c]"
                  : "text-[#6b5e4f] hover:text-[#9c8e7c]"
              }`}
            >
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#c8a55c] to-[#b87333] rounded-full shadow-sm shadow-[#c8a55c]/30" />
              )}
              <div className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? "text-[#c8a55c]" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
