"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/manager/stats-cards";
import { ReportsTable } from "@/components/manager/reports-table";
import { AssignmentPanel } from "@/components/manager/assignment-panel";
import { toast } from "sonner";
import type { Report, Assignment } from "@/lib/types";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { SafetyDashboard } from "@/components/manager/safety-dashboard";

const CampusMap = dynamic(
  () => import("@/components/map/campus-map").then((mod) => mod.CampusMap),
  {
    ssr: false,
    loading: () => <div className="h-[450px] skeleton-pulse rounded-[6px]" />,
  }
);

export default function ManagerDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [statFilter, setStatFilter] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [reportsRes, assignmentsRes] = await Promise.all([
        fetch("/api/reports"),
        fetch("/api/assignments"),
      ]);

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports || []);
      }

      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        setAssignments(data.assignments || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useRealtimeTable("reports", loadData);
  useRealtimeTable("assignments", loadData);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  async function handleAIAssign(reportId: string) {
    setAssigning(reportId);
    try {
      const res = await fetch("/api/ai-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: reportId }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "AI assignment failed");
        return;
      }

      const data = await res.json();
      toast.success(
        `AI assigned to ${data.technician.name} (score: ${data.score})`
      );
      loadData();
    } catch {
      toast.error("AI assignment failed");
    } finally {
      setAssigning(null);
    }
  }

  async function handleAutoAssignAll() {
    const unassigned = reports.filter((r) => r.status === "submitted");
    if (unassigned.length === 0) {
      toast.info("No unassigned reports");
      return;
    }

    for (const report of unassigned) {
      await handleAIAssign(report.id);
    }
  }

  let filteredReports = reports;
  if (statFilter === "open") filteredReports = reports.filter((r) => r.status !== "resolved");
  else if (statFilter === "safety") filteredReports = reports.filter((r) => r.safety_concern && r.status !== "resolved");
  else if (statFilter === "resolved") filteredReports = reports.filter((r) => r.status === "resolved");
  else if (statFilter === "ai_assigned") {
    const aiReportIds = new Set(assignments.filter((a) => a.assigned_by === "ai").map((a) => a.report_id));
    filteredReports = reports.filter((r) => aiReportIds.has(r.id));
  } else if (statFilter === "active_jobs") {
    const activeReportIds = new Set(assignments.filter((a) => ["pending", "accepted", "in_progress"].includes(a.status)).map((a) => a.report_id));
    filteredReports = reports.filter((r) => activeReportIds.has(r.id));
  }

  if (statusFilter !== "all") {
    filteredReports = filteredReports.filter((r) => r.status === statusFilter);
  }

  if (loading) {
    return (
      <div className="p-6 space-y-5">
        <div className="h-10 w-64 skeleton-pulse rounded-[6px]" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 skeleton-pulse rounded-[6px]" />
          ))}
        </div>
        <div className="h-96 skeleton-pulse rounded-[6px]" />
      </div>
    );
  }

  const unassignedCount = reports.filter((r) => r.status === "submitted").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-medium text-[#111111] dark:text-[#E5E7EB] tracking-[-0.01em]">Dashboard</h1>
          <p className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Automated maintenance assignment & oversight
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unassignedCount > 0 && (
            <Button
              onClick={handleAutoAssignAll}
              className="bg-[#00539F] dark:bg-[#3B82F6] hover:bg-[#003d75] dark:hover:bg-[#2563EB] text-white rounded-[6px] h-9 px-4 text-[14px] font-medium"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI assign all ({unassignedCount})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              loadData();
            }}
            className="rounded-[6px] h-9 w-9 p-0 border-[#E5E7EB] dark:border-[#262626] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#1C1C1E]"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards reports={reports} assignments={assignments} onFilterChange={setStatFilter} activeFilter={statFilter} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="reports">
        <TabsList className="rounded-[6px] h-9 bg-[#F3F4F6] dark:bg-[#1C1C1E] border border-[#E5E7EB] dark:border-[#262626] p-0.5">
          <TabsTrigger value="reports" className="rounded-[4px] text-[13px] font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-[#141415] data-[state=active]:text-[#111111] dark:data-[state=active]:text-[#E5E7EB] data-[state=active]:shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-[#6B7280] dark:text-[#9CA3AF] px-4">
            Reports
          </TabsTrigger>
          <TabsTrigger value="assignments" className="rounded-[4px] text-[13px] font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-[#141415] data-[state=active]:text-[#111111] dark:data-[state=active]:text-[#E5E7EB] data-[state=active]:shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-[#6B7280] dark:text-[#9CA3AF] px-4">
            Assignments
          </TabsTrigger>
          <TabsTrigger value="safety" className="rounded-[4px] text-[13px] font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-[#141415] data-[state=active]:text-[#111111] dark:data-[state=active]:text-[#E5E7EB] data-[state=active]:shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-[#6B7280] dark:text-[#9CA3AF] px-4">
            Safety
          </TabsTrigger>
          <TabsTrigger value="map" className="rounded-[4px] text-[13px] font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-[#141415] data-[state=active]:text-[#111111] dark:data-[state=active]:text-[#E5E7EB] data-[state=active]:shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-[#6B7280] dark:text-[#9CA3AF] px-4">
            Campus Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4">
          <ReportsTable
            reports={filteredReports}
            assignments={assignments}
            onAssign={handleAIAssign}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <AssignmentPanel assignments={assignments} />
        </TabsContent>

        <TabsContent value="safety" className="mt-4">
          <SafetyDashboard reports={reports} assignments={assignments} />
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <div className="map-container">
            <CampusMap reports={reports} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
