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

    // Filter events that are currently ongoing or have no specified start/end date
    const now = new Date().toISOString();
    const filteredEvents =
      events?.filter((event) => {
        // Include if no dates specified
        if (!event.starts_at && !event.ends_at) {
          return true;
        }
        // Include if currently ongoing
        const isAfterStart = !event.starts_at || event.starts_at <= now;
        const isBeforeEnd = !event.ends_at || event.ends_at >= now;
        return isAfterStart && isBeforeEnd;
      }) || [];

    return NextResponse.json(
      {
        data: filteredEvents,
        count: filteredEvents.length,
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
