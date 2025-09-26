import { Card, Heading, Text } from "@radix-ui/themes";

export default function FormPage() {
  return (
    <div className="space-y-6">
      <Heading size="6" className="text-center">
        HKL Form
      </Heading>

      <Card size="3">
        <div className="space-y-4">
          <Text as="div">
            This is the HKL Form page where users/volunteers can fill out forms
            directly.
          </Text>
          <Text as="div" color="gray">
            Form components and functionality will be implemented here.
          </Text>
        </div>
      </Card>
    </div>
  );
}
