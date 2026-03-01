"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HardHat, RefreshCw, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/technician/job-card";
import type { Assignment } from "@/lib/types";

export default function TechnicianPortal() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [refreshing, setRefreshing] = useState(false);

  const loadAssignments = useCallback(async () => {
    try {
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) return;
      const { email } = await sessionRes.json();

      const res = await fetch(`/api/assignments?technician_email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
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
    loadAssignments();
    const interval = setInterval(loadAssignments, 30000);
    return () => clearInterval(interval);
  }, [loadAssignments]);

  const activeCount = assignments.filter((a) => ["pending", "accepted", "in_progress"].includes(a.status)).length;
  const completedCount = assignments.filter((a) => a.status === "completed").length;

  const filtered = assignments.filter((a) => {
    if (filter === "active") return ["pending", "accepted", "in_progress"].includes(a.status);
    if (filter === "completed") return a.status === "completed";
    return true;
  });

  return (
    <div className="p-4 space-y-4 page-enter">
      <div className="flex items-center justify-between">
        <div className="section-header">
          <h1 className="text-xl font-bold text-[#f4e4c1]">My Jobs</h1>
          <p className="text-xs text-[#6b5e4f] mt-0.5">
            {activeCount > 0 ? `${activeCount} active assignment${activeCount !== 1 ? "s" : ""}` : "No active assignments"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setRefreshing(true); loadAssignments(); }}
          className="rounded-xl h-9 w-9 p-0 border-[#3d3124] text-[#9c8e7c] hover:bg-[#2d2418]"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="w-full rounded-xl h-11 bg-[#1a1410] border border-[#3d3124] p-1">
          <TabsTrigger value="active" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-[#2d2418] data-[state=active]:text-[#c8a55c] text-[#6b5e4f]">
            Active ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-[#2d2418] data-[state=active]:text-[#c8a55c] text-[#6b5e4f]">
            Done ({completedCount})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-[#2d2418] data-[state=active]:text-[#c8a55c] text-[#6b5e4f]">
            All ({assignments.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && (
        <div className="space-y-3 stagger-enter">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-[#2d2418]" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-[#2d2418] flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-8 w-8 text-[#6b5e4f]" />
          </div>
          <p className="text-[#9c8e7c] font-medium mb-1">
            {filter === "completed" ? "No completed jobs" : filter === "active" ? "No active jobs" : "No jobs found"}
          </p>
          <p className="text-[#6b5e4f] text-sm">
            {filter === "active" ? "New assignments will appear here automatically." : "Jobs will appear here when assigned."}
          </p>
        </div>
      )}

      <div className="space-y-3 stagger-enter">
        {filtered.map((assignment) => (
          <JobCard
            key={assignment.id}
            assignment={assignment}
            onClick={() => router.push(`/technician/job/${assignment.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
