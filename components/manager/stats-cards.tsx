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
      color: "text-blue-600",
      iconBg: "bg-blue-100",
      cardClass: "stat-card-blue",
    },
    {
      label: "Safety Issues",
      value: safetyIssues,
      icon: AlertTriangle,
      color: "text-red-600",
      iconBg: "bg-red-100",
      cardClass: "stat-card-red",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      color: "text-emerald-600",
      iconBg: "bg-emerald-100",
      cardClass: "stat-card-green",
    },
    {
      label: "AI Assigned",
      value: aiAssigned,
      icon: Bot,
      color: "text-purple-600",
      iconBg: "bg-purple-100",
      cardClass: "stat-card-purple",
    },
    {
      label: "Active Jobs",
      value: activeJobs,
      icon: Users,
      color: "text-orange-600",
      iconBg: "bg-orange-100",
      cardClass: "stat-card-orange",
    },
    {
      label: "Avg Response",
      value: `${avgResponse}m`,
      icon: Clock,
      color: "text-gray-600",
      iconBg: "bg-gray-100",
      cardClass: "stat-card-gray",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 stagger-enter">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.cardClass} rounded-2xl p-4 card-hover-lift`}
        >
          <div className="flex items-center gap-3">
            <div className={`${stat.iconBg} p-2.5 rounded-xl`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
