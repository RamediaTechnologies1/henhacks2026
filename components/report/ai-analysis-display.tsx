"use client";

import { Bot, AlertTriangle, Clock, Gauge, Sparkles, Shield, ShieldAlert, TrendingUp } from "lucide-react";
import type { AIAnalysis } from "@/lib/types";

interface AIAnalysisDisplayProps {
  analysis: AIAnalysis;
}

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; icon: string; glow: string }> = {
  critical: { bg: "bg-[#ef4444]/15 border-[#ef4444]/30", text: "text-[#ef4444]", icon: "!!", glow: "shadow-[#ef4444]/20" },
  high: { bg: "bg-[#f97316]/15 border-[#f97316]/30", text: "text-[#f97316]", icon: "!", glow: "shadow-[#f97316]/20" },
  medium: { bg: "bg-[#eab308]/15 border-[#eab308]/30", text: "text-[#eab308]", icon: "~", glow: "shadow-[#eab308]/20" },
  low: { bg: "bg-[#22c55e]/15 border-[#22c55e]/30", text: "text-[#22c55e]", icon: "-", glow: "shadow-[#22c55e]/20" },
};

const RISK_LABELS: Record<string, string> = {
  slip_fall: "Slip / Fall",
  fire_hazard: "Fire Hazard",
  electrical_shock: "Electrical Shock",
  structural_failure: "Structural Failure",
  water_damage: "Water Damage",
  air_quality: "Air Quality",
  security_vulnerability: "Security Risk",
  chemical_exposure: "Chemical Exposure",
};

function SafetyScoreBar({ score }: { score: number }) {
  const color = score >= 7 ? "#ef4444" : score >= 4 ? "#f97316" : score >= 2 ? "#eab308" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/[0.08] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score * 10}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{score}/10</span>
    </div>
  );
}

export function AIAnalysisDisplay({ analysis }: AIAnalysisDisplayProps) {
  const priority = PRIORITY_CONFIG[analysis.priority] || PRIORITY_CONFIG.medium;
  const confidence = Math.round(analysis.confidence_score * 100);
  const safetyRisks = (analysis.safety_risks || []).filter((r) => r !== "none");
  const safetyScore = analysis.safety_score ?? 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden page-enter">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#cccccc] px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-black/15 p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <span className="font-semibold text-sm text-black">AI Safety Analysis</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/15 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[11px] font-medium text-black/80">{confidence}% confident</span>
        </div>
      </div>

      <div className="p-5 space-y-4 stagger-enter">
        {/* Priority + Trade + Safety */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${priority.bg} ${priority.text} shadow-sm ${priority.glow}`}>
            {priority.icon} {analysis.priority.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-[#a1a1a1] border border-white/[0.08]">
            {analysis.trade.replace("_", " ").toUpperCase()}
          </span>
          {analysis.safety_concern && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/20">
              <AlertTriangle className="h-3 w-3" /> SAFETY HAZARD
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-[#a1a1a1] leading-relaxed">{analysis.description}</p>

        {/* Safety Intelligence Section */}
        {(safetyRisks.length > 0 || safetyScore > 0) && (
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#ef4444]" />
              <span className="text-[11px] font-bold text-[#ededed] uppercase tracking-wider">Safety Risk Assessment</span>
            </div>

            {/* Safety Score */}
            <SafetyScoreBar score={safetyScore} />

            {/* Risk Tags */}
            {safetyRisks.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {safetyRisks.map((risk) => (
                  <span key={risk} className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
                    {RISK_LABELS[risk] || risk}
                  </span>
                ))}
              </div>
            )}

            {/* Risk Escalation */}
            {analysis.risk_escalation && (
              <div className="flex gap-2 mt-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#f97316] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-[#f97316]/80 leading-relaxed">
                  <span className="font-bold text-[#f97316]">If unfixed: </span>
                  {analysis.risk_escalation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Suggested Action */}
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <p className="text-[11px] font-bold text-white uppercase tracking-wider mb-1.5">Recommended Action</p>
          <p className="text-sm text-[#a1a1a1] leading-relaxed">{analysis.suggested_action}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Clock, label: "Est. Time", value: analysis.estimated_time, color: "text-white", bg: "bg-white/15" },
            { icon: Gauge, label: "Confidence", value: `${confidence}%`, color: "text-[#888888]", bg: "bg-[#888888]/15" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.08] text-center">
              <div className={`${stat.bg} w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-[10px] text-[#64748b] font-medium">{stat.label}</p>
              <p className="text-xs font-bold text-[#ededed] mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
