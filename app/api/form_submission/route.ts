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
    // if (parsed.email && data?.id) {
    //   try {
    //     const brevoResult = await createBrevoContact(parsed.email, {
    //       FIRSTNAME: parsed.f_name,
    //       CITY: parsed.city,
    //       COUNTRY: parsed.country,
    //       YOUR_PREFERRED_LANGUAGE: parsed.your_preferred_language,
    //       SMS__COUNTRY_CODE: parsed.sms_country_code,
    //       SMS: parsed.sms,
    //       VOLUNTEER_ID: insertPayload.volunteer_id,
    //     });

    //     // Update the form submission with Brevo result
    //     const { error: updateError } = await supabase
    //       .from("form_submissions")
    //       .update({
    //         brevo_status: brevoResult.brevo_status,
    //         brevo_sent_at: brevoResult.brevo_sent_at,
    //         brevo_error: brevoResult.brevo_error,
    //         brevo_id: brevoResult.brevo_id,
    //       })
    //       .eq("id", data.id);

    //     if (updateError) {
    //       console.error(
    //         "Failed to update form submission with Brevo data:",
    //         updateError,
    //       );
    //     }
    //   } catch (error) {
    //     console.error("Brevo integration failed:", error);
    //     // Update with error status
    //     await supabase
    //       .from("form_submissions")
    //       .update({
    //         brevo_status: "error",
    //         brevo_error: error instanceof Error ? error.message : String(error),
    //         brevo_sent_at: new Date().toISOString(),
    //       })
    //       .eq("id", data.id);
    //   }
    // }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
