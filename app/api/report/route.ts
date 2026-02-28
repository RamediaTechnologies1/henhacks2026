import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendDispatchEmail } from "@/lib/email";
import { PRIORITY_BASE_SCORE, DEDUP_WINDOW_DAYS } from "@/lib/constants";
import type { Report, SubmitReportPayload } from "@/lib/types";

function calcUrgencyScore(report: {
  priority: string;
  upvote_count: number;
  safety_concern: boolean;
}): number {
  const base = PRIORITY_BASE_SCORE[report.priority] ?? 1;
  return base + report.upvote_count * 1.5 + (report.safety_concern ? 3 : 0);
}

export async function POST(req: NextRequest) {
  try {
    const payload: SubmitReportPayload = await req.json();

    const {
      building,
      room,
      floor,
      latitude,
      longitude,
      description,
      photo_base64,
      reporter_email,
      reporter_name,
      ai_analysis,
    } = payload;

    if (!building || !ai_analysis) {
      return NextResponse.json(
        { error: "building and ai_analysis are required" },
        { status: 400 }
      );
    }

    // --- Deduplication check ---
    const dedupCutoff = new Date();
    dedupCutoff.setDate(dedupCutoff.getDate() - DEDUP_WINDOW_DAYS);

    const { data: existing } = await supabaseAdmin
      .from("reports")
      .select("id, upvote_count")
      .eq("building", building)
      .eq("trade", ai_analysis.trade)
      .neq("status", "resolved")
      .gte("created_at", dedupCutoff.toISOString())
      .is("duplicate_of", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      // Increment upvote on the original
      const newUpvotes = (existing.upvote_count ?? 0) + 1;
      await supabaseAdmin
        .from("reports")
        .update({
          upvote_count: newUpvotes,
          urgency_score: calcUrgencyScore({
            priority: ai_analysis.priority,
            upvote_count: newUpvotes,
            safety_concern: ai_analysis.safety_concern,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      // Save as duplicate
      const { data: dupReport, error: dupError } = await supabaseAdmin
        .from("reports")
        .insert({
          building,
          room: room ?? "",
          floor: floor ?? "",
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          description,
          photo_base64,
          trade: ai_analysis.trade,
          priority: ai_analysis.priority,
          ai_description: ai_analysis.description,
          suggested_action: ai_analysis.suggested_action,
          safety_concern: ai_analysis.safety_concern,
          estimated_cost: ai_analysis.estimated_cost,
          estimated_time: ai_analysis.estimated_time,
          confidence_score: ai_analysis.confidence_score,
          status: "submitted",
          upvote_count: 0,
          urgency_score: 0,
          duplicate_of: existing.id,
          email_sent: false,
          reporter_email: reporter_email ?? null,
          reporter_name: reporter_name ?? null,
        })
        .select()
        .single();

      if (dupError) throw dupError;

      return NextResponse.json({
        report: dupReport,
        deduplicated: true,
        original_id: existing.id,
      });
    }

    // --- New unique report ---
    const urgency_score = calcUrgencyScore({
      priority: ai_analysis.priority,
      upvote_count: 0,
      safety_concern: ai_analysis.safety_concern,
    });

    const { data: report, error } = await supabaseAdmin
      .from("reports")
      .insert({
        building,
        room: room ?? "",
        floor: floor ?? "",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        description,
        photo_base64,
        trade: ai_analysis.trade,
        priority: ai_analysis.priority,
        ai_description: ai_analysis.description,
        suggested_action: ai_analysis.suggested_action,
        safety_concern: ai_analysis.safety_concern,
        estimated_cost: ai_analysis.estimated_cost,
        estimated_time: ai_analysis.estimated_time,
        confidence_score: ai_analysis.confidence_score,
        status: "dispatched",
        upvote_count: 0,
        urgency_score,
        duplicate_of: null,
        email_sent: false,
        reporter_email: reporter_email ?? null,
        reporter_name: reporter_name ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // --- Send dispatch email ---
    let emailSent = false;
    try {
      await sendDispatchEmail(report as Report);
      emailSent = true;
      await supabaseAdmin
        .from("reports")
        .update({ email_sent: true, dispatched_at: new Date().toISOString() })
        .eq("id", report.id);
    } catch (emailError) {
      console.error("[/api/report] Email failed:", emailError);
    }

    return NextResponse.json({ report, deduplicated: false, email_sent: emailSent });
  } catch (error) {
    console.error("[/api/report]", error);
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 }
    );
  }
}
