import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(120, "name must be at most 120 characters"),
  email: z
    .string()
    .trim()
    .email("email must be a valid email address")
    .max(254, "email must be at most 254 characters"),
  company: z
    .string()
    .trim()
    .max(160, "company must be at most 160 characters")
    .optional(),
  phone: z
    .string()
    .trim()
    .max(40, "phone must be at most 40 characters")
    .optional(),
  message: z
    .string()
    .trim()
    .min(1, "message is required")
    .max(5000, "message must be at most 5000 characters"),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;

export type ContactEmail = {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  submittedAt: string;
};
