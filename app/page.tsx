import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "../components/SignOutButton";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  const displayName = user?.user_metadata?.name ?? user?.email ?? "";

  const initials = displayName
    .split(" ")
    .map((s: string) => s?.[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="font-bold text-center text-6xl">HKL Tracking App</h1>

      <div className="text-center mt-4">
        {user ? (
          <div className="flex flex-col items-center">
            <Card>
              <div className="flex gap-3 items-center p-6">
                <Avatar
                  src={
                    user.user_metadata?.avatar_url ||
                    user.user_metadata?.picture
                  }
                  alt={displayName}
                  className="w-20 h-20"
                  fallback={initials}
                />
                <div>
                  <div className="text-sm font-bold">{displayName}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-4">
              <SignOutButton />
            </div>
          </div>
        ) : (
          <GoogleSignInButton />
        )}
      </div>
    </div>
  );
}
