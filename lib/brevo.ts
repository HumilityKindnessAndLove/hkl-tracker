interface BrevoContact {
  email: string;
  attributes?: {
    FIRSTNAME?: string | null;
    CITY?: string | null;
    STATE?: string | null;
    COUNTRY?: string | null;
    SMS?: string | null;
    YOUR_PREFERRED_LANGUAGE?: string | null;
    VOLUNTEER_ID?: string | null;
  };
  listIds?: number[];
  updateEnabled?: boolean;
}

interface BrevoCreateContactResponse {
  id: number;
}

interface BrevoError {
  code: string;
  message: string;
}

export interface BrevoResult {
  success: boolean;
  brevo_id?: number;
  brevo_status: string;
  brevo_error?: string;
  brevo_sent_at: string;
}

// Language mapping for Brevo (legacy numeric format)
export const BREVO_LANGUAGE_MAP: Record<string, string> = {
  english: "1",
  bulgarian: "2",
  french: "3",
  german: "4",
  italian: "5",
  lithuanian: "6",
  punjabi: "7",
  polish: "8",
  malay: "9",
  russian: "10",
  spanish: "11",
};

export interface BrevoImportContact {
  EMAIL: string;
  FIRSTNAME?: string | null;
  CITY?: string | null;
  COUNTRY?: string | null;
  SMS?: string | null;
  YOUR_PREFERRED_LANGUAGE?: string | null;
  VOLUNTEER_ID?: string | null;
}

export interface BrevoImportResult {
  success: boolean;
  process_id?: string;
  error?: string;
}

export async function importBrevoContacts(
  contacts: BrevoImportContact[],
  listIds?: number[],
  notifyUrl?: string,
): Promise<BrevoImportResult> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("BREVO_API_KEY is not set. Skipping Brevo import.");
    return {
      success: false,
      error: "BREVO_API_KEY not configured",
    };
  }

  if (!contacts || contacts.length === 0) {
    return {
      success: false,
      error: "No contacts provided for import",
    };
  }

  try {
    // Use provided listIds, or fall back to env var
    const finalListIds = listIds || getDefaultBrevoListIds();
    if (!finalListIds || finalListIds.length === 0) {
      return {
        success: false,
        error:
          "No list IDs configured. Set BREVO_LIST_IDS environment variable.",
      };
    }

    const payload: {
      jsonBody: BrevoImportContact[];
      listIds: number[];
      updateExistingContacts: boolean;
      emptyContactsAttributes: boolean;
      notifyUrl?: string;
    } = {
      jsonBody: contacts,
      listIds: finalListIds,
      updateExistingContacts: true,
      emptyContactsAttributes: false,
    };

    if (notifyUrl) {
      payload.notifyUrl = notifyUrl;
    }

    const response = await fetch("https://api.brevo.com/v3/contacts/import", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 202) {
      const result = (await response.json()) as { processId: string };
      console.log(
        `Successfully initiated Brevo import for ${contacts.length} contacts. Process ID: ${result.processId}`,
      );
      return {
        success: true,
        process_id: result.processId,
      };
    } else {
      const errorData = (await response.json()) as BrevoError;
      console.error(
        `Brevo import API error (${response.status}): ${errorData.message}`,
      );
      return {
        success: false,
        error: `${errorData.code}: ${errorData.message}`,
      };
    }
  } catch (error) {
    console.error("Failed to import Brevo contacts:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Exception: ${errorMessage}`,
    };
  }
}

function getDefaultBrevoListIds(): number[] | null {
  const listIdsEnv = process.env.BREVO_LIST_IDS;
  if (!listIdsEnv) {
    return null;
  }

  try {
    return listIdsEnv
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !Number.isNaN(id));
  } catch (error) {
    console.warn("Failed to parse BREVO_LIST_IDS environment variable:", error);
    return null;
  }
}

export async function createBrevoContact(
  email: string,
  attributes: BrevoContact["attributes"],
  listIds?: number[],
): Promise<BrevoResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const timestamp = new Date().toISOString();

  if (!apiKey) {
    console.warn("BREVO_API_KEY is not set. Skipping Brevo contact creation.");
    return {
      success: false,
      brevo_status: "skipped",
      brevo_error: "BREVO_API_KEY not configured",
      brevo_sent_at: timestamp,
    };
  }

  if (!email) {
    console.warn("Email is required for Brevo contact creation");
    return {
      success: false,
      brevo_status: "error",
      brevo_error: "Email is required",
      brevo_sent_at: timestamp,
    };
  }

  try {
    const contactData: BrevoContact = {
      email,
      updateEnabled: true,
    };

    if (attributes && Object.keys(attributes).length > 0) {
      contactData.attributes = attributes;
    }

    const finalListIds = listIds || getDefaultBrevoListIds();
    if (finalListIds && finalListIds.length > 0) {
      contactData.listIds = finalListIds;
    }

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(contactData),
    });

    // Response handling
    if (response.status === 201) {
      const result = (await response.json()) as BrevoCreateContactResponse;
      console.log(`Successfully created Brevo contact for ${email}`);
      return {
        success: true,
        brevo_id: result.id,
        brevo_status: "success",
        brevo_sent_at: timestamp,
      };
    } else if (response.status === 204) {
      console.log(`Successfully updated Brevo contact for ${email}`);
      return {
        success: true,
        brevo_status: "success",
        brevo_sent_at: timestamp,
      };
    } else if (response.status === 400) {
      const errorData = (await response.json()) as BrevoError;
      console.error(`Brevo API validation error: ${errorData.message}`);
      return {
        success: false,
        brevo_status: "error",
        brevo_error: `${errorData.code}: ${errorData.message}`,
        brevo_sent_at: timestamp,
      };
    } else if (response.status === 425) {
      console.error(`Brevo API rate limit or temporary error for ${email}`);
      return {
        success: false,
        brevo_status: "error",
        brevo_error: "Rate limit or temporary error",
        brevo_sent_at: timestamp,
      };
    } else {
      const errorData = (await response.json()) as BrevoError;
      const errorMessage = `${errorData.code}: ${errorData.message || response.statusText}`;
      console.error(`Brevo API error (${response.status}): ${errorMessage}`);
      return {
        success: false,
        brevo_status: "error",
        brevo_error: errorMessage,
        brevo_sent_at: timestamp,
      };
    }
  } catch (error) {
    console.error("Failed to create Brevo contact:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      brevo_status: "error",
      brevo_error: `Exception: ${errorMessage}`,
      brevo_sent_at: timestamp,
    };
  }
}
