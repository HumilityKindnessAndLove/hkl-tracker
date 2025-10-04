"use client";

import { Button } from "@radix-ui/themes";
import { createClient } from "@/lib/supabase/client";

export default function SignInButton() {
  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Button
      onClick={handleSignIn}
      size="4"
      style={{ cursor: "pointer", minHeight: "48px", minWidth: "200px" }}
    >
      Sign in with Google
    </Button>
  );
}
