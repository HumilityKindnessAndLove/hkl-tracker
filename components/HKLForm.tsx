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
import Image from "next/image";

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

const groupedCountries = useMemo(() => {
  const list = Object.values(countries)
    .map((country) => ({
      value: country.name,
      label: country.name,
      code: String(country.phone[0] || ""),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const priorityCountries = list.filter((c) =>
    ["Canada", "United States", "United Kingdom"].includes(c.label),
  );

  const grouped = list.reduce((groups, country) => {
    if (["Canada", "United States", "United Kingdom"].includes(country.label)) return groups;

    const firstLetter = country.label[0].toUpperCase();
    if (!groups[firstLetter]) groups[firstLetter] = [];
    groups[firstLetter].push(country);
    return groups;
  }, {} as Record<string, { value: string; label: string; code: string }[]>);

  return { priority: priorityCountries, grouped };
}, []);


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

      setSelectedCountry("");
      setSelectedLanguage("");
      setPhoneError("");

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
          HKL Pledge Form
        </Heading>

        <Form action={handleSubmit}>
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
              <input type="hidden" name="country" value={selectedCountry} />

              <Select.Root
                name="country"
                value={selectedCountry}
                onValueChange={setSelectedCountry}
                required
              >
                <Select.Trigger placeholder="Select Country" />
                <Select.Content>
                  {/* Priority section */}
                  {groupedCountries.priority.length > 0 && (
                    <Select.Group>
                      <Select.Label>*</Select.Label>
                      {groupedCountries.priority.map((country) => (
                        <Select.Item key={country.value} value={country.value}>
                          {country.label}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  )}

                  {/* Alphabetically grouped countries */}
                  {Object.keys(groupedCountries.grouped).map((letter) => (
                    <React.Fragment key={letter}>
                      <Select.Group>
                        <Select.Label>{letter}</Select.Label>
                        {groupedCountries.grouped[letter].map((country) => (
                          <Select.Item key={country.value} value={country.value}>
                            {country.label}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </React.Fragment>
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
              <input type="hidden" name="language" value={selectedLanguage} />
              <Select.Root
                name="language"
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
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
              <Text as="label" size="2" weight="medium">
                Phone Number
              </Text>
              <TextField.Root
                name="phone"
                type="tel"
                placeholder="Enter your Phone Number"
                onChange={(e) => handlePhoneChange(e.target.value)}
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
                <Text size="1" color="red">
                  {phoneError}
                </Text>
              )}
            </Flex>

            {/* Submit Button */}
            <Button
              type="submit"
              size="3"
              variant="solid"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Flex>
        </Form>
      </Card>
    </Box>
  );
}
