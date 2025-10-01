import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export function validatePhone(
  phoneNumber: string,
  selectedCountry: string,
  defaultCountry: string,
): {
  isValid: boolean;
  formatted?: string;
  error?: string;
  detectedCountryCode?: string;
  numberWithoutCode?: string;
} {
  if (!phoneNumber) {
    return { isValid: true };
  }

  // Remove all non-digit characters except leading +
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");

  try {
    const parsed = phoneUtil.parseAndKeepRawInput(cleaned, "ZZ");
    if (phoneUtil.isValidNumber(parsed)) {
      const countryCode = parsed.getCountryCode();
      const nationalNumber = parsed.getNationalNumber()?.toString() || "";
      return {
        isValid: true,
        formatted: phoneUtil.format(parsed, PhoneNumberFormat.E164),
        detectedCountryCode: `+${countryCode}`,
        numberWithoutCode: nationalNumber,
      };
    }
  } catch {}

  if (selectedCountry) {
    try {
      const parsed = phoneUtil.parseAndKeepRawInput(cleaned, selectedCountry);
      if (phoneUtil.isValidNumber(parsed)) {
        const countryCode = parsed.getCountryCode();
        const nationalNumber = parsed.getNationalNumber()?.toString() || "";
        return {
          isValid: true,
          formatted: phoneUtil.format(parsed, PhoneNumberFormat.E164),
          detectedCountryCode: `+${countryCode}`,
          numberWithoutCode: nationalNumber,
        };
      }
    } catch {}
  }

  if (defaultCountry && defaultCountry !== selectedCountry) {
    try {
      const parsed = phoneUtil.parseAndKeepRawInput(cleaned, defaultCountry);
      if (phoneUtil.isValidNumber(parsed)) {
        const countryCode = parsed.getCountryCode();
        const nationalNumber = parsed.getNationalNumber()?.toString() || "";
        return {
          isValid: true,
          formatted: phoneUtil.format(parsed, PhoneNumberFormat.E164),
          detectedCountryCode: `+${countryCode}`,
          numberWithoutCode: nationalNumber,
        };
      }
    } catch {}
  }

  return {
    isValid: false,
    error:
      "Invalid phone number. Please include country code for best results. (e.g., +1 for US)",
  };
}

export function getCountryCodeFromE164(e164?: string): string {
  if (!e164) return "";
  const match = e164.match(/^\+(\d+)/);
  return match ? `+${match[1]}` : "";
}
