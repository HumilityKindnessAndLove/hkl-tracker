"use client";

import { countries } from "countries-list";
import Image from "next/image";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { validatePhone } from "../lib/phone";

type FormValues = {
  name: string;
  email: string;
  country: string;
  city: string;
  language: string;
  phone: string;
  phoneCountryCode: string;
  referralCode: string;
};

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

const referralCodes = [
  "Australia_1",
  "Australia_2",
  "Bolivia",
  "Calgary_1",
  "Calgary_2",
  "California_1",
  "California_2",
  "Edmonton_1",
  "Edmonton_2",
  "France_1",
  "France_2",
  "Germany",
  "India",
  "Indiana_1",
  "Indiana_2",
  "Italy_1",
  "Italy_2",
  "Malaysia_1",
  "Malaysia_2",
  "Michigan_1",
  "Michigan_2",
  "New York_1",
  "New York_2",
  "New Zealand_1",
  "New Zealand_2",
  "Surrey_1",
  "Surrey_2",
  "Toronto_1",
  "Toronto_2",
  "UK_1",
  "UK_2",
  "Other",
];

// Build lookup maps once at module level
const countryList = Object.entries(countries)
  .map(([code, country]) => ({
    isoCode: code,
    name: country.name,
    dialCode: `+${country.phone[0]}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const countryNameToIso = Object.fromEntries(
  countryList.map((c) => [c.name, c.isoCode]),
);

export default function HKLForm() {
  const [userCountryCode, setUserCountryCode] = React.useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      country: "",
      city: "",
      language: "",
      phone: "",
      phoneCountryCode: "",
      referralCode: "",
    },
  });

  const selectedCountry = watch("country");

  // When country changes, update the phone country code dial code
  React.useEffect(() => {
    if (selectedCountry) {
      const country = countryList.find((c) => c.name === selectedCountry);
      if (country) {
        setValue("phoneCountryCode", country.dialCode);
      }
    }
  }, [selectedCountry, setValue]);

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
        }
      } catch {
        setUserCountryCode("");
      }
    };

    detectUserCountry();

    const savedReferral = localStorage.getItem("referralCode");
    if (savedReferral) setValue("referralCode", savedReferral);

    const savedCountry = localStorage.getItem("country");
    if (savedCountry) setValue("country", savedCountry);

    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) setValue("language", savedLanguage);
  }, [setValue]);

  // If no country selected, fall back to IP-detected country code
  React.useEffect(() => {
    if (!selectedCountry && userCountryCode) {
      const country = countryList.find((c) => c.isoCode === userCountryCode);
      if (country) setValue("phoneCountryCode", country.dialCode);
    }
  }, [userCountryCode, selectedCountry, setValue]);

  const groupedCountries = useMemo(() => {
    const priorityList = ["Canada", "United States", "United Kingdom"];
    const priorityCountries = countryList.filter((c) =>
      priorityList.includes(c.name),
    );
    const grouped = countryList.reduce(
      (groups, country) => {
        if (priorityList.includes(country.name)) return groups;
        const letter = country.name[0].toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(country);
        return groups;
      },
      {} as Record<string, typeof countryList>,
    );
    return { priority: priorityCountries, grouped };
  }, []);

  const onSubmit = async (data: FormValues) => {
    const regionCode =
      countryNameToIso[data.country] || userCountryCode || "ZZ";
    const fullNumber = data.phone
      ? `${data.phoneCountryCode}${data.phone.replace(/[^\d]/g, "")}`
      : "";
    const phoneValidation = validatePhone(fullNumber, regionCode);

    try {
      const payload = {
        name: data.name,
        email: data.email,
        country: data.country || null,
        city: data.city,
        language: data.language || null,
        sms: phoneValidation.formatted,
        created_at: new Date().toISOString(),
        referral_code: data.referralCode || null,
      };

      const response = await fetch("/api/form_submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit form");
      }

      const result = await response.json();
      console.log("Form submitted successfully:", result);

      const savedReferralCode = data.referralCode;
      const savedCountry = data.country;
      const savedLanguage = data.language;

      reset();

      setValue("referralCode", savedReferralCode);
      setValue("country", savedCountry);
      setValue("language", savedLanguage);

      toast.success("Form successfully submitted!");
    } catch (error) {
      console.error("Error submitting form:", error);
      const message =
        error instanceof Error ? error.message : "Failed to submit form";
      toast.error(message);
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
            Sign up to receive weekly practices that help us become better every
            day
          </h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: John Doe"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ex: john@gmail.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="country">
                  Country <span className="text-destructive">*</span>
                </Label>
                <NativeSelect
                  id="country"
                  {...register("country", {
                    required: "Country is required",
                    onChange: (e) =>
                      localStorage.setItem("country", e.target.value),
                  })}
                >
                  <option value="">Select Country</option>
                  {groupedCountries.priority.map((country) => (
                    <option key={country.isoCode} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                  {Object.keys(groupedCountries.grouped)
                    .sort()
                    .map((letter) => (
                      <optgroup key={letter} label={letter}>
                        {groupedCountries.grouped[letter].map((country) => (
                          <option key={country.isoCode} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </NativeSelect>
                {errors.country && (
                  <p className="text-xs text-destructive">
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="Ex: San Francisco"
                  {...register("city", { required: "City is required" })}
                />
                {errors.city && (
                  <p className="text-xs text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* Preferred Language */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="language">Preferred Language</Label>
                <NativeSelect
                  id="language"
                  {...register("language", {
                    onChange: (e) =>
                      localStorage.setItem("language", e.target.value),
                  })}
                >
                  <option value="">Select Language</option>
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <NativeSelect
                    className="w-28 shrink-0"
                    {...register("phoneCountryCode")}
                  >
                    <option value="">Code</option>
                    {groupedCountries.priority.map((country) => (
                      <option key={country.isoCode} value={country.dialCode}>
                        {country.dialCode} {country.isoCode}
                      </option>
                    ))}
                    {Object.keys(groupedCountries.grouped)
                      .sort()
                      .map((letter) => (
                        <optgroup key={letter} label={letter}>
                          {groupedCountries.grouped[letter].map((country) => (
                            <option
                              key={country.isoCode}
                              value={country.dialCode}
                            >
                              {country.dialCode} {country.isoCode}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                  </NativeSelect>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ex: 415-555-5555"
                    className="flex-1"
                    {...register("phone", {
                      validate: (value) => {
                        if (!value) return true;
                        const regionCode =
                          countryNameToIso[watch("country")] ||
                          userCountryCode ||
                          "ZZ";
                        const fullNumber = `${watch("phoneCountryCode")}${value.replace(/[^\d]/g, "")}`;
                        const result = validatePhone(fullNumber, regionCode);
                        return (
                          result.isValid ||
                          (result.error ?? "Invalid phone number")
                        );
                      },
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Referral Code */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="referralCode">Referral Code</Label>
                <NativeSelect
                  id="referralCode"
                  {...register("referralCode", {
                    onChange: (e) =>
                      localStorage.setItem("referralCode", e.target.value),
                  })}
                >
                  <option value="">Select Referral Code</option>
                  {referralCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </NativeSelect>
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
          </form>
        </div>
      </Card>
    </div>
  );
}
