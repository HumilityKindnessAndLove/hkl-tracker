"use client";

import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Select,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import Form from "next/form";
import React from "react";
import Image from "next/image";


type Event = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
};

export default function InteractionForm() {
  const [selectedType, setSelectedType] = React.useState("signup");
  const [selectedEvent, setSelectedEvent] = React.useState("none");
  const [selectedFriendliness, setSelectedFriendliness] =
    React.useState("friendly");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = React.useState(true);

  // Fetch events on component mount
  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const result = await response.json();
        setEvents(result.data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      const payload = {
        contact_name: formData.get("name"),
        outcome: selectedType,
        friendly: selectedFriendliness === "friendly",
        notes: formData.get("notes") || null,
        event_id: selectedEvent === "none" ? null : selectedEvent,
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
      <Image
        src="/icon.png"
        alt="HKL Logo"
        width={80}       // adjust size as desired
        height={80}
        style={{ margin: "0 auto", display: "block" }}
      />
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
                How was the interaction?
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
                <Select.Trigger
                  placeholder={
                    isLoadingEvents ? "Loading events..." : "Attach event"
                  }
                />
                <Select.Content>
                  <Select.Item value="none">None</Select.Item>
                  {events.map((event) => (
                    <Select.Item key={event.id} value={event.id}>
                      {event.title}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              size="4"
              style={{ minHeight: "48px" }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Flex>
        </Form>
      </Card>
    </Box>
  );
}
