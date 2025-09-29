import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
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

    // Check if the QR link is active
    if (!qrLink.active) {
      return new Response("QR link is inactive", { status: 403 });
    }

    // Check if the QR link has expired
    if (qrLink.expires_at && new Date() > new Date(qrLink.expires_at)) {
      return new Response("QR link has expired", { status: 403 });
    }

    // Redirect to hkl.org with volunteer_id as parameter
    // TODO - ENV VAR
    const redirectUrl = `https://www.hkl.org/i-commit-test-only?volunteer_id=${qrLink.volunteer_id}`;

    return Response.redirect(redirectUrl, 302);
  } catch (error) {
    console.error("Error processing QR link:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
