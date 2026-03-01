"use client";

import { Bot, AlertTriangle, Clock, DollarSign, Gauge, Sparkles } from "lucide-react";
import type { AIAnalysis } from "@/lib/types";

interface AIAnalysisDisplayProps {
  analysis: AIAnalysis;
}

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; icon: string; glow: string }> = {
  critical: { bg: "bg-[#c44536]/15 border-[#c44536]/30", text: "text-[#e85a4a]", icon: "!!", glow: "shadow-[#c44536]/20" },
  high: { bg: "bg-[#b87333]/15 border-[#b87333]/30", text: "text-[#d89343]", icon: "!", glow: "shadow-[#b87333]/20" },
  medium: { bg: "bg-[#c8a55c]/15 border-[#c8a55c]/30", text: "text-[#c8a55c]", icon: "~", glow: "shadow-[#c8a55c]/20" },
  low: { bg: "bg-[#6b7c5e]/15 border-[#6b7c5e]/30", text: "text-[#8b9c7e]", icon: "-", glow: "shadow-[#6b7c5e]/20" },
};

export function AIAnalysisDisplay({ analysis }: AIAnalysisDisplayProps) {
  const priority = PRIORITY_CONFIG[analysis.priority] || PRIORITY_CONFIG.medium;
  const confidence = Math.round(analysis.confidence_score * 100);

  return (
    <div className="rounded-2xl border border-[#3d3124] bg-[#1a1410] overflow-hidden page-enter">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#c8a55c] to-[#9a7d3f] px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#0d0a07]/20 p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-[#0d0a07]" />
          </div>
          <span className="font-semibold text-sm text-[#0d0a07]">AI Analysis Complete</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0d0a07]/15 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6b7c5e] animate-pulse" />
          <span className="text-[11px] font-medium text-[#0d0a07]/80">{confidence}% confident</span>
        </div>
      </div>

      <div className="p-5 space-y-4 stagger-enter">
        {/* Priority + Trade + Safety */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${priority.bg} ${priority.text} shadow-sm ${priority.glow}`}>
            {priority.icon} {analysis.priority.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#2d2418] text-[#e8d5a3] border border-[#3d3124]">
            {analysis.trade.replace("_", " ").toUpperCase()}
          </span>
          {analysis.safety_concern && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#c44536] text-[#f4e4c1] shadow-lg shadow-[#c44536]/20">
              <AlertTriangle className="h-3 w-3" /> SAFETY HAZARD
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-[#e8d5a3] leading-relaxed">{analysis.description}</p>

        {/* Suggested Action */}
        <div className="bg-[#c8a55c]/10 rounded-xl p-4 border border-[#c8a55c]/20">
          <p className="text-[11px] font-bold text-[#c8a55c] uppercase tracking-wider mb-1.5">Recommended Action</p>
          <p className="text-sm text-[#e8d5a3] leading-relaxed">{analysis.suggested_action}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: DollarSign, label: "Est. Cost", value: analysis.estimated_cost, color: "text-[#6b7c5e]", bg: "bg-[#6b7c5e]/15" },
            { icon: Clock, label: "Est. Time", value: analysis.estimated_time, color: "text-[#4a6fa5]", bg: "bg-[#4a6fa5]/15" },
            { icon: Gauge, label: "Confidence", value: `${confidence}%`, color: "text-[#c8a55c]", bg: "bg-[#c8a55c]/15" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#231c14] rounded-xl p-3 border border-[#3d3124] text-center">
              <div className={`${stat.bg} w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-[10px] text-[#6b5e4f] font-medium">{stat.label}</p>
              <p className="text-xs font-bold text-[#f4e4c1] mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
