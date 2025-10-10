"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="max-w-md mx-auto my-6">
      <Image
        src="/icon.png"
        alt="HKL Logo"
        width={80}
        height={80}
        style={{ margin: "0 auto", display: "block" }}
      />
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Add Interaction
          </h2>

          <Form action={handleSubmit}>
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">
                  Pledge Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter Pledge Name"
                  required
                />
              </div>

              {/* Type of Interaction */}
              <div className="flex flex-col gap-2">
                <Label>Type of Interaction</Label>
                <input type="hidden" name="outcome" value={selectedType} />
                <div className="flex gap-2 justify-center flex-wrap">
                  {["conversation", "signup", "rejection"].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={selectedType === type ? "default" : "outline"}
                      onClick={() => setSelectedType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Friendly or Unfriendly */}
              <div className="flex flex-col gap-2">
                <Label>How was the interaction?</Label>
                <input
                  type="hidden"
                  name="friendly"
                  value={selectedFriendliness}
                />
                <div className="flex gap-2 justify-center flex-wrap">
                  {["friendly", "unfriendly"].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={
                        selectedFriendliness === type ? "default" : "outline"
                      }
                      onClick={() => setSelectedFriendliness(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes (optional)"
                />
              </div>
              {/* Event */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="event">Event</Label>
                <NativeSelect
                  id="event"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  disabled={isLoadingEvents}
                >
                  <option value="none">
                    {isLoadingEvents ? "Loading events..." : "No Event"}
                  </option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full min-h-12">
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
}
