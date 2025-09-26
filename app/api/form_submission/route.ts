import { NextResponse } from "next/server";
import { createBrevoContact } from "@/lib/brevo";
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

    const { data, error } = await supabase
      .from("form_submissions")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Attempt to create contact in Brevo if email is provided
    if (parsed.email) {
      // Run Brevo contact creation in background (we're not awaiting response)
      createBrevoContact(parsed.email, parsed.f_name, parsed.l_name, {
        STATE: parsed.region,
        COUNTRY: parsed.country,
        SMS: parsed.phone,
        SOURCE: parsed.source,
      }).catch((error) => {
        console.error("Background Brevo contact creation failed:", error);
      });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
