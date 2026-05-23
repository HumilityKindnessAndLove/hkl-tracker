"use client";

import { countries } from "countries-list";
import Form from "next/form";
import Image from "next/image";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { validatePhone } from "../lib/phone";
import { toast } from "sonner";

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

    const priorityList = ["Canada", "United States", "United Kingdom"];

    const priorityCountries = list.filter((c) =>
      priorityList.includes(c.label),
    );

    const grouped = list.reduce(
      (groups, country) => {
        if (priorityList.includes(country.label)) {
          return groups;
        }

        const firstLetter = country.label[0].toUpperCase();
        if (!groups[firstLetter]) groups[firstLetter] = [];
        groups[firstLetter].push(country);
        return groups;
      },
      {} as Record<string, { value: string; label: string; code: string }[]>,
    );

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
        created_at: new Date().toISOString(),
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
      toast.success("Form successfully submitted!");
    } catch (error) {
      console.error("Error submitting form:", error);
      const message =
        error instanceof Error ? error.message : "Failed to submit form";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-auto ">
      <Image
        src="/icon.png"
        alt="HKL Logo"
        width={80}
        height={80}
        style={{ margin: "0 auto", display: "block" }}
      />
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-center mb-4 font-serif">
            Join the Movement
          </h2>
          <h3 className="text-sm text-muted-foreground text-center mb-8">
            Sign up to receive weekly practices that help us become better every day
          </h3>

          <Form action={handleSubmit}>
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ex: john@gmail.com"
                  required
                />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="country">
                  Country <span className="text-destructive">*</span>
                </Label>
                <NativeSelect
                  id="country"
                  name="country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  required
                >
                  <option value="">Select Country</option>
                  {groupedCountries.priority.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                  {Object.keys(groupedCountries.grouped).map((letter) => (
                    <optgroup key={letter} label={letter}>
                      {groupedCountries.grouped[letter].map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </NativeSelect>
              </div>

              {/* City */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Ex: San Francisco"
                  required
                />
              </div>

              {/* Preferred Language */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="language">Preferred Language</Label>
                <NativeSelect
                  id="language"
                  name="language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="">Select Language</option>
                  {languages.map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  {detectedCountryCode && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {detectedCountryCode}
                    </span>
                  )}
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Ex: 415-555-5555"
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={detectedCountryCode ? "pl-12" : ""}
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-destructive">{phoneError}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
}
