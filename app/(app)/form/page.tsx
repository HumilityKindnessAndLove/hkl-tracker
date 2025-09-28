"use client";
import { countries } from "countries-list";
import { useMemo, useState } from "react";
import { Card, Heading, Text, TextField, Select, Button } from "@radix-ui/themes";

export default function FormPage() {
  
  const countryList = useMemo(
    () =>
      Object.values(countries).map((country) => ({
        value: country.name,
        label: country.name,
      })),
    []
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-3xl font-bold text-center">HKL</h1>

      <Card className="w-full max-w-md space-y-4">

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold block">
             Name<span className="text-red-500">*</span>
          </label>
          <TextField.Root
            type="text"
            id="name"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold block">
            Email<span className="text-red-500">*</span>

          </label>
          <TextField.Root
            type="email"
            id="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-bold block">
            Country<span className="text-red-500">*</span>

          </label>
          <Select.Root defaultValue="Canada">
            <Select.Trigger placeholder="Select a country" />
            <Select.Content>
              {countryList.map((country) => (
                <Select.Item key={country.value} value={country.value}>
                  {country.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        <div className="space-y-2">
          <label htmlFor="City" className="text-sm font-bold block">
            City<span className="text-red-500">*</span>
          </label>
          <TextField.Root
            type="text"
            id="City"
            placeholder="Enter your City"
            required
            defaultValue="Calgary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="language" className="text-sm font-bold block">
            Preferred Language<span className="text-red-500">*</span>
          </label>
          <Select.Root defaultValue="English">
            <Select.Trigger placeholder="Select One" />
            <Select.Content>
              <Select.Item value="English">English</Select.Item>
              <Select.Item value="Punjabi">Punjabi</Select.Item>
              <Select.Item value="Hindi">Hindi</Select.Item>
              <Select.Item value="French">French</Select.Item>
              <Select.Item value="German">German</Select.Item>
              <Select.Item value="Italian">Italian</Select.Item>
              <Select.Item value="Japanese">Japanese</Select.Item>
              <Select.Item value="Korean">Korean</Select.Item>
              <Select.Item value="Vietnamese">Vietnamese</Select.Item>
              <Select.Item value="Tagalog">Tagalog</Select.Item>
              <Select.Item value="Russian">Russian</Select.Item>
              <Select.Item value="Spanish">Spanish</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-bold block">
            Phone (optional)
          </label>
          <TextField.Root type="tel" id="phone" placeholder="Enter your phone number">
            <TextField.Slot>+1</TextField.Slot>
          </TextField.Root>
        </div>

        <div className="text-center">
        <Text size="1" color="gray"> 
          By submitting this form, you consent to receive updates via email,
          SMS and other channels from our organization.
        </Text>
        </div>

        <div className="flex justify-center">
          <Button type="submit" highContrast size="3" variant="solid">
            I COMMIT
          </Button>
        </div>
      </Card>
    </div>
  );
}