import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const available = searchParams.get("available");
    const trade = searchParams.get("trade");

    let query = supabaseAdmin.from("technicians").select("*");

    if (available === "true") query = query.eq("is_available", true);
    if (trade) query = query.eq("trade", trade);

    const { data, error } = await query.order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ technicians: data });
  } catch (error) {
    console.error("Fetch technicians error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
