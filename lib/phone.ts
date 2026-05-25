import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export function validatePhone(
  phoneNumber: string,
  regionCode: string, // ISO code e.g. "CA", "US"
): {
  isValid: boolean;
  formatted?: string;
  error?: string;
} {
  if (!phoneNumber) return { isValid: true };

  const cleaned = phoneNumber.replace(/[^\d+]/g, "");

  try {
    const parsed = phoneUtil.parseAndKeepRawInput(cleaned, regionCode || "ZZ");
    if (phoneUtil.isValidNumber(parsed)) {
      return {
        isValid: true,
        formatted: phoneUtil.format(parsed, PhoneNumberFormat.E164),
      };
    }
  } catch {}

  return {
    isValid: false,
    error: "Invalid phone number for the selected country.",
  };
}
