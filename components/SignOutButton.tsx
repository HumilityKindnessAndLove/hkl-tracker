"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // reload the page so the server can read the cleared cookies
    window.location.reload();
  };

  return (
    <Button
      onClick={handleSignOut}
      size="lg"
      variant="ghost"
      className="cursor-pointer"
    >
      Sign out
    </Button>
  );
}
