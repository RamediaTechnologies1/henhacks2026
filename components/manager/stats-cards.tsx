"use client";

import { ClipboardList, AlertTriangle, CheckCircle2, Clock, Users, Bot } from "lucide-react";
import type { Report, Assignment } from "@/lib/types";

interface StatsCardsProps {
  reports: Report[];
  assignments: Assignment[];
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
}

export function StatsCards({ reports, assignments, onFilterChange, activeFilter }: StatsCardsProps) {
  const openReports = reports.filter((r) => r.status !== "resolved").length;
  const safetyIssues = reports.filter((r) => r.safety_concern && r.status !== "resolved").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;
  const aiAssigned = assignments.filter((a) => a.assigned_by === "ai").length;
  const activeJobs = assignments.filter((a) => ["pending", "accepted", "in_progress"].includes(a.status)).length;
  const avgResponse = assignments.length > 0
    ? Math.round(
        assignments
          .filter((a) => a.started_at)
          .reduce((acc, a) => {
            const created = new Date(a.created_at).getTime();
            const started = new Date(a.started_at!).getTime();
            return acc + (started - created) / (1000 * 60);
          }, 0) / Math.max(1, assignments.filter((a) => a.started_at).length)
      )
    : 0;

  const stats = [
    {
      label: "Open Reports",
      value: openReports,
      icon: ClipboardList,
      color: "text-[#ffffff]",
      iconBg: "bg-[#ffffff]/15",
      filterKey: "open",
    },
    {
      label: "Safety Issues",
      value: safetyIssues,
      icon: AlertTriangle,
      color: "text-[#ef4444]",
      iconBg: "bg-[#ef4444]/15",
      filterKey: "safety",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      color: "text-[#ffffff]",
      iconBg: "bg-[#ffffff]/15",
      filterKey: "resolved",
    },
    {
      label: "AI Assigned",
      value: aiAssigned,
      icon: Bot,
      color: "text-[#888888]",
      iconBg: "bg-[#888888]/15",
      filterKey: "ai_assigned",
    },
    {
      label: "Active Jobs",
      value: activeJobs,
      icon: Users,
      color: "text-[#f97316]",
      iconBg: "bg-[#f97316]/15",
      filterKey: "active_jobs",
    },
    {
      label: "Avg Response",
      value: `${avgResponse}m`,
      icon: Clock,
      color: "text-[#666666]",
      iconBg: "bg-[#666666]/15",
      filterKey: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 stagger-enter">
      {stats.map((stat) => {
        const isActive = activeFilter === stat.filterKey;
        const isClickable = !!stat.filterKey;
        return (
          <div
            key={stat.label}
            onClick={() => {
              if (!isClickable || !onFilterChange) return;
              onFilterChange(isActive ? "" : stat.filterKey);
            }}
            className={`glass-card rounded-2xl p-4 card-hover-lift transition-all ${
              isClickable ? "cursor-pointer" : ""
            } ${isActive ? "ring-1 ring-white/30 bg-white/[0.08]" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.iconBg} p-2.5 rounded-xl`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-[#ededed] tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-[#666666] font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
