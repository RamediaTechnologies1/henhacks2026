"use client";

import { Shield, ShieldAlert, AlertTriangle, Building2, TrendingUp, Clock, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Report, Assignment } from "@/lib/types";

interface SafetyDashboardProps {
  reports: Report[];
  assignments: Assignment[];
}

interface BuildingSafety {
  name: string;
  score: number;
  openSafety: number;
  totalOpen: number;
  avgResolutionHours: number | null;
  risks: string[];
}

function computeBuildingSafety(reports: Report[], assignments: Assignment[]): BuildingSafety[] {
  const buildingMap = new Map<string, Report[]>();

  for (const r of reports) {
    const list = buildingMap.get(r.building) || [];
    list.push(r);
    buildingMap.set(r.building, list);
  }

  const results: BuildingSafety[] = [];

  for (const [name, bReports] of buildingMap) {
    const open = bReports.filter((r) => r.status !== "resolved");
    const openSafety = open.filter((r) => r.safety_concern).length;
    const totalOpen = open.length;

    // Compute avg resolution time from resolved reports
    const resolved = bReports.filter((r) => r.status === "resolved");
    let avgResolutionHours: number | null = null;
    if (resolved.length > 0) {
      const totalHours = resolved.reduce((acc, r) => {
        const created = new Date(r.created_at).getTime();
        const updated = new Date(r.updated_at).getTime();
        return acc + (updated - created) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolved.length);
    }

    // Collect unique risk types from open reports
    const risks = new Set<string>();
    for (const r of open) {
      if (r.safety_concern) {
        const trade = r.trade;
        if (trade === "electrical") risks.add("electrical_shock");
        if (trade === "plumbing") risks.add("water_damage");
        if (trade === "hvac") risks.add("air_quality");
        if (trade === "structural") risks.add("structural_failure");
        if (trade === "safety_hazard") risks.add("fire_hazard");
      }
    }

    // Safety score: 0 (safe) to 10 (dangerous)
    // Factors: open safety issues (weight 3), total open (weight 1), high priority count (weight 2)
    const criticalCount = open.filter((r) => r.priority === "critical").length;
    const highCount = open.filter((r) => r.priority === "high").length;
    const score = Math.min(10, Math.round(
      openSafety * 3 + criticalCount * 2.5 + highCount * 1.5 + totalOpen * 0.3
    ));

    results.push({ name, score, openSafety, totalOpen, avgResolutionHours, risks: Array.from(risks) });
  }

  return results.sort((a, b) => b.score - a.score);
}

function getScoreColor(score: number): string {
  if (score >= 7) return "#ef4444";
  if (score >= 4) return "#f97316";
  if (score >= 2) return "#eab308";
  return "#22c55e";
}

function getScoreLabel(score: number): string {
  if (score >= 7) return "CRITICAL";
  if (score >= 4) return "AT RISK";
  if (score >= 2) return "CAUTION";
  return "SAFE";
}

const RISK_LABELS: Record<string, string> = {
  slip_fall: "Slip/Fall",
  fire_hazard: "Fire",
  electrical_shock: "Electrical",
  structural_failure: "Structural",
  water_damage: "Water",
  air_quality: "Air Quality",
  security_vulnerability: "Security",
  chemical_exposure: "Chemical",
};

function SafetyScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 18;
  const progress = (score / 10) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
        <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="20" cy="20" r="18" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export function SafetyDashboard({ reports, assignments }: SafetyDashboardProps) {
  const buildingSafety = computeBuildingSafety(reports, assignments);
  const totalSafetyIssues = reports.filter((r) => r.safety_concern && r.status !== "resolved").length;
  const criticalUnresolved = reports.filter((r) => r.priority === "critical" && r.status !== "resolved").length;
  const safetyResolvedToday = reports.filter((r) => {
    if (r.status !== "resolved" || !r.safety_concern) return false;
    const today = new Date();
    const updated = new Date(r.updated_at);
    return updated.toDateString() === today.toDateString();
  }).length;

  // Compute campus-wide safety score
  const campusScore = buildingSafety.length > 0
    ? Math.round(buildingSafety.reduce((acc, b) => acc + b.score, 0) / buildingSafety.length)
    : 0;

  // Predictive safety: cluster detection
  const buildingTradeMap = new Map<string, Map<string, number>>();
  for (const r of reports.filter((r) => r.status !== "resolved")) {
    const key = r.building;
    if (!buildingTradeMap.has(key)) buildingTradeMap.set(key, new Map());
    const tradeMap = buildingTradeMap.get(key)!;
    tradeMap.set(r.trade, (tradeMap.get(r.trade) || 0) + 1);
  }

  const predictions: { building: string; message: string; severity: string }[] = [];
  for (const [building, tradeMap] of buildingTradeMap) {
    for (const [trade, count] of tradeMap) {
      if (count >= 2) {
        const messages: Record<string, string> = {
          plumbing: `${count} plumbing reports — potential pipe deterioration. Risk: water damage, mold growth, slip hazards`,
          electrical: `${count} electrical reports — possible wiring degradation. Risk: fire hazard, electrical shock`,
          hvac: `${count} HVAC reports — system may be failing. Risk: air quality decline, temperature extremes`,
          structural: `${count} structural reports — building integrity concern. Risk: structural failure, falling debris`,
          safety_hazard: `${count} safety reports — active danger zone. Risk: immediate harm to occupants`,
        };
        predictions.push({
          building,
          message: messages[trade] || `${count} ${trade} reports clustered`,
          severity: count >= 3 ? "critical" : "warning",
        });
      }
    }
  }

  return (
    <div className="space-y-5 stagger-enter">
      {/* Campus Safety Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-white/[0.08] bg-white/[0.04]">
          <CardContent className="p-4 flex items-center gap-3">
            <SafetyScoreRing score={campusScore} />
            <div>
              <p className="text-lg font-bold text-[#ededed]">{getScoreLabel(campusScore)}</p>
              <p className="text-[10px] text-[#666666] font-medium">Campus Safety</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/[0.08] bg-white/[0.04]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-[#ef4444]/15 p-2.5 rounded-xl">
              <ShieldAlert className="h-5 w-5 text-[#ef4444]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#ededed]">{totalSafetyIssues}</p>
              <p className="text-[10px] text-[#666666] font-medium">Active Hazards</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/[0.08] bg-white/[0.04]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-[#f97316]/15 p-2.5 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-[#f97316]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#ededed]">{criticalUnresolved}</p>
              <p className="text-[10px] text-[#666666] font-medium">Critical Unresolved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/[0.08] bg-white/[0.04]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-[#22c55e]/15 p-2.5 rounded-xl">
              <Shield className="h-5 w-5 text-[#22c55e]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#22c55e]">{safetyResolvedToday}</p>
              <p className="text-[10px] text-[#666666] font-medium">Resolved Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Safety Alerts */}
      {predictions.length > 0 && (
        <Card className="rounded-2xl border-[#ef4444]/20 bg-[#ef4444]/[0.03]">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#ef4444]" />
              <span className="text-sm font-bold text-[#ededed]">Predictive Safety Alerts</span>
              <span className="text-[10px] bg-[#ef4444]/15 text-[#ef4444] px-2 py-0.5 rounded-full font-semibold">
                {predictions.length} detected
              </span>
            </div>
            <div className="space-y-2">
              {predictions.map((p, i) => (
                <div key={i} className={`flex gap-3 p-3 rounded-xl border ${
                  p.severity === "critical"
                    ? "bg-[#ef4444]/10 border-[#ef4444]/20"
                    : "bg-[#f97316]/10 border-[#f97316]/20"
                }`}>
                  <div className={`w-1.5 rounded-full flex-shrink-0 ${
                    p.severity === "critical" ? "bg-[#ef4444]" : "bg-[#f97316]"
                  }`} />
                  <div>
                    <p className="text-xs font-bold text-[#ededed]">{p.building}</p>
                    <p className="text-[11px] text-[#a1a1a1] leading-relaxed mt-0.5">{p.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Building Safety Index */}
      <div>
        <div className="section-header mb-3">
          <h2 className="font-bold text-lg text-[#ededed] font-[family-name:var(--font-outfit)]">Building Safety Index</h2>
          <p className="text-xs text-[#666666] mt-0.5">Real-time safety scoring per building</p>
        </div>

        {buildingSafety.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7 text-[#22c55e]" />
            </div>
            <p className="text-[#22c55e] font-medium">All Clear</p>
            <p className="text-[#666666] text-sm mt-1">No safety concerns detected across campus.</p>
          </div>
        )}

        <div className="space-y-2">
          {buildingSafety.map((b) => {
            const color = getScoreColor(b.score);
            return (
              <Card key={b.name} className="rounded-2xl border-white/[0.08] bg-white/[0.04] overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <SafetyScoreRing score={b.score} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#ededed]">{b.name}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                          backgroundColor: `${color}20`,
                          color,
                        }}>
                          {getScoreLabel(b.score)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#666666]">
                        <span>{b.totalOpen} open</span>
                        {b.openSafety > 0 && (
                          <span className="text-[#ef4444] font-semibold">{b.openSafety} safety</span>
                        )}
                        {b.avgResolutionHours !== null && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            avg {b.avgResolutionHours}h resolution
                          </span>
                        )}
                      </div>
                      {b.risks.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {b.risks.map((risk) => (
                            <span key={risk} className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-[#ef4444]/10 text-[#ef4444]/80 border border-[#ef4444]/15">
                              {RISK_LABELS[risk] || risk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
