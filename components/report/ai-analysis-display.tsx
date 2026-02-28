"use client";

import { Bot, AlertTriangle, Clock, DollarSign, Shield, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AIAnalysis } from "@/lib/types";

interface AIAnalysisDisplayProps {
  analysis: AIAnalysis;
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
};

const PRIORITY_ICONS: Record<string, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

export function AIAnalysisDisplay({ analysis }: AIAnalysisDisplayProps) {
  return (
    <Card className="border-2 border-[#00539F]/20 bg-gradient-to-br from-blue-50/50 to-white">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="bg-[#00539F] p-1.5 rounded-lg">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-[#00539F]">AI Analysis</span>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {Math.round(analysis.confidence_score * 100)}% confidence
          </Badge>
        </div>

        {/* Priority + Trade */}
        <div className="flex gap-2">
          <Badge className={`${PRIORITY_STYLES[analysis.priority]} text-xs`}>
            {PRIORITY_ICONS[analysis.priority]} {analysis.priority.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {analysis.trade.replace("_", " ").toUpperCase()}
          </Badge>
          {analysis.safety_concern && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Safety
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700">{analysis.description}</p>

        {/* Suggested Action */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-xs font-medium text-blue-600 mb-1">Suggested Action</p>
          <p className="text-sm text-blue-800">{analysis.suggested_action}</p>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <DollarSign className="h-3.5 w-3.5 mx-auto text-gray-400 mb-1" />
            <p className="text-[10px] text-gray-500">Est. Cost</p>
            <p className="text-xs font-medium">{analysis.estimated_cost}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <Clock className="h-3.5 w-3.5 mx-auto text-gray-400 mb-1" />
            <p className="text-[10px] text-gray-500">Est. Time</p>
            <p className="text-xs font-medium">{analysis.estimated_time}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <Gauge className="h-3.5 w-3.5 mx-auto text-gray-400 mb-1" />
            <p className="text-[10px] text-gray-500">Confidence</p>
            <p className="text-xs font-medium">{Math.round(analysis.confidence_score * 100)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
