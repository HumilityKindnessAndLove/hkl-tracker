"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
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
    <div className="max-w-md mx-auto my-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-center mb-4">
            HKL Pledge Form
          </h2>

          <Form action={handleSubmit}>
            <div className="flex flex-col gap-4">
              {/* Pledge Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">
                  Pledge Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter Your Pledge Name"
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
                  placeholder="Enter Pledge Email"
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
                  {countryList.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
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
                  placeholder="Enter your City"
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
                    placeholder="Enter your Phone Number"
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
