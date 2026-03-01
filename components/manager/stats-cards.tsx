"use client";

import { ClipboardList, AlertTriangle, CheckCircle2, Clock, Users, Bot } from "lucide-react";
import type { Report, Assignment } from "@/lib/types";

interface StatsCardsProps {
  reports: Report[];
  assignments: Assignment[];
}

export function StatsCards({ reports, assignments }: StatsCardsProps) {
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
      color: "text-[#4a6fa5]",
      iconBg: "bg-[#4a6fa5]/15",
    },
    {
      label: "Safety Issues",
      value: safetyIssues,
      icon: AlertTriangle,
      color: "text-[#c44536]",
      iconBg: "bg-[#c44536]/15",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      color: "text-[#6b7c5e]",
      iconBg: "bg-[#6b7c5e]/15",
    },
    {
      label: "AI Assigned",
      value: aiAssigned,
      icon: Bot,
      color: "text-[#c8a55c]",
      iconBg: "bg-[#c8a55c]/15",
    },
    {
      label: "Active Jobs",
      value: activeJobs,
      icon: Users,
      color: "text-[#b87333]",
      iconBg: "bg-[#b87333]/15",
    },
    {
      label: "Avg Response",
      value: `${avgResponse}m`,
      icon: Clock,
      color: "text-[#9c8e7c]",
      iconBg: "bg-[#9c8e7c]/15",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 stagger-enter">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="dark-stat-card rounded-2xl p-4 card-hover-lift"
        >
          <div className="flex items-center gap-3">
            <div className={`${stat.iconBg} p-2.5 rounded-xl`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#f4e4c1] tracking-tight">{stat.value}</p>
              <p className="text-[10px] text-[#6b5e4f] font-medium">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
