import { z } from "zod";

export const TICKET_WHATSAPP_HREF = "https://wa.me/19058676574";

export const TICKET_SOURCE = "website-ticket" as const;
export const TICKET_MESSAGE_MAX_LENGTH = 2000;
export const TICKET_IMPACTS = ["one-person", "whole-office"] as const;

export const TICKET_IMPACT_LABELS: Record<(typeof TICKET_IMPACTS)[number], string> = {
  "one-person": "One person",
  "whole-office": "Whole office",
};

const OptionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value ?? "");

export const TicketIntakeSchema = z
  .object({
    company: z.string().trim().min(1).max(160),
    email: z.string().trim().email().max(160),
    name: OptionalText(120),
    hostname: OptionalText(120),
    impact: z
      .union([z.enum(TICKET_IMPACTS), z.literal("")])
      .optional()
      .transform((value) => value ?? ""),
    message: z.string().trim().min(1).max(TICKET_MESSAGE_MAX_LENGTH),
    source: z.literal(TICKET_SOURCE),
  })
  .strict();

export type TicketIntake = z.infer<typeof TicketIntakeSchema>;

export type TicketApiSuccess = {
  ok: true;
  work_id?: string;
  door?: "whatsapp";
  href?: string;
};

export function ticketIngestUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.hash) {
      return undefined;
    }
    const path = parsed.pathname.replace(/\/+$/, "");
    if (!path.endsWith("/inbound/ticket")) {
      parsed.pathname = `${path}/inbound/ticket`;
    }
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function ticketWorkId(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const raw = record.work_id ?? record.ticket_id;
  if (typeof raw !== "string") return undefined;
  const id = raw.trim();
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(id) ? id : undefined;
}

export function buildWhatsappTicketHref(intake: TicketIntake) {
  const lines = [
    "IT ticket from bitsolution.ca",
    `Company: ${intake.company}`,
    `Work email: ${intake.email}`,
  ];
  if (intake.name) lines.push(`Name: ${intake.name}`);
  if (intake.hostname) lines.push(`PC: ${intake.hostname}`);
  if (intake.impact) lines.push(`Impact: ${TICKET_IMPACT_LABELS[intake.impact]}`);
  lines.push("", intake.message);
  return `${TICKET_WHATSAPP_HREF}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function isSafeWhatsappHref(value: string) {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "wa.me" &&
      parsed.pathname === "/19058676574"
    );
  } catch {
    return false;
  }
}

export function ticketPayload(intake: TicketIntake) {
  return {
    company: intake.company,
    email: intake.email,
    name: intake.name,
    hostname: intake.hostname,
    impact: intake.impact,
    message: intake.message,
    source: TICKET_SOURCE,
  };
}
