import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Authentication error:", userError);
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    console.log("Looking for QR links for user ID:", user.id);

    // First, try to get any QR links for this user to debug RLS issues
    const { data: allLinks, error: allLinksError } = await supabase
      .from("qr_links")
      .select("id, active, expires_at, volunteer_id, created_at")
      .eq("volunteer_id", user.id);

    console.log("All QR links for user:", { allLinks, allLinksError });

    // If we can't access any links, it's likely an RLS issue
    if (allLinksError) {
      console.error("RLS or permission error:", allLinksError);
      return NextResponse.json(
        {
          error: "Permission denied accessing QR links",
          debug: {
            userId: user.id,
            error: allLinksError.message,
          },
        },
        { status: 403 },
      );
    }

    if (!allLinks || allLinks.length === 0) {
      return NextResponse.json(
        {
          error: "No QR links found for user",
          debug: {
            userId: user.id,
            message: "No QR links exist for this user",
          },
        },
        { status: 404 },
      );
    }

    // Filter for active links and get the most recent one
    const activeLinks = allLinks.filter((link) => link.active);

    if (activeLinks.length === 0) {
      return NextResponse.json(
        {
          error: "No active QR links found for user",
          debug: {
            userId: user.id,
            totalLinks: allLinks.length,
            activeLinks: 0,
          },
        },
        { status: 404 },
      );
    }

    // Get the most recent active link
    const qrLink = activeLinks.sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime(),
    )[0];

    // Check if the QR link has expired
    if (qrLink.expires_at && new Date() > new Date(qrLink.expires_at)) {
      return NextResponse.json(
        { error: "QR link has expired" },
        { status: 403 },
      );
    }

    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;
    const qrUrl = `${baseUrl}/v/${qrLink.id}`;

    return NextResponse.json({
      url: qrUrl,
      qr_link_id: qrLink.id,
    });
  } catch (error) {
    console.error("Error fetching QR URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
