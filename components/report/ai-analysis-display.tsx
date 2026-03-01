"use client";

import { AlertTriangle, Clock, ShieldAlert, TrendingUp } from "lucide-react";
import type { AIAnalysis } from "@/lib/types";

interface AIAnalysisDisplayProps {
  analysis: AIAnalysis;
}

const PRIORITY_CONFIG: Record<string, { border: string; text: string; bg: string }> = {
  critical: { border: "border-[#DC2626]", text: "text-[#DC2626]", bg: "bg-[#FEF2F2]" },
  high: { border: "border-[#F59E0B]", text: "text-[#F59E0B]", bg: "bg-[#FFFBEB]" },
  medium: { border: "border-[#00539F]", text: "text-[#00539F]", bg: "bg-[#EFF6FF]" },
  low: { border: "border-[#10B981]", text: "text-[#10B981]", bg: "bg-[#ECFDF5]" },
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

export function AIAnalysisDisplay({ analysis }: AIAnalysisDisplayProps) {
  const priority = PRIORITY_CONFIG[analysis.priority] || PRIORITY_CONFIG.medium;
  const confidence = Math.round(analysis.confidence_score * 100);
  const safetyRisks = (analysis.safety_risks || []).filter((r) => r !== "none");
  const safetyScore = analysis.safety_score ?? 0;

  return (
    <div className={`rounded-[6px] border bg-white overflow-hidden ${priority.border}`} style={{ borderLeftWidth: '3px' }}>
      <div className="p-4 space-y-4">
        {/* Trade + Priority + Safety badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium border ${priority.bg} ${priority.text} ${priority.border}`}>
            {analysis.priority}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
            {analysis.trade.replace("_", " ")}
          </span>
          {analysis.safety_concern && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[12px] font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
              <AlertTriangle className="h-3 w-3" /> safety hazard
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-[14px] text-[#111111] leading-relaxed">{analysis.description}</p>

        {/* Safety Risk Assessment */}
        {(safetyRisks.length > 0 || safetyScore > 0) && (
          <div className="bg-[#FAFAFA] rounded-[6px] p-3 border border-[#E5E7EB] space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#DC2626]" />
              <span className="text-[13px] font-medium text-[#111111]">Safety risk assessment</span>
            </div>

            {/* Safety Score Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${safetyScore * 10}%`,
                    backgroundColor: safetyScore >= 7 ? "#DC2626" : safetyScore >= 4 ? "#F59E0B" : "#10B981",
                  }}
                />
              </div>
              <span className="text-[12px] font-medium text-[#6B7280]">{safetyScore}/10</span>
            </div>

            {/* Risk Tags */}
            {safetyRisks.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {safetyRisks.map((risk) => (
                  <span key={risk} className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/15">
                    {RISK_LABELS[risk] || risk}
                  </span>
                ))}
              </div>
            )}

            {/* Risk Escalation */}
            {analysis.risk_escalation && (
              <div className="flex gap-2 mt-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-[#6B7280] leading-relaxed">
                  <span className="font-medium text-[#F59E0B]">If unfixed: </span>
                  {analysis.risk_escalation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Suggested Action */}
        <div>
          <p className="text-[13px] font-medium text-[#6B7280] mb-1">Recommended action</p>
          <p className="text-[14px] text-[#111111] leading-relaxed">{analysis.suggested_action}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[13px] text-[#6B7280]">Est. time</p>
            <p className="text-[14px] font-medium text-[#111111]">{analysis.estimated_time}</p>
          </div>
          <div>
            <p className="text-[13px] text-[#6B7280]">Est. cost</p>
            <p className="text-[14px] font-medium text-[#111111]">{analysis.estimated_cost}</p>
          </div>
          <div>
            <p className="text-[13px] text-[#6B7280]">Confidence</p>
            <p className="text-[14px] font-medium text-[#111111]">{confidence}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
