"use client";

import { Bot, AlertTriangle, Clock, DollarSign, Gauge, Sparkles } from "lucide-react";
import type { AIAnalysis } from "@/lib/types";

interface AIAnalysisDisplayProps {
  analysis: AIAnalysis;
}

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; icon: string; glow: string }> = {
  critical: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: "🔴", glow: "shadow-red-200/50" },
  high: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", icon: "🟠", glow: "shadow-orange-200/50" },
  medium: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "🟡", glow: "shadow-amber-200/50" },
  low: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: "🟢", glow: "shadow-emerald-200/50" },
};

export function AIAnalysisDisplay({ analysis }: AIAnalysisDisplayProps) {
  const priority = PRIORITY_CONFIG[analysis.priority] || PRIORITY_CONFIG.medium;
  const confidence = Math.round(analysis.confidence_score * 100);

  return (
    <div className="rounded-2xl border border-[#00539F]/10 bg-gradient-to-br from-blue-50/30 via-white to-violet-50/20 overflow-hidden page-enter">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00539F] to-[#0066cc] px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-[#FFD200]" />
          </div>
          <span className="font-semibold text-sm text-white">AI Analysis Complete</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-blue-100">{confidence}% confident</span>
        </div>
      </div>

      <div className="p-5 space-y-4 stagger-enter">
        {/* Priority + Trade + Safety */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${priority.bg} ${priority.text} shadow-sm ${priority.glow}`}>
            {priority.icon} {analysis.priority.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            {analysis.trade.replace("_", " ").toUpperCase()}
          </span>
          {analysis.safety_concern && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/20">
              <AlertTriangle className="h-3 w-3" /> SAFETY HAZARD
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 leading-relaxed">{analysis.description}</p>

        {/* Suggested Action */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100/80">
          <p className="text-[11px] font-bold text-[#00539F] uppercase tracking-wider mb-1.5">Recommended Action</p>
          <p className="text-sm text-blue-900 leading-relaxed">{analysis.suggested_action}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: DollarSign, label: "Est. Cost", value: analysis.estimated_cost, color: "text-emerald-600", bg: "bg-emerald-50" },
            { icon: Clock, label: "Est. Time", value: analysis.estimated_time, color: "text-blue-600", bg: "bg-blue-50" },
            { icon: Gauge, label: "Confidence", value: `${confidence}%`, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <div className={`${stat.bg} w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-[10px] text-gray-400 font-medium">{stat.label}</p>
              <p className="text-xs font-bold text-gray-800 mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
