import { z } from "zod";

export const formSubmissionSchema = z.object({
  f_name: z.string().nullable().optional(),
  l_name: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
  phone: z.e164().nullable().optional(),
  location_id: z.string().nullable().optional(),
  payload: z.any().nullable().optional(),
  qr_token: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  volunteer_id: z.string().nullable().optional(),
  submitted_at: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
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

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export const validateFormSubmission = (data: unknown) =>
  formSubmissionSchema.parse(data);
export const validateInteraction = (data: unknown) =>
  interactionSchema.parse(data);
export const validateEvent = (data: unknown) => eventSchema.parse(data);
