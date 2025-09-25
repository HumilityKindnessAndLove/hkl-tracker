"use client";

import { Button } from "@radix-ui/themes";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // reload the page so the server can read the cleared cookies
    window.location.reload();
  };

  return (
    <Button onClick={handleSignOut} size="3" variant="ghost">
      Sign out
    </Button>
  );
}
