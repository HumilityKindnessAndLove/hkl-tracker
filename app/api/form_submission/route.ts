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

    // Attempt to create contact in Brevo asynchronously (don't await)
    if (parsed.email && data?.id) {
      // Map enum to numeric string for Brevo (legacy format)
      const languageMap: Record<string, string> = {
        english: "1",
        bulgarian: "2",
        french: "3",
        german: "4",
        italian: "5",
        lithuanian: "6",
        punjabi: "7",
        polish: "8",
        malay: "9",
        russian: "10",
        spanish: "11",
      };

      // Async function to handle Brevo contact creation and DB update
      // TODO: should we await this and return Brevo status to user? (in case of error)
      (async () => {
        try {
          if (!parsed.email) return;

          const brevoResult = await createBrevoContact(parsed.email, {
            FIRSTNAME: parsed.name,
            CITY: parsed.city,
            COUNTRY: parsed.country,
            YOUR_PREFERRED_LANGUAGE: parsed.language
              ? (languageMap[parsed.language] ?? null)
              : null,
            SMS: parsed.sms,
            VOLUNTEER_ID: insertPayload.volunteer_id as string | null,
            REFERRAL_CODE: parsed.referral_code,
          });

          // Update the form submission with Brevo result
          const supabaseClient = await createClient();
          const { error: updateError } = await supabaseClient
            .from("form_submissions")
            .update({
              brevo_status: brevoResult.brevo_status,
              brevo_sent_at: brevoResult.brevo_sent_at,
              brevo_error: brevoResult.brevo_error,
              brevo_id: brevoResult.brevo_id,
            })
            .eq("id", data.id);

          if (updateError) {
            console.error(
              "Failed to update form submission with Brevo data:",
              updateError,
            );
          }
        } catch (error) {
          console.error("Brevo integration failed:", error);
          // Update with error status
          try {
            const supabaseClient = await createClient();
            await supabaseClient
              .from("form_submissions")
              .update({
                brevo_status: "error",
                brevo_error:
                  error instanceof Error ? error.message : String(error),
                brevo_sent_at: new Date().toISOString(),
              })
              .eq("id", data.id);
          } catch (dbError) {
            console.error(
              "Failed to update error status in database:",
              dbError,
            );
          }
        }
      })();
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
