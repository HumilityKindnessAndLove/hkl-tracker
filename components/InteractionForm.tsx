"use client";

import React, { useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import * as Select from "@radix-ui/react-select";
import * as Toast from "@radix-ui/react-toast";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface EventOption {
  id: string;
  title: string;
}

export default function InteractionForm() {
  const [name, setName] = useState("");
  const [interactionType, setInteractionType] = useState("");
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(false);

  // Toast state
  const [open, setOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("id, title");
      if (!error && data) setEvents(data as EventOption[]);
    };
    fetchEvents();
  }, []);

  const showToast = (msg: string, variant: "success" | "error") => {
    setToastMsg(msg);
    setToastVariant(variant);
    setOpen(false); // reset before re-opening
    setTimeout(() => setOpen(true), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation
    if (!name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    if (!interactionType) {
      showToast("Type of interaction is required", "error");
      return;
    }

    setLoading(true);
    try {
      // Example payload (replace with API call later if needed)
      const payload = {
        name,
        type: interactionType,
        event_id: selectedEvent || null,
      };
      console.log("Submitting payload:", payload);

      // Simulate API success
      showToast("✅ Interaction saved!", "success");

      // Reset
      setName("");
      setInteractionType("");
      setSelectedEvent("");
    } catch (err) {
      showToast("❌ Failed to save interaction", "error");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Form */}
      <Form.Root
        onSubmit={handleSubmit}
        className="p-6 border rounded-lg max-w-md w-full mx-auto shadow-md space-y-4 bg-white"
      >
        <h2 className="text-2xl font-semibold text-center">Add Interaction</h2>

        {/* Name */}
        <Form.Field name="name" className="space-y-2">
          <Form.Label className="block font-medium text-base">
            Name <span className="text-red-500">*</span>
          </Form.Label>
          <Form.Control asChild>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </Form.Control>
        </Form.Field>

        {/* Type of Interaction */}
        <Form.Field name="type" className="space-y-2">
          <Form.Label className="block font-medium text-base">
            Type of Interaction <span className="text-red-500">*</span>
          </Form.Label>
          <Select.Root value={interactionType} onValueChange={setInteractionType}>
            <Select.Trigger
              className="inline-flex items-center justify-between w-full px-4 py-3 border rounded-md bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Interaction type"
            >
              <Select.Value placeholder="Select type..." />
              <Select.Icon>▾</Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                className="overflow-hidden bg-white border rounded-md shadow-lg max-h-60 w-full"
                position="popper"
                sideOffset={4}
              >
                <Select.Viewport className="p-1">
                  {["conversation", "signup", "rejection"].map((type) => (
                    <Select.Item
                      key={type}
                      value={type}
                      className="relative flex items-center px-4 py-3 text-base rounded-md cursor-pointer hover:bg-blue-50 focus:bg-blue-100"
                    >
                      <Select.ItemText className="capitalize">{type}</Select.ItemText>
                      <Select.ItemIndicator className="absolute right-3">
                        ✓
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </Form.Field>

        {/* Event (Optional) */}
        <Form.Field name="event" className="space-y-2">
          <Form.Label className="block font-medium text-base">Event (optional)</Form.Label>
          <Select.Root value={selectedEvent} onValueChange={setSelectedEvent}>
            <Select.Trigger
              className="inline-flex items-center justify-between w-full px-4 py-3 border rounded-md bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Event"
            >
              <Select.Value placeholder="Attach an event (optional)" />
              <Select.Icon>▾</Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                className="overflow-hidden bg-white border rounded-md shadow-lg max-h-60 w-full"
                position="popper"
                sideOffset={4}
              >
                <Select.Viewport className="p-1">
                  {events.map((e) => (
                    <Select.Item
                      key={e.id}
                      value={e.id}
                      className="relative flex items-center px-4 py-3 text-base rounded-md cursor-pointer hover:bg-blue-50 focus:bg-blue-100"
                    >
                      <Select.ItemText>{e.title}</Select.ItemText>
                      <Select.ItemIndicator className="absolute right-3">
                        ✓
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </Form.Field>

        {/* Submit */}
        <Form.Submit asChild>
          <button
            disabled={loading}
            className="bg-blue-600 text-white font-semibold px-4 py-3 rounded-md w-full text-base hover:bg-blue-700 active:bg-blue-800 transition"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </Form.Submit>
      </Form.Root>

      {/* Toast */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-3 rounded-md shadow-md text-white text-sm font-medium ${
            toastVariant === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <Toast.Title>{toastMsg}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col gap-2 p-4 w-96 max-w-full m-0 list-none z-50 outline-none" />
      </Toast.Provider>
    </>
  );
}
