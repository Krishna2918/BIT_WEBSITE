import { z, type RefinementCtx } from "zod";
import {
  CONSULT_CONTACT_TIMES,
  CONSULT_INTEREST_BY_INTENT,
  CONSULT_REPLY_CHANNELS,
  CONSULT_SERVICE_OPTIONS,
  CONSULT_SOURCE_BY_INTENT,
  isAllowedPublicWebsiteHostname,
} from "./consult-contract.ts";

export const CONSULT_MESSAGE_MAX_LENGTH = 2000;

const Phone = z
  .string()
  .trim()
  .min(7)
  .max(40)
  .refine(
    (value) => /^\+?[0-9() .-]+$/.test(value) && /^\d{10,15}$/.test(value.replace(/\D/g, "")),
    "invalid phone",
  );

const PublicWebsiteUrl = z
  .string()
  .trim()
  .url()
  .max(500)
  .refine((value) => {
    const parsed = new URL(value);
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      !parsed.username &&
      !parsed.password &&
      !parsed.hash &&
      isAllowedPublicWebsiteHostname(parsed.hostname)
    );
  }, "invalid public website URL");

const Services = z
  .array(z.enum(CONSULT_SERVICE_OPTIONS))
  .min(1)
  .max(CONSULT_SERVICE_OPTIONS.length)
  .superRefine((services, context) => {
    if (new Set(services).size !== services.length) {
      context.addIssue({ code: "custom", message: "duplicate service selection" });
    }
  });

const BaseFields = {
  submission_id: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(160),
  phone: Phone,
  message: z.string().trim().max(CONSULT_MESSAGE_MAX_LENGTH).optional().default(""),
  services: Services,
  website_url: PublicWebsiteUrl.optional(),
  website_review_consent: z.boolean(),
  preferred_contact_time: z.enum(CONSULT_CONTACT_TIMES),
  preferred_reply: z.enum(CONSULT_REPLY_CHANNELS),
  service_inquiry_consent: z.literal(true),
  service_callback_consent: z.literal(true),
  email_service_updates_consent: z.boolean(),
  whatsapp_service_updates_consent: z.boolean(),
  marketing_consent: z.boolean(),
  gclid: z.string().max(200).optional(),
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(160).optional(),
  utm_term: z.string().max(160).optional(),
  utm_content: z.string().max(160).optional(),
  msclkid: z.string().max(200).optional(),
  fbclid: z.string().max(200).optional(),
  landing_page: z.string().max(200).optional(),
  referrer: z.string().max(400).optional(),
  company_website: z.string().max(200).optional(),
  turnstile_token: z.string().max(2048).optional(),
};

function websiteReviewInvariant(
  value: { website_url?: string; website_review_consent: boolean },
  context: RefinementCtx,
) {
  if (value.website_review_consent && !value.website_url) {
    context.addIssue({
      code: "custom",
      path: ["website_url"],
      message: "website review consent requires a public URL",
    });
  }
  if (value.website_url && !value.website_review_consent) {
    context.addIssue({
      code: "custom",
      path: ["website_review_consent"],
      message: "public website URL requires review consent",
    });
  }
}

function consultInvariant(
  value: {
    website_url?: string;
    website_review_consent: boolean;
    preferred_reply: (typeof CONSULT_REPLY_CHANNELS)[number];
    email_service_updates_consent: boolean;
    whatsapp_service_updates_consent: boolean;
  },
  context: RefinementCtx,
) {
  websiteReviewInvariant(value, context);
  if (value.preferred_reply === "Email" && !value.email_service_updates_consent) {
    context.addIssue({
      code: "custom",
      path: ["email_service_updates_consent"],
      message: "email reply requires email service-update consent",
    });
  }
  if (value.preferred_reply === "WhatsApp" && !value.whatsapp_service_updates_consent) {
    context.addIssue({
      code: "custom",
      path: ["whatsapp_service_updates_consent"],
      message: "WhatsApp reply requires WhatsApp service-update consent",
    });
  }
}

export const ConsultIntakeSchema = z.union([
  z
    .object({
      ...BaseFields,
      intent: z.literal("fleet"),
      source: z.literal(CONSULT_SOURCE_BY_INTENT.fleet),
      interest: z.literal(CONSULT_INTEREST_BY_INTENT.fleet),
      power_units: z.coerce.number().int().min(1).max(10000),
      eld_telematics_provider: z.string().trim().min(1).max(160),
      dispatch_bottlenecks: z.string().trim().min(1).max(500),
    })
    .strict()
    .superRefine(consultInvariant),
  z
    .object({
      ...BaseFields,
      intent: z.literal("dental"),
      source: z.literal(CONSULT_SOURCE_BY_INTENT.dental),
      interest: z.literal(CONSULT_INTEREST_BY_INTENT.dental),
      operatory_count: z.coerce.number().int().min(1).max(1000),
      practice_software: z.string().trim().min(1).max(160),
      backup_frequency: z.string().trim().min(1).max(160),
    })
    .strict()
    .superRefine(consultInvariant),
  z
    .object({
      ...BaseFields,
      intent: z.literal("general"),
      source: z.literal(CONSULT_SOURCE_BY_INTENT.general),
      interest: z.literal(CONSULT_INTEREST_BY_INTENT.general),
    })
    .strict()
    .superRefine(consultInvariant),
]);

export type ConsultIntake = z.infer<typeof ConsultIntakeSchema>;
