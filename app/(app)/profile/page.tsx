import { Card, Heading, Text } from "@radix-ui/themes";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <Heading size="6" className="text-center">
        Profile
      </Heading>

      <div className="grid gap-6 md:grid-cols-2">
        <Card size="3">
          <div className="space-y-4">
            <Text as="div" size="4" weight="bold">
              Profile Information
            </Text>
            <Text as="div">
              This is the Profile page where users can view their profile
              information and share a unique QR code/link.
            </Text>
            <Text as="div" color="gray">
              Profile management components and functionality will be
              implemented here.
            </Text>
          </div>
        </Card>

        <QRCodeDisplay />
      </div>
    </div>
  );
}
