import { NextResponse } from "next/server";
import { BREVO_LANGUAGE_MAP, createBrevoContact } from "@/lib/brevo";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

const BATCH_SIZE = 100;
const COOLDOWN_MS = 300;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: submissions, error } = await supabase
      .from("form_submissions")
      .select()
      .eq("brevo_status", "pending")
      .limit(BATCH_SIZE);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json(
        { message: "No pending submissions found" },
        { status: 404 },
      );
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const data of submissions) {
      if (!data.email) {
        console.warn(`Skipping submission ${data.id}: no email`);
        results.push({
          id: data.id,
          success: false,
          error: "Email is required",
        });
        errorCount++;
        continue;
      }

      const attributes: {
        FIRSTNAME?: string | null;
        CITY?: string | null;
        STATE?: string | null;
        COUNTRY?: string | null;
        SMS?: string | null;
        YOUR_PREFERRED_LANGUAGE?: string | null;
        VOLUNTEER_ID?: string | null;
      } = {};

      if (data.name) attributes.FIRSTNAME = data.name;
      if (data.city) attributes.CITY = data.city;
      if (data.country) attributes.COUNTRY = data.country;
      if (data.sms) attributes.SMS = data.sms;
      if (data.volunteer_id) attributes.VOLUNTEER_ID = data.volunteer_id;
      if (data.language && BREVO_LANGUAGE_MAP[data.language]) {
        attributes.YOUR_PREFERRED_LANGUAGE = BREVO_LANGUAGE_MAP[data.language];
      }

      const brevoResult = await createBrevoContact(data.email, attributes);

      const { error: updateError } = await supabase
        .from("form_submissions")
        .update({
          brevo_status: brevoResult.brevo_status,
          brevo_id: brevoResult.brevo_id || null,
          brevo_error: brevoResult.brevo_error || null,
          brevo_sent_at: brevoResult.brevo_sent_at,
        })
        .eq("id", data.id);

      if (updateError) {
        console.error(
          `Failed to update form submission ${data.id}:`,
          updateError,
        );
        results.push({
          id: data.id,
          email: data.email,
          success: false,
          error: `Failed to update submission: ${updateError.message}`,
        });
        errorCount++;
      } else {
        results.push({
          id: data.id,
          email: data.email,
          success: brevoResult.success,
          brevoResult,
        });
        if (brevoResult.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      // Cooldown between requests (except after the last one)
      if (submissions.indexOf(data) < submissions.length - 1) {
        await sleep(COOLDOWN_MS);
      }
    }

    return NextResponse.json(
      {
        processed: submissions.length,
        successCount,
        errorCount,
        results,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
