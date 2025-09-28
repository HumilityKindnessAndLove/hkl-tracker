import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch events:", error);
      return NextResponse.json(
        { error: "Failed to fetch events", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data: events,
        count: events?.length || 0,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Events API error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}
