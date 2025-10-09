"use client";

import { Box, Card, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export default function ProfilePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#ebddd7] via-[#eee7b7] to-[#ed868b]">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#EBAD1F] rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#ffdf5a] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#d2285e] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      {/* Profile Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-sm">
          <Flex direction="column" gap="3" align="center" className="p-8">
            {/* Header with Logo and Avatar */}
            <Flex
              align="start"
              justify="center"
              gap="6"
              className="w-full mt-8"
            >
              {/* Logo Placeholder */}
              <Flex
                direction="column"
                align="center"
                gap="2"
                className="flex-1 max-w-[120px]"
              >
                <Box className="w-20 h-20 bg-gradient-to-br from-[#5c8279] to-[#174548] rounded-full flex items-center justify-center shadow-lg">
                  <Text size="5" weight="bold" className="text-white">
                    HKL LOGO
                  </Text>
                </Box>
              </Flex>

              {/* Separator */}
              <Separator
                orientation="vertical"
                size="3"
                className="h-24"
                style={{ background: "#5c8279" }}
              />

              {/* User Avatar and Name */}
              <Flex
                direction="column"
                align="center"
                gap="2"
                className="flex-1 max-w-[120px]"
              >
                <Box
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "#d2285e" }}
                >
                  <Text size="5" weight="bold" className="text-white">
                    AVATAR FOR USER
                  </Text>
                </Box>
                <Heading size="3" className="text-[#174548] text-center">
                  John Doe
                </Heading>
              </Flex>
            </Flex>

            {/* QR Code */}
            <Box className="my-4">
              <QRCodeDisplay size={200} />
            </Box>

            {/* Message */}
            <Box className="text-center max-w-sm">
              <Text
                size="3"
                className="text-[#5c8279] leading-relaxed font-medium"
              >
                Join the wave of humility, kindness and love
              </Text>
            </Box>

            {/* Decorative Element */}
            <Box className="w-16 h-1 bg-gradient-to-r from-[#EBAD1F] via-[#d2285e] to-[#5c8279] rounded-full" />
          </Flex>
        </Card>
      </div>

      {/* CSS Animation Styles */}
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
