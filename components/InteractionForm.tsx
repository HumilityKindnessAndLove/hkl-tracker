"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {Box, Button, Flex, Heading, Select, TextField, Text,} from "@radix-ui/themes";
import * as Toast from "@radix-ui/react-toast";
import Form from "next/form";

const supabase = createClient();

export default function InteractionForm() {
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");

  // Toast state
  const [open, setOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("id, title");
      if (!error && data) setEvents(data);
    };
    fetchEvents();
  }, []);

  const showToast = (msg: string, variant: "success" | "error") => {
    setToastMsg(msg);
    setToastVariant(variant);
    setOpen(false); 
    setTimeout(() => setOpen(true), 50);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    const payload = {
      name: formData.get("name"),
      type: selectedType,
      notes: formData.get("notes"),
      event_id: selectedEvent || null,
    };

    const { error } = await supabase.from("interactions").insert(payload);

    if (error) {
      console.error("Failed to save:", error);
      showToast("❌ Failed to save interaction", "error");
    } else {
      showToast("✅ Interaction saved!", "success");
      setSelectedType("");
      setSelectedEvent("");
    }

    setLoading(false);
  };

  return (
    <Toast.Provider>
      <Box
        maxWidth="400px"
        mx="auto"
        my="6"
        p="4"
        style={{
          border: "1px solid var(--gray-6)",
          borderRadius: "var(--radius-3)",
        }}
      >
        <Heading as="h2" size="5" mb="4" align="center">
          Add Interaction
        </Heading>

        <Form action={handleSubmit}>
          <Flex direction="column" gap="3">
            {/* Name */}
            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                Name <span style={{ color: "red" }}>*</span>
              </Text>
              <TextField.Root name="name" placeholder="Enter name" required />
            </Flex>

            {/* Type of Interaction */}
            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                Type of Interaction <span style={{ color: "red" }}>*</span>
              </Text>
              <Select.Root
                value={selectedType}
                onValueChange={setSelectedType}
                required
              >
                <Select.Trigger placeholder="Select type" />
                <Select.Content>
                  <Select.Item value="conversation">Conversation</Select.Item>
                  <Select.Item value="signup">Signup</Select.Item>
                  <Select.Item value="rejection">Rejection</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Notes */}
            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                Additional Notes
              </Text>
              <TextField.Root
                name="notes"
                placeholder="Additional notes (optional)"
              />
            </Flex>

            {/* Event (optional) */}
            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                Event (optional)
              </Text>
              <Select.Root
                value={selectedEvent}
                onValueChange={setSelectedEvent}
              >
                <Select.Trigger placeholder="Attach event" />
                <Select.Content>
                  {events.map((e) => (
                    <Select.Item key={e.id} value={e.id}>
                      {e.title}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Submit */}
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Flex>
        </Form>
      </Box>

      {/* Toast */}
      <Toast.Root
        open={open}
        onOpenChange={setOpen}
        duration={3000}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "12px 16px",
          borderRadius: "var(--radius-2)",
          boxShadow: "var(--shadow-4)",
          color: "white",
          fontSize: "var(--font-size-1)",
          fontWeight: "500",
          backgroundColor:
            toastVariant === "success" ? "var(--green-9)" : "var(--red-9)",
        }}
      >
        <Toast.Title>{toastMsg}</Toast.Title>
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}
