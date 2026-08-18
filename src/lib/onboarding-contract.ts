/**
 * Website-side contract for the consultation journey.
 *
 * This file deliberately contains no provider client, CRM write, or worker.
 * The Website may queue this intent only after a later approved binding.
 */

export const AMEETA_COORDINATOR_KEY = "ameeta" as const;
export const PUBLIC_INTAKE_COORDINATOR_LABEL = "a BIT Solution advisor" as const;

export const ONBOARDING_SERVICE_MESSAGE_SUBJECT = "Help us understand your needs" as const;

export const ONBOARDING_SERVICE_MESSAGE_BODY =
  "Thanks for contacting BIT Solution. A few quick answers will help an advisor understand your needs and assign the right expert. Please choose every area that applies and tell us the best time to contact you. If you need help completing the details, an advisor can call the number you provided. This message is about your request and is not a marketing subscription." as const;

export const ONBOARDING_MESSAGE_POLICY = {
  purpose: "service_request_assistance" as const,
  sender: "BIT Solution" as const,
  coordinator: AMEETA_COORDINATOR_KEY,
  allowed_channels: ["Email", "WhatsApp"] as const,
  requires_service_inquiry_consent: true as const,
  service_update_consent_by_channel: {
    Email: "email_service_updates_consent",
    WhatsApp: "whatsapp_service_updates_consent",
  } as const,
  infer_channel_consent: false as const,
  marketing_content_allowed: false as const,
  auto_call_allowed: false as const,
  provider_worker_default: "OFF" as const,
  queue_only_until_approved_binding: true as const,
  continuation_link: {
    same_lead_only: true as const,
    pii_in_url_allowed: false as const,
    credentials_in_url_allowed: false as const,
    token_kind: "opaque_signed_or_server_bound" as const,
  },
} as const;

// The token is an opaque capability, not a lead identifier. The CRM/automation
// layer must mint and validate it; the Website only validates its safe shape.
const OPAQUE_CONTINUATION_TOKEN = /^[A-Za-z0-9_-]{32,256}$/;

export function isOpaqueContinuationToken(value: unknown): value is string {
  return typeof value === "string" && OPAQUE_CONTINUATION_TOKEN.test(value);
}

export function buildContinuationPath(token: string) {
  if (!isOpaqueContinuationToken(token)) throw new Error("invalid continuation token");
  return `/consult/continue?token=${encodeURIComponent(token)}`;
}

export function continuationPathHasNoPii(path: string) {
  try {
    const parsed = new URL(path, "https://bitsolution.ca");
    const keys = [...parsed.searchParams.keys()].map((key) => key.toLowerCase());
    return (
      parsed.pathname === "/consult/continue" &&
      keys.length === 1 &&
      keys[0] === "token" &&
      isOpaqueContinuationToken(parsed.searchParams.get("token"))
    );
  } catch {
    return false;
  }
}
