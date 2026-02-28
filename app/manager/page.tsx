"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { RefreshCw, Bot, Loader2 } from "lucide-react";
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
    loading: () => <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse" />,
  }
);

export default function ManagerDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigning, setAssigning] = useState<string | null>(null);

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
      <div className="p-6 space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const unassignedCount = reports.filter((r) => r.status === "submitted").length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Manager Dashboard</h1>
          <p className="text-sm text-gray-500">
            Automated maintenance assignment & oversight
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unassignedCount > 0 && (
            <Button onClick={handleAutoAssignAll} className="bg-purple-600 hover:bg-purple-700">
              <Bot className="h-4 w-4 mr-2" />
              AI Assign All ({unassignedCount})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              loadData();
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards reports={reports} assignments={assignments} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="map">Campus Map</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4">
          <ReportsTable
            reports={filteredReports}
            onAssign={handleAIAssign}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <AssignmentPanel assignments={assignments} />
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <CampusMap reports={reports} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
