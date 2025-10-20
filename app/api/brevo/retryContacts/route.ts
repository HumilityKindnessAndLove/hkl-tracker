import { NextResponse } from "next/server";
import { BREVO_LANGUAGE_MAP, createBrevoContact } from "@/lib/brevo";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("form_submissions")
      .select()
      .eq("brevo_status", "pending")
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { message: "No pending submissions found" },
        { status: 404 },
      );
    }

    if (!data.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
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
      console.error("Failed to update form submission:", updateError);
      return NextResponse.json(
        { error: "Failed to update submission", details: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: brevoResult.success,
        data,
        brevoResult,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
