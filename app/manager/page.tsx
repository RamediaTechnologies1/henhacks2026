"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCards } from "@/components/manager/stats-cards";
import { ReportsTable } from "@/components/manager/reports-table";
import { AssignmentPanel } from "@/components/manager/assignment-panel";
import { toast } from "sonner";
import type { Report, Assignment } from "@/lib/types";

const CampusMap = dynamic(
  () => import("@/components/map/campus-map").then((mod) => mod.CampusMap),
  {
    ssr: false,
    loading: () => <div className="h-[450px] bg-[#2d2418] rounded-2xl animate-pulse" />,
  }
);

export default function ManagerDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
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

  const filteredReports =
    statusFilter === "all"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  if (loading) {
    return (
      <div className="p-6 space-y-5 page-enter">
        <Skeleton className="h-16 rounded-2xl bg-[#2d2418]" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl bg-[#2d2418]" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl bg-[#2d2418]" />
      </div>
    );
  }

  const unassignedCount = reports.filter((r) => r.status === "submitted").length;

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="section-header">
          <h1 className="text-2xl font-bold text-[#f4e4c1] tracking-tight">AI Manager Dashboard</h1>
          <p className="text-sm text-[#6b5e4f] mt-0.5">
            Automated maintenance assignment & oversight
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unassignedCount > 0 && (
            <Button
              onClick={handleAutoAssignAll}
              className="btn-western rounded-xl h-10 px-5"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assign All ({unassignedCount})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              loadData();
            }}
            className="rounded-xl h-10 w-10 p-0 border-[#3d3124] text-[#9c8e7c] hover:bg-[#2d2418]"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards reports={reports} assignments={assignments} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="reports">
        <TabsList className="rounded-xl h-11 bg-[#1a1410] border border-[#3d3124] p-1">
          <TabsTrigger value="reports" className="rounded-lg text-sm font-semibold data-[state=active]:bg-[#2d2418] data-[state=active]:text-[#c8a55c] text-[#6b5e4f] px-6">
            Reports
          </TabsTrigger>
          <TabsTrigger value="assignments" className="rounded-lg text-sm font-semibold data-[state=active]:bg-[#2d2418] data-[state=active]:text-[#c8a55c] text-[#6b5e4f] px-6">
            Assignments
          </TabsTrigger>
          <TabsTrigger value="map" className="rounded-lg text-sm font-semibold data-[state=active]:bg-[#2d2418] data-[state=active]:text-[#c8a55c] text-[#6b5e4f] px-6">
            Campus Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-5">
          <ReportsTable
            reports={filteredReports}
            onAssign={handleAIAssign}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </TabsContent>

        <TabsContent value="assignments" className="mt-5">
          <AssignmentPanel assignments={assignments} />
        </TabsContent>

        <TabsContent value="map" className="mt-5">
          <div className="map-container">
            <CampusMap reports={reports} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
