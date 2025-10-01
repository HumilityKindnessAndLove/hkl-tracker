import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // TODO: expires_at to be implemented
    const { data: existingLink } = await supabase
      .from("qr_links")
      .select("id")
      .eq("volunteer_id", user.id)
      .eq("active", true)
      .limit(1)
      .single();

    let qrLinkId: number;

    if (existingLink) {
      qrLinkId = existingLink.id;
    } else {
      const { data: newLink, error: createError } = await supabase
        .from("qr_links")
        .insert({
          volunteer_id: user.id,
          active: true,
        })
        .select("id")
        .single();

      if (createError || !newLink) {
        console.error("Failed to create QR link:", createError);
        return NextResponse.json(
          { error: "Failed to create QR link" },
          { status: 500 },
        );
      }

      qrLinkId = newLink.id;
    }

    const baseUrl = new URL(request.url).origin;
    const qrUrl = `${baseUrl}/v/${qrLinkId}`;

    return NextResponse.json({
      url: qrUrl,
      qr_link_id: qrLinkId,
    });
  } catch (error) {
    console.error("Error fetching QR URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
