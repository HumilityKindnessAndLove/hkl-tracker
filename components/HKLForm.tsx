"use client";

import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";
import { countries } from "countries-list";
import Form from "next/form";
import React, { useMemo } from "react";

export default function HKLForm() {
  const [selectedCountry, setSelectedCountry] = React.useState("");
  const [selectedLanguage, setSelectedLanguage] = React.useState("");

  const countryList = useMemo(
    () =>
      Object.values(countries).map((country) => ({
        value: country.name,
        label: country.name,
      })),
    [],
  );

  const languages = [
    "English",
    "Bulgarian",
    "French",
    "German",
    "Italian",
    "Lithuanian",
    "Punjabi",
    "Polish",
    "Malay",
    "Russian",
    "Spanish",
  ];

  return (
    <Box maxWidth="400px" mx="auto" my="6">
      <Card size="3" variant="surface">
        <Heading as="h2" size="5" mb="4" align="center">
          HKL Pledge Form
        </Heading>

        <Form action={() => {}}>
          <Flex direction="column" gap="4">
            {/* Pledge Name */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Pledge Name <span style={{ color: "red" }}>*</span>
              </Text>
              <TextField.Root
                name="name"
                placeholder="Enter Your Pledge Name"
                required
              />
            </Flex>

            {/* Email */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Email <span style={{ color: "red" }}>*</span>
              </Text>
              <TextField.Root
                name="email"
                type="email"
                placeholder="Enter Pledge Email"
                required
              />
            </Flex>

            {/* Country */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Country <span style={{ color: "red" }}>*</span>
              </Text>
              <Select.Root
                name="country"
                value={selectedCountry}
                onValueChange={setSelectedCountry}
                required
              >
                <Select.Trigger placeholder="Select Country" />
                <Select.Content>
                  {countryList.map((country) => (
                    <Select.Item key={country.value} value={country.value}>
                      {country.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* City */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                City <span style={{ color: "red" }}>*</span>
              </Text>
              <TextField.Root
                name="city"
                placeholder="Enter your City"
                required
              />
            </Flex>

            {/* Preferred Language */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Preferred Language
              </Text>
              <Select.Root
                name="language"
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <Select.Trigger placeholder="Select Language" />
                <Select.Content>
                  {languages.map((language) => (
                    <Select.Item key={language} value={language}>
                      {language}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Phone Number */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium">
                Phone Number
              </Text>
              <TextField.Root
                name="phone"
                type="tel"
                placeholder="Enter your Phone Number"
              />
            </Flex>

            {/* Submit Button */}
            <Button type="submit" size="3" variant="solid">
              Submit
            </Button>
          </Flex>
        </Form>
      </Card>
    </Box>
  );
}
