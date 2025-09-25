import { z } from "zod";

export const formSubmissionSchema = z.object({
  contact_name: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  location_id: z.string().nullable().optional(),
  payload: z.any().nullable().optional(),
  qr_token: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  volunteer_id: z.string().nullable().optional(),
  submitted_at: z.string().nullable().optional(),
});

export const interactionSchema = z.object({
  contact_name: z.string().nullable().optional(),
  date: z.string(),
  event_id: z.string().nullable().optional(),
  friendly: z.boolean().nullable().optional(),
  location_id: z.string(),
  notes: z.string().nullable().optional(),
  outcome: z.string(),
  volunteer_id: z.string().nullable().optional(),
});

export const validateFormSubmission = (data: unknown) =>
  formSubmissionSchema.parse(data);
export const validateInteraction = (data: unknown) =>
  interactionSchema.parse(data);
