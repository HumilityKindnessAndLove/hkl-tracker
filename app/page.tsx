import { Avatar, Box, Card, Flex, Text } from "@radix-ui/themes";
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
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="font-bold text-center text-6xl">Hello World</h1>

      <div className="text-center mt-4">
        {user ? (
          <div className="flex flex-col items-center">
            <Card>
              <Flex gap="3" align="center">
                <Avatar
                  src={
                    user.user_metadata?.avatar_url ||
                    user.user_metadata?.picture
                  }
                  alt={displayName}
                  className="w-20 h-20 rounded-full"
                  fallback={initials}
                />
                <Box>
                  <Text as="div" size="2" weight="bold">
                    {displayName}
                  </Text>
                  <Text as="div" size="2" color="gray">
                    {user.email}
                  </Text>
                </Box>
              </Flex>
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
