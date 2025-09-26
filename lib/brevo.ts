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
  firstName?: string | null,
  lastName?: string | null,
  additionalAttributes?: Record<string, unknown>,
  listIds?: number[],
): Promise<BrevoCreateContactResponse | null> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("BREVO_API_KEY is not set. Skipping Brevo contact creation.");
    return null;
  }

  if (!email) {
    console.warn("Email is required for Brevo contact creation");
    return null;
  }

  try {
    const contactData: BrevoContact = {
      email,
      updateEnabled: true, // TODO: confirm if this is desired behavior
    };

    // Add names and other attributes
    const attributes: Record<string, unknown> = {
      ...additionalAttributes,
    };

    if (firstName) {
      attributes.FIRSTNAME = firstName;
    }
    if (lastName) {
      attributes.LASTNAME = lastName;
    }

    // Set attributes if we have any
    if (Object.keys(attributes).length > 0) {
      contactData.attributes = attributes;
    }

    // TODO: confirm if this is desired behavior
    // Add list IDs - use provided listIds, or fall back to env var, or skip if neither
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
      return result;
    } else if (response.status === 204) {
      console.log(`Successfully updated Brevo contact for ${email}`);
      return { id: -1 }; // Return a mock success response for updates
    } else if (response.status === 400) {
      const errorData = (await response.json()) as BrevoError;
      console.error(`Brevo API validation error: ${errorData.message}`);
      return null;
    } else if (response.status === 425) {
      console.error(`Brevo API rate limit or temporary error for ${email}`);
      return null;
    } else {
      const errorData = (await response.json()) as BrevoError;
      throw new Error(
        `Brevo API error: ${response.status} - ${errorData.message || response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Failed to create Brevo contact:", error);
    // TODO: confirm if this is desired behavior
    // Don't throw the error - we want the main form submission to succeed
    return null;
  }
}
