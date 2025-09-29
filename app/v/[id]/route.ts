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

async function trackQRVisit(qrLinkId: string, request: Request) {
  try {
    const supabase = await createClient();

    const visitData = {
      qr_link_id: parseInt(qrLinkId, 10),
      visited_at: new Date().toISOString(),
      ip: getClientIP(request),
      user_agent: request.headers.get("user-agent") || null,
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
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();

    // Fetch the QR link record by id
    const { data: qrLink, error } = await supabase
      .from("qr_links")
      .select("volunteer_id, active, expires_at")
      .eq("id", params.id)
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

    // TODO - ENV VAR
    const redirectUrl = `https://www.hkl.org/i-commit-test-only?volunteer_id=${qrLink.volunteer_id}`;

    const redirectResponse = Response.redirect(redirectUrl, 302);

    // Track the visit asynchronously
    trackQRVisit(params.id, request).catch((error) => {
      console.error("Background QR visit tracking failed:", error);
    });

    return redirectResponse;
  } catch (error) {
    console.error("Error processing QR link:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
