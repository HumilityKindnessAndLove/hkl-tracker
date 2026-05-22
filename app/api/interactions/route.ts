import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateInteraction } from "@/lib/validators";

export async function POST(request: Request) {
  // biome-ignore lint/correctness/noConstantCondition: interaction form disabled
  if (true) {
    return NextResponse.json(
      { error: "Interaction form is disabled" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();

    const supabase = await createClient();

    const insertPayload = { ...body } as Record<string, unknown>;

    // if volunteer_id is missing, attempt to attach from session
    if (!insertPayload.volunteer_id) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        (insertPayload as Record<string, string>).volunteer_id =
          userData.user.id;
      }
    }

    // if location_id is missing, attempt to attach from user's linked location
    if (!insertPayload.location_id) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        const { data, error } = await supabase
          .from("user_locations")
          .select("location_id")
          .eq("user_id", userData.user.id)
          .limit(1)
          .maybeSingle();
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        if (data?.location_id) {
          (insertPayload as Record<string, string>).location_id =
            data.location_id;
        } else {
          return NextResponse.json(
            { error: "Location ID is required" },
            { status: 400 },
          );
        }
      }
    }
    const parsed = validateInteraction(insertPayload);

    const { data, error } = await supabase
      .from("interactions")
      .insert([parsed])
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
