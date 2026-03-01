import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, completion_notes, completion_photo_base64 } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (completion_notes) updateData.completion_notes = completion_notes;
    if (completion_photo_base64) updateData.completion_photo_base64 = completion_photo_base64;

    if (status === "accepted") {
      updateData.started_at = new Date().toISOString();
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: assignment, error } = await supabaseAdmin
      .from("assignments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If completed, update the report status
    if (status === "completed" && assignment) {
      await supabaseAdmin
        .from("reports")
        .update({ status: "resolved" })
        .eq("id", assignment.report_id);
    }

    // If accepted, update report status to in_progress
    if (status === "accepted" && assignment) {
      await supabaseAdmin
        .from("reports")
        .update({ status: "in_progress" })
        .eq("id", assignment.report_id);
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("Update assignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
