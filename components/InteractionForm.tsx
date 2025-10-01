"use client";

import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  RadioGroup,
  Select,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import Form from "next/form";
import React from "react";

export default function InteractionForm() {
  const [selectedType, setSelectedType] = React.useState("signup");
  const [selectedEvent, setSelectedEvent] = React.useState("none");
  const [selectedFriendliness, setSelectedFriendliness] =
    React.useState("friendly");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      const payload = {
        contact_name: formData.get("name"),
        outcome: selectedType,
        friendly: selectedFriendliness === "friendly",
        notes: formData.get("notes") || null,
        // TODO: event_id: selectedEvent === "none" ? null : selectedEvent,
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      };

      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit interaction");
      }

      const result = await response.json();
      console.log("Interaction submitted successfully:", result);

      // Reset form on success
      setSelectedType("signup");
      setSelectedEvent("none");
      setSelectedFriendliness("friendly");

      // Reset form fields
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) form.reset();

      alert("Interaction submitted successfully!");
    } catch (error) {
      console.error("Error submitting interaction:", error);
      alert(
        error instanceof Error ? error.message : "Failed to submit interaction",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxWidth="400px" mx="auto" my="6">
      <Card size="3" variant="surface">
        <Heading as="h2" size="5" mb="4" align="center">
          Add Interaction
        </Heading>

        <Form action={handleSubmit}>
          <Flex direction="column" gap="4">
            {/* Name */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Pledge Name <span style={{ color: "red" }}>*</span>
              </Text>
              <TextField.Root
                name="name"
                placeholder="Enter Pledge Name"
                required
              />
            </Flex>

            {/* Type of Interaction */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Type of Interaction
              </Text>
              <input type="hidden" name="outcome" value={selectedType} />
              <Flex gap="2" justify="center" wrap="wrap">
                {["conversation", "signup", "rejection"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={selectedType === type ? "solid" : "outline"}
                    {...(selectedType !== type
                      ? { color: "gray" as const }
                      : {})}
                    onClick={() => setSelectedType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </Flex>
            </Flex>

            {/* Friendly or Unfriendly */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                How was the interaction? (Button)
              </Text>
              <input
                type="hidden"
                name="friendly"
                value={selectedFriendliness}
              />
              <Flex gap="2" justify="center" wrap="wrap">
                {["friendly", "unfriendly"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={
                      selectedFriendliness === type ? "solid" : "outline"
                    }
                    {...(selectedFriendliness !== type
                      ? { color: "gray" as const }
                      : {})}
                    onClick={() => setSelectedFriendliness(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </Flex>
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                How was the interaction? (Radio)
              </Text>
              <RadioGroup.Root
                name="friendliness"
                value={selectedFriendliness}
                onValueChange={setSelectedFriendliness}
                required
              >
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="friendly" /> Friendly
                  </Flex>
                </Text>
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="unfriendly" />
                    Unfriendly
                  </Flex>
                </Text>
              </RadioGroup.Root>
            </Flex>

            {/* Notes */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Additional Notes
              </Text>
              <TextArea
                name="notes"
                placeholder="Additional notes (optional)"
              />
            </Flex>

            {/* Event */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Event
              </Text>
              <Select.Root
                value={selectedEvent}
                onValueChange={setSelectedEvent}
              >
                <Select.Trigger placeholder="Attach event" />
                <Select.Content>
                  <Select.Item value="none">None</Select.Item>
                  <Select.Item value="Darbar Sahib">Darbar Sahib</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Submit */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Flex>
        </Form>
      </Card>
    </Box>
  );
}
