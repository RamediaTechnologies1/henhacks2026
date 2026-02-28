"use client";

import { ClipboardList, AlertTriangle, CheckCircle2, Clock, Users, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      bg: "bg-blue-50",
    },
    {
      label: "Safety Issues",
      value: safetyIssues,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "AI Assigned",
      value: aiAssigned,
      icon: Bot,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Active Jobs",
      value: activeJobs,
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Avg Response",
      value: `${avgResponse}m`,
      icon: Clock,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className={`${stat.bg} p-2 rounded-lg`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
