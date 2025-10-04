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
    <div className="flex flex-col items-center justify-center px-4">
      <h1 className="font-bold text-center text-4xl md:text-6xl mb-4">
        HKL Tracking App
      </h1>

      <div className="text-center mt-4 w-full max-w-md">
        {user ? (
          <div className="flex flex-col items-center">
            <Card size={{ initial: "3", sm: "4" }}>
              <Flex gap="4" align="center">
                <Avatar
                  src={
                    user.user_metadata?.avatar_url ||
                    user.user_metadata?.picture
                  }
                  alt={displayName}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full"
                  fallback={initials}
                  size={{ initial: "6", sm: "7" }}
                />
                <Box>
                  <Text as="div" size={{ initial: "3", sm: "4" }} weight="bold">
                    {displayName}
                  </Text>
                  <Text as="div" size={{ initial: "2", sm: "3" }} color="gray">
                    {user.email}
                  </Text>
                </Box>
              </Flex>
            </Card>

            <div className="mt-6">
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
