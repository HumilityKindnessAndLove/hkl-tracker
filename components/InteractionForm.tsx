"use client";

import React, { useState, useEffect } from "react";
import {Box, Button, Flex, Heading, Select, TextField, Text, Card, TextArea, Checkbox, RadioGroup,} from "@radix-ui/themes";
import Form from "next/form";



export default function InteractionForm() {
  const [selectedType, setSelectedType] = useState("signup");
  const [selectedEvent, setSelectedEvent] = useState("none");

  return (
    <Box maxWidth="400px" mx="auto" my="6">
    <Card size="3" variant="surface">
    <Heading as="h2" size="5" mb="4" align="center">
      Add Interaction
    </Heading>
  
    

        <Form action = {()=>{}}>
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
                        color={selectedType === type ? "blue" : "gray"}
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
            <RadioGroup.Root name="friendliness" defaultValue="friendly" required>
                <Flex gap="5" align="center">
                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <RadioGroup.Item value="friendly" />
                    <Text size="2">Friendly</Text>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <RadioGroup.Item value="unfriendly" />
                    <Text size="2">Unfriendly</Text>
                </label>
                </Flex>
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


