interface BrevoContact {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    STATE?: string;
    COUNTRY?: string;
    SMS?: string;
    [key: string]: unknown;
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

interface BrevoResult {
  status: "success" | "error" | "skipped";
  brevo_id?: number;
  brevo_status?: string;
  brevo_error?: string;
  brevo_sent_at?: string;
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
  attributes: Record<string, unknown>,
  listIds?: number[],
): Promise<BrevoResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const timestamp = new Date().toISOString();

  if (!apiKey) {
    console.warn("BREVO_API_KEY is not set. Skipping Brevo contact creation.");
    return {
      status: "skipped",
      brevo_error: "BREVO_API_KEY not configured",
      brevo_sent_at: timestamp,
    };
  }

  if (!email) {
    console.warn("Email is required for Brevo contact creation");
    return {
      status: "error",
      brevo_error: "Email is required",
      brevo_sent_at: timestamp,
    };
  }

  try {
    const contactData: BrevoContact = {
      email,
      updateEnabled: true, // TODO: confirm if this is desired behavior
    };

    if (attributes && Object.keys(attributes).length > 0) {
      contactData.attributes = attributes;
    }

    // TODO: confirm if this is desired behavior
    // Add list IDs - use provided listIds, or fall back to env var, or skip if neither
    const finalListIds = listIds || getDefaultBrevoListIds();
    if (finalListIds && finalListIds.length > 0) {
      contactData.listIds = finalListIds;
    }

    // Set up timeout 10s hardcoded for now
    const timeoutMs = 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify(contactData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Response handling
      if (response.status === 201) {
        const result = (await response.json()) as BrevoCreateContactResponse;
        console.log(`Successfully created Brevo contact for ${email}`);
        return {
          status: "success",
          brevo_id: result.id,
          brevo_status: "created",
          brevo_sent_at: timestamp,
        };
      } else if (response.status === 204) {
        console.log(`Successfully updated Brevo contact for ${email}`);
        return {
          status: "success",
          brevo_status: "updated",
          brevo_sent_at: timestamp,
        };
      } else if (response.status === 400) {
        const errorData = (await response.json()) as BrevoError;
        console.error(`Brevo API validation error: ${errorData.message}`);
        return {
          status: "error",
          brevo_error: `Validation error: ${errorData.message}`,
          brevo_sent_at: timestamp,
        };
      } else if (response.status === 425) {
        console.error(`Brevo API rate limit or temporary error for ${email}`);
        return {
          status: "error",
          brevo_error: "Rate limit or temporary error",
          brevo_sent_at: timestamp,
        };
      } else {
        const errorData = (await response.json()) as BrevoError;
        const errorMessage = `API error: ${response.status} - ${errorData.message || response.statusText}`;
        console.error(`Brevo ${errorMessage}`);
        return {
          status: "error",
          brevo_error: errorMessage,
          brevo_sent_at: timestamp,
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout specifically
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error(`Brevo API timeout after ${timeoutMs}ms for ${email}`);
        return {
          status: "error",
          brevo_error: `API timeout after ${timeoutMs}ms`,
          brevo_sent_at: timestamp,
        };
      }

      // Re-throw other fetch errors to be handled by outer catch
      throw fetchError;
    }
  } catch (error) {
    console.error("Failed to create Brevo contact:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      status: "error",
      brevo_error: `Exception: ${errorMessage}`,
      brevo_sent_at: timestamp,
    };
  }
}
