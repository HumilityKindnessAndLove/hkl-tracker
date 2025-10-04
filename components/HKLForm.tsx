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
import { validatePhone } from "../lib/phone";

export default function HKLForm() {
  const [selectedCountry, setSelectedCountry] = React.useState("");
  const [selectedLanguage, setSelectedLanguage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [phoneError, setPhoneError] = React.useState("");
  const [detectedCountryCode, setDetectedCountryCode] = React.useState("");
  const [userCountryCode, setUserCountryCode] = React.useState("");

  React.useEffect(() => {
    const detectUserCountry = async () => {
      try {
        const response = await fetch(
          "http://ip-api.com/json/?fields=status,countryCode",
        );

        if (!response.ok) {
          throw new Error(`IP API responded with status: ${response.status}`);
        }

        const geo = await response.json();

        if (geo.status === "success" && geo.countryCode) {
          setUserCountryCode(geo.countryCode);
          console.log("Detected user country code:", geo.countryCode);
        } else {
          setUserCountryCode("");
        }
      } catch (error) {
        console.log("Failed to detect user country:", error);
        setUserCountryCode("");
      }
    };

    detectUserCountry();
  }, []);

  const countryList = useMemo(
    () =>
      Object.values(countries).map((country) => ({
        value: country.name,
        label: country.name,
        code: country.phone[0],
      })),
    [],
  );

  const languages = [
    { value: "english", label: "English" },
    { value: "bulgarian", label: "Bulgarian" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "italian", label: "Italian" },
    { value: "lithuanian", label: "Lithuanian" },
    { value: "punjabi", label: "Punjabi" },
    { value: "polish", label: "Polish" },
    { value: "malay", label: "Malay" },
    { value: "russian", label: "Russian" },
    { value: "spanish", label: "Spanish" },
  ];

  const handlePhoneChange = (value: string) => {
    if (!value) {
      setPhoneError("");
      setDetectedCountryCode("");
      return;
    }

    const result = validatePhone(value, selectedCountry, userCountryCode);
    if (result.isValid) {
      setDetectedCountryCode(result.detectedCountryCode ?? "");
      setPhoneError("");
    } else {
      setDetectedCountryCode("");
      setPhoneError(result.error ?? "Invalid phone number");
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setPhoneError("");

    try {
      const phoneNumber = formData.get("phone")?.toString() || "";

      const phoneValidation = validatePhone(
        phoneNumber,
        selectedCountry,
        userCountryCode,
      );

      if (!phoneValidation.isValid && phoneNumber) {
        setPhoneError(phoneValidation.error ?? "Invalid phone number");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        country: selectedCountry || null,
        city: formData.get("city"),
        language: selectedLanguage || null,
        sms: phoneValidation.formatted,
        submitted_at: new Date().toISOString(),
      };

      const response = await fetch("/api/form_submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit form");
      }

      const result = await response.json();
      console.log("Form submitted successfully:", result);

      // Reset form on success
      setSelectedCountry("");
      setSelectedLanguage("");
      setPhoneError("");

      // Reset form fields
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) form.reset();

      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error instanceof Error ? error.message : "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxWidth={{ initial: "100%", sm: "500px" }} mx="auto" my="0">
      <Card size={{ initial: "3", sm: "4" }}>
        <Heading as="h2" size={{ initial: "6", sm: "7" }} mb="5" align="center">
          HKL Pledge Form
        </Heading>

        <Form action={handleSubmit}>
          <Flex direction="column" gap="5">
            {/* Pledge Name */}
            <Flex direction="column" gap="2">
              <Text as="label" size={{ initial: "3", sm: "2" }} weight="medium">
                Pledge Name <span style={{ color: "red" }}>*</span>
              </Text>
              <TextField.Root
                name="name"
                placeholder="Enter Your Pledge Name"
                required
                size="3"
              />
            </Flex>

            {/* Email */}
            <Flex direction="column" gap="2">
              <Text as="label" size={{ initial: "3", sm: "2" }} weight="medium">
                Email <span style={{ color: "red" }}>*</span>
              </Text>
              <TextField.Root
                name="email"
                type="email"
                placeholder="Enter Pledge Email"
                required
                size="3"
              />
            </Flex>

            {/* Country */}
            <Flex direction="column" gap="2">
              <Text as="label" size={{ initial: "3", sm: "2" }} weight="medium">
                Country <span style={{ color: "red" }}>*</span>
              </Text>
              <input type="hidden" name="country" value={selectedCountry} />
              <Select.Root
                name="country"
                value={selectedCountry}
                onValueChange={setSelectedCountry}
                required
                size="3"
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
              <Text as="label" size={{ initial: "3", sm: "2" }} weight="medium">
                City <span style={{ color: "red" }}>*</span>
              </Text>
              <TextField.Root
                name="city"
                placeholder="Enter your City"
                required
                size="3"
              />
            </Flex>

            {/* Preferred Language */}
            <Flex direction="column" gap="2">
              <Text as="label" size={{ initial: "3", sm: "2" }} weight="medium">
                Preferred Language
              </Text>
              <input type="hidden" name="language" value={selectedLanguage} />
              <Select.Root
                name="language"
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
                size="3"
              >
                <Select.Trigger placeholder="Select Language" />
                <Select.Content>
                  {languages.map((language) => (
                    <Select.Item key={language.value} value={language.value}>
                      {language.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Phone Number */}
            <Flex direction="column" gap="2">
              <Text as="label" size={{ initial: "3", sm: "2" }} weight="medium">
                Phone Number
              </Text>
              <TextField.Root
                name="phone"
                type="tel"
                placeholder="Enter your Phone Number"
                onChange={(e) => handlePhoneChange(e.target.value)}
                size="3"
              >
                {detectedCountryCode && (
                  <TextField.Slot side="left">
                    <Text size="2" color="gray">
                      {detectedCountryCode}
                    </Text>
                  </TextField.Slot>
                )}
              </TextField.Root>
              {phoneError && (
                <Text size="2" color="red">
                  {phoneError}
                </Text>
              )}
            </Flex>

            {/* Submit Button */}
            <Button
              type="submit"
              size="4"
              variant="solid"
              disabled={isSubmitting}
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
