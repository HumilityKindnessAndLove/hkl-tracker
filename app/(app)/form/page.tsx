"use client";
import * as Label from "@radix-ui/react-label";
import { Button, Card, Select, TextField } from "@radix-ui/themes";
import { countries } from "countries-list";
import { useMemo } from "react";

export default function FormPage() {
  const countryList = useMemo(
    () =>
      Object.values(countries).map((country) => ({
        value: country.name,
        label: country.name,
      })),
    [],
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4">
      <h1 className={`text-3xl font-bold text-center`}>HKL</h1>

      <Card className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <Label.Root
            htmlFor="name"
            className="text-sm font-bold flex items-center gap-1"
          >
            Pledge Name <span className="text-red-500">*</span>
          </Label.Root>
          <TextField.Root
            type="text"
            id="name"
            placeholder="Enter Your Pledge Name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label.Root
            htmlFor="email"
            className="text-sm font-bold flex items-center gap-1"
          >
            Email <span className="text-red-500">*</span>
          </Label.Root>
          <TextField.Root
            type="text"
            id="email"
            placeholder="Enter Pledge Email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label.Root
            htmlFor="country"
            className="text-sm font-bold flex items-center gap-1"
          >
            Country <span className="text-red-500">*</span>
          </Label.Root>
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
          <Label.Root
            htmlFor="city"
            className="text-sm font-bold flex items-center gap-1"
          >
            City <span className="text-red-500">*</span>
          </Label.Root>
          <TextField.Root
            type="text"
            id="city"
            required        
          />
        </div>

        <div className="space-y-2">
          <Label.Root
            htmlFor="Language"
            className="text-sm font-bold flex items-center gap-1"
          >
            Language
          </Label.Root>
          <Select.Root defaultValue="English">
            <Select.Trigger placeholder="Select One" />
            <Select.Content>
              <Select.Item value="English">English</Select.Item>
              <Select.Item value="Bulgarian">Punjabi</Select.Item>
              <Select.Item value="French">Hindi</Select.Item>
              <Select.Item value="German">German</Select.Item>
              <Select.Item value="Italian">Italian</Select.Item>
              <Select.Item value="Lithuanian">Japanese</Select.Item>
              <Select.Item value="Punjabi">Korean</Select.Item>
              <Select.Item value="Polish">Vietnamese</Select.Item>
              <Select.Item value="Malay">Tagalog</Select.Item>
              <Select.Item value="Russian">Russian</Select.Item>
              <Select.Item value="Spanish">Spanish</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div className="space-y-2">
          <Label.Root
            htmlFor="phone"
            className="text-sm font-bold flex items-center gap-1"
          >
            Phone Number
          </Label.Root>
          <TextField.Root
            type="tel"
            id="phone"
            placeholder="Enter your Phone Number"
          ></TextField.Root>
        </div>

        <div className="flex justify-center">
          <Button type="submit" highContrast size="3" variant="solid">
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
}
