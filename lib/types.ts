export type Trade =
  | "plumbing"
  | "electrical"
  | "hvac"
  | "structural"
  | "custodial"
  | "landscaping"
  | "safety_hazard";

export type Priority = "critical" | "high" | "medium" | "low";

export type ReportStatus =
  | "submitted"
  | "analyzing"
  | "dispatched"
  | "in_progress"
  | "resolved";

export interface AIAnalysis {
  trade: Trade;
  priority: Priority;
  description: string;
  suggested_action: string;
  safety_concern: boolean;
  estimated_cost: string;
  estimated_time: string;
  confidence_score: number;
}

export interface Report {
  id: string;
  created_at: string;
  updated_at: string;

  // Location
  building: string;
  room: string;
  floor: string;
  latitude: number | null;
  longitude: number | null;

  // Issue details
  description: string;
  photo_url: string | null;
  photo_base64: string | null;

  // AI analysis
  trade: Trade;
  priority: Priority;
  ai_description: string;
  suggested_action: string;
  safety_concern: boolean;
  estimated_cost: string;
  estimated_time: string;
  confidence_score: number;

  // Status
  status: ReportStatus;
  urgency_score: number;
  upvote_count: number;
  duplicate_of: string | null;

  // Dispatch
  dispatched_to: string | null;
  dispatched_at: string | null;
  email_sent: boolean;

  // Reporter
  reporter_email: string | null;
  reporter_name: string | null;
}

export interface SubmitReportPayload {
  building: string;
  room: string;
  floor: string;
  latitude?: number;
  longitude?: number;
  description: string;
  photo_base64: string;
  reporter_email?: string;
  reporter_name?: string;
  ai_analysis: AIAnalysis;
}
