"use client";

import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
  }, []);

  const displayName = user?.user_metadata?.name ?? user?.email ?? "Volunteer";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#ebddd7] via-[#eee7b7] to-[#ed868b]">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#EBAD1F] rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#ffdf5a] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#d2285e] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 gap-8">
        {/* TODO: HKL Logo goes here */}

        <div className="w-full max-w-md shadow-2xl rounded-[3rem] bg-white/30 backdrop-blur-3xl backdrop-saturate-150 overflow-hidden ring-1 ring-white/40">
          <Flex direction="column" gap="4" align="center" className="p-8">
            <Flex direction="column" align="center" gap="1" className="mt-4">
              <Heading size="6" className="text-[#174548] text-center">
                {displayName}
              </Heading>
              <Text size="2" className="text-[#5c8279] font-medium">
                HKL Volunteer
              </Text>
            </Flex>

            <Box className="my-4">
              <QRCodeDisplay size={200} />
            </Box>

            <Box className="text-center max-w-sm">
              <Text
                size="3"
                className="text-[#5c8279] leading-relaxed font-medium"
              >
                Join the wave of humility, kindness and love
              </Text>
            </Box>

            <Box className="w-16 h-1 bg-gradient-to-r from-[#EBAD1F] via-[#d2285e] to-[#5c8279] rounded-full mb-2" />
          </Flex>
        </div>
      </div>
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
