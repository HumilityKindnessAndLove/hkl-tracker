import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateFormSubmission } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = validateFormSubmission(body);

    const supabase = await createClient();

    // if volunteer_id is missing, attempt to attach from session
    const insertPayload = { ...parsed } as Record<string, unknown>;
    if (!insertPayload.volunteer_id) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        (insertPayload as Record<string, string>).volunteer_id =
          userData.user.id;
      }
    }

    // Set brevo_status based on whether email is provided
    // Submissions with email will be synced by the cron job
    if (parsed.email) {
      (insertPayload as Record<string, string>).brevo_status = "pending";
    } else {
      (insertPayload as Record<string, string>).brevo_status = "skipped";
    }

    const { data, error } = await supabase
      .from("form_submissions")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
