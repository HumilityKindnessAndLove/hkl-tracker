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

  return (
    <Box maxWidth="400px" mx="auto" my="6">
      <Card size="3" variant="surface">
        <Heading as="h2" size="5" mb="4" align="center">
          Add Interaction
        </Heading>

        <Form action={() => {}}>
          <Flex direction="column" gap="4">
            {/* Name */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Name <span style={{ color: "red" }}>*</span>
              </Text>
              <TextField.Root name="name" placeholder="Enter name" required />
            </Flex>

            {/* Type of Interaction */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Type of Interaction
              </Text>
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
            <Button type="submit">Submit</Button>
          </Flex>
        </Form>
      </Card>
    </Box>
  );
}
