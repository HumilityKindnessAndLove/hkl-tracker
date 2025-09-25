import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // In development, create a profile for the signed-in user if one doesn't exist.
      if (process.env.NODE_ENV === "development") {
        try {
          const { data: userData } = await supabase.auth.getUser();
          const user = userData?.user;
          if (user?.id) {
            // check if profile exists
            const { data: existing } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", user.id)
              .limit(1)
              .maybeSingle();

            if (!existing) {
              await supabase.from("profiles").insert({
                id: user.id,
                full_name: user.user_metadata?.name ?? null,
              });
              // try to link the user to the Calgary location by default
              try {
                const { data: calgary } = await supabase
                  .from("locations")
                  .select("id")
                  .eq("name", "Calgary")
                  .limit(1)
                  .maybeSingle();

                if (calgary?.id) {
                  // check if link already exists
                  const { data: link } = await supabase
                    .from("user_locations")
                    .select("user_id")
                    .eq("user_id", user.id)
                    .eq("location_id", calgary.id)
                    .limit(1)
                    .maybeSingle();

                  if (!link) {
                    await supabase.from("user_locations").insert({
                      user_id: user.id,
                      location_id: calgary.id,
                    });
                  }
                }
              } catch (err) {
                console.warn("dev user_locations link failed", err);
              }
            }
          }
        } catch (e) {
          console.warn("dev profile creation failed", e);
        }
      }
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`);
}
