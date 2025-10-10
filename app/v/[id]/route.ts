import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Helper function to extract IP address from request
function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }

  return null;
}

async function trackQRVisit(
  qrLinkId: string,
  ip: string | null,
  userAgent: string | null,
  supabase: SupabaseClient,
) {
  try {
    const visitData = {
      qr_link_id: parseInt(qrLinkId, 10),
      visited_at: new Date().toISOString(),
      ip,
      user_agent: userAgent,
    };

    const { error } = await supabase.from("qr_visits").insert(visitData);

    if (error) {
      console.error("Failed to track QR visit:", error);
    } else {
      console.log("QR visit tracked successfully:", visitData);
    }
  } catch (error) {
    console.error("Error tracking QR visit:", error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch the QR link record by id
    const { data: qrLink, error } = await supabase
      .from("qr_links")
      .select("volunteer_id, active, expires_at")
      .eq("id", id)
      .single();

    if (error || !qrLink) {
      console.error("QR link not found:", error);
      return new Response("QR link not found", { status: 404 });
    }

    if (!qrLink.active) {
      return new Response("QR link is inactive", { status: 403 });
    }

    // TODO: Expiration check
    // if (qrLink.expires_at && new Date() > new Date(qrLink.expires_at)) {
    //   return new Response("QR link has expired", { status: 403 });
    // }

    const redirectUrl = `${process.env.QR_REDIRECT_BASE_URL}?volunteer_id=${qrLink.volunteer_id}`;

    // Track the visit asynchronously (extract data before response)
    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || null;

    trackQRVisit(id, ip, userAgent, supabase).catch((error) => {
      console.error("Background QR visit tracking failed:", error);
    });

    const redirectResponse = Response.redirect(redirectUrl, 302);
    return redirectResponse;
  } catch (error) {
    console.error("Error processing QR link:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
