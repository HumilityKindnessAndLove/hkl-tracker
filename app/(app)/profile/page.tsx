import { Heading } from "@radix-ui/themes";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <Heading size="6" className="text-center">
        Profile
      </Heading>

      <QRCodeDisplay />
    </div>
  );
}
