import { createHash } from "node:crypto";
import {
  CONSULT_CONSENT_VERSION,
  CONSULT_CONTRACT_VERSION,
  CONSULT_CHANNEL_BY_REPLY,
  CONSULT_INTEREST_BY_INTENT,
  CONSULT_OPERATION,
  CONSULT_SCOPE_BY_INTENT,
  CONSULT_SOURCE_BY_INTENT,
  CONSULT_SOURCE_CHANNEL,
  CONSULT_TIME_WINDOW_BY_CONTACT_TIME,
  buildCommercialPositioning,
  isAllowedPublicWebsiteHostname,
  resolveConsultRouting,
  validateSelectedServices,
  type ConsultContactTime,
  type ConsultReplyChannel,
  type ConsultService,
} from "./consult-contract.ts";

export type ConsultIntent = keyof typeof CONSULT_SCOPE_BY_INTENT;

export interface ConsultPayloadInput {
  submission_id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  services: ConsultService[];
  website_url?: string;
  website_review_consent: boolean;
  preferred_contact_time: ConsultContactTime;
  preferred_reply: ConsultReplyChannel;
  service_inquiry_consent: true;
  service_callback_consent: true;
  email_service_updates_consent: boolean;
  whatsapp_service_updates_consent: boolean;
  marketing_consent: boolean;
  intent: ConsultIntent;
  source: string;
  power_units?: number;
  eld_telematics_provider?: string;
  dispatch_bottlenecks?: string;
  operatory_count?: number;
  practice_software?: string;
  backup_frequency?: string;
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  msclkid?: string;
  fbclid?: string;
  landing_page?: string;
  referrer?: string;
}

export interface StaffedWindowConfig {
  weekdays: readonly number[];
  startMinutes: number;
  endMinutes: number;
}

export interface SpeedToLeadSchedule {
  timezone: "America/Toronto";
  received_at: string;
  response_target_at: string;
  response_deadline_at: string;
  priority_callback: boolean;
  callback_at: string | null;
  staffed_window: {
    weekdays: readonly number[];
    start: string;
    end: string;
  };
}

const WEEKDAY = new Map([
  ["mon", 1],
  ["tue", 2],
  ["wed", 3],
  ["thu", 4],
  ["fri", 5],
  ["sat", 6],
  ["sun", 7],
]);

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function parseClock(raw: string | undefined, fallback: string) {
  const value = (raw?.trim() || fallback).match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!value) throw new Error("FORM_AI staffed hours are invalid");
  return Number(value[1]) * 60 + Number(value[2]);
}

function parseWeekdays(raw: string | undefined) {
  const values = (raw?.trim() || "1,2,3,4,5").split(",").map((item) => {
    const token = item.trim().toLowerCase();
    if (/^[1-7]$/.test(token)) return Number(token);
    const named = WEEKDAY.get(token);
    if (!named) throw new Error("FORM_AI staffed weekdays are invalid");
    return named;
  });
  const unique = [...new Set(values)].sort((a, b) => a - b);
  if (unique.length !== values.length) throw new Error("FORM_AI staffed weekdays are invalid");
  return unique;
}

export function loadStaffedWindow(env: NodeJS.ProcessEnv = process.env): StaffedWindowConfig {
  const startMinutes = parseClock(env.FORM_AI_STAFFED_START, "08:00");
  const endMinutes = parseClock(env.FORM_AI_STAFFED_END, "18:00");
  if (startMinutes >= endMinutes) throw new Error("FORM_AI staffed hours are invalid");
  return {
    weekdays: parseWeekdays(env.FORM_AI_STAFFED_WEEKDAYS),
    startMinutes,
    endMinutes,
  };
}

function clockText(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

interface TorontoParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const torontoFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function torontoParts(value: Date): TorontoParts {
  if (!Number.isFinite(value.getTime())) throw new Error("received time is invalid");
  const parts = Object.fromEntries(
    torontoFormatter
      .formatToParts(value)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

function isoWeekday(parts: Pick<TorontoParts, "year" | "month" | "day">) {
  const day = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return day === 0 ? 7 : day;
}

function addLocalDays(parts: Pick<TorontoParts, "year" | "month" | "day">, days: number) {
  const value = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  };
}

function torontoWallTimeToUtc(date: Pick<TorontoParts, "year" | "month" | "day">, minutes: number) {
  const desired = Date.UTC(
    date.year,
    date.month - 1,
    date.day,
    Math.floor(minutes / 60),
    minutes % 60,
    0,
  );
  let guess = desired;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const rendered = torontoParts(new Date(guess));
    const renderedWall = Date.UTC(
      rendered.year,
      rendered.month - 1,
      rendered.day,
      rendered.hour,
      rendered.minute,
      rendered.second,
    );
    const correction = desired - renderedWall;
    guess += correction;
    if (correction === 0) break;
  }
  const result = new Date(guess);
  const check = torontoParts(result);
  if (
    check.year !== date.year ||
    check.month !== date.month ||
    check.day !== date.day ||
    check.hour !== Math.floor(minutes / 60) ||
    check.minute !== minutes % 60
  ) {
    throw new Error("configured Toronto staffed-window time is not representable");
  }
  return result;
}

export function computeSpeedToLeadSchedule(
  received: Date,
  staffedWindow: StaffedWindowConfig,
): SpeedToLeadSchedule {
  const local = torontoParts(received);
  const localMinutes = local.hour * 60 + local.minute;
  const staffedToday = staffedWindow.weekdays.includes(isoWeekday(local));
  const inStaffedWindow =
    staffedToday &&
    localMinutes >= staffedWindow.startMinutes &&
    localMinutes < staffedWindow.endMinutes;
  let callbackAt: Date | null = null;
  let responseBase = received;
  if (!inStaffedWindow) {
    let nextDate = { year: local.year, month: local.month, day: local.day };
    const canUseToday = staffedToday && localMinutes < staffedWindow.startMinutes;
    if (!canUseToday) nextDate = addLocalDays(nextDate, 1);
    while (!staffedWindow.weekdays.includes(isoWeekday(nextDate))) {
      nextDate = addLocalDays(nextDate, 1);
    }
    callbackAt = torontoWallTimeToUtc(nextDate, staffedWindow.startMinutes);
    responseBase = callbackAt;
  }
  return {
    timezone: "America/Toronto",
    received_at: received.toISOString(),
    response_target_at: new Date(responseBase.getTime() + 5 * 60_000).toISOString(),
    response_deadline_at: new Date(responseBase.getTime() + 15 * 60_000).toISOString(),
    priority_callback: !inStaffedWindow,
    callback_at: callbackAt?.toISOString() ?? null,
    staffed_window: {
      weekdays: [...staffedWindow.weekdays],
      start: clockText(staffedWindow.startMinutes),
      end: clockText(staffedWindow.endMinutes),
    },
  };
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeCompany(value: string) {
  return value.trim().toLowerCase();
}

export function computeLeadKey(
  input: Pick<ConsultPayloadInput, "intent" | "email" | "phone" | "company">,
) {
  return sha256(
    [
      CONSULT_SCOPE_BY_INTENT[input.intent],
      normalizeEmail(input.email),
      normalizePhone(input.phone),
      normalizeCompany(input.company),
    ].join("|"),
  );
}

function qualificationFor(input: ConsultPayloadInput) {
  if (input.intent === "fleet") {
    return {
      sector: "fleet" as const,
      power_units: input.power_units,
      eld_telematics_provider: input.eld_telematics_provider,
      dispatch_bottlenecks: input.dispatch_bottlenecks,
    };
  }
  if (input.intent === "dental") {
    return {
      sector: "dental" as const,
      operatory_count: input.operatory_count,
      practice_software: input.practice_software,
      backup_frequency: input.backup_frequency,
    };
  }
  return { sector: "general" as const };
}

function optional(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function publicWebsite(value: string | undefined) {
  const normalized = optional(value);
  if (!normalized) return null;
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("website URL is invalid");
  }
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.hash ||
    !isAllowedPublicWebsiteHostname(parsed.hostname)
  ) {
    throw new Error("website URL is invalid");
  }
  return parsed.toString();
}

export function buildFormAiCrmPayload(
  input: ConsultPayloadInput,
  received = new Date(),
  staffedWindow = loadStaffedWindow(),
) {
  if (input.source !== CONSULT_SOURCE_BY_INTENT[input.intent]) {
    throw new Error("consult form source does not match intent");
  }
  if (input.interest !== CONSULT_INTEREST_BY_INTENT[input.intent]) {
    throw new Error("consult form interest does not match intent");
  }
  const selectedServices = validateSelectedServices(input.services);
  const websiteUrl = publicWebsite(input.website_url);
  if (input.website_review_consent && !websiteUrl) {
    throw new Error("website review consent requires a public URL");
  }
  if (websiteUrl && !input.website_review_consent) {
    throw new Error("public website URL requires review consent");
  }
  const routing = resolveConsultRouting(selectedServices);
  const commercialPositioning = buildCommercialPositioning(selectedServices);
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedPhone = normalizePhone(input.phone);
  const qualification = qualificationFor(input);
  const speedToLead = computeSpeedToLeadSchedule(received, staffedWindow);
  const preferredChannel = CONSULT_CHANNEL_BY_REPLY[input.preferred_reply];
  if (preferredChannel === "email" && !input.email_service_updates_consent) {
    throw new Error("email reply requires email service-update consent");
  }
  if (preferredChannel === "whatsapp" && !input.whatsapp_service_updates_consent) {
    throw new Error("WhatsApp reply requires WhatsApp service-update consent");
  }
  const preferredTimeWindow = CONSULT_TIME_WINDOW_BY_CONTACT_TIME[input.preferred_contact_time];
  const summary = `${input.message.trim() || "Consultation request"}; ${selectedServices.join(", ")}; prefers ${preferredChannel} ${preferredTimeWindow}`.slice(0, 500);
  const publicSiteNote = input.website_review_consent
    ? optional(input.message)?.slice(0, 300) || "Please review the public website at a high level."
    : null;
  const idempotencyKey = sha256(`FORM_AI:submission:${input.submission_id}`);
  const submissionFingerprint = sha256(
    JSON.stringify({
      name: input.name.trim(),
      company: input.company.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      interest: input.interest.trim(),
      message: input.message.trim(),
      selected_services: selectedServices,
      website_review: {
        public_url: websiteUrl,
        high_level_note_consent: input.website_review_consent,
      },
      preferred_contact: {
        time: input.preferred_contact_time,
        reply_channel: input.preferred_reply,
      },
      intent: input.intent,
      source: input.source,
      qualification,
      attribution: {
        gclid: optional(input.gclid),
        utm_source: optional(input.utm_source),
        utm_medium: optional(input.utm_medium),
        utm_campaign: optional(input.utm_campaign),
        utm_term: optional(input.utm_term),
        utm_content: optional(input.utm_content),
        msclkid: optional(input.msclkid),
        fbclid: optional(input.fbclid),
      },
      landing_page: optional(input.landing_page),
      referrer: optional(input.referrer),
      consent: {
        service_inquiry: input.service_inquiry_consent,
        service_callback: input.service_callback_consent,
        service_updates: {
          email: input.email_service_updates_consent,
          whatsapp: input.whatsapp_service_updates_consent,
        },
        marketing: input.marketing_consent,
      },
      routing,
      commercial_positioning: commercialPositioning,
    }),
  );
  return {
    idempotencyKey,
    body: {
      contract_version: CONSULT_CONTRACT_VERSION,
      operation: CONSULT_OPERATION,
      idempotency_key: idempotencyKey,
      submission_fingerprint: submissionFingerprint,
      lead: {
        lead_key: computeLeadKey(input),
        category: "FORM_AI" as const,
        pinned: true as const,
        priority_order: 0 as const,
        contact: {
          name: input.name.trim(),
          company: input.company.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
        },
        request: {
          interest: input.interest.trim(),
          summary,
          qualification,
          services: selectedServices,
          preferred_contact: {
            channel: preferredChannel,
            time_window: preferredTimeWindow,
          },
          public_site_review: {
            consent: input.website_review_consent,
            public_url: websiteUrl,
            note: publicSiteNote,
          },
        },
        source: {
          channel: CONSULT_SOURCE_CHANNEL,
          intent: input.intent,
          form_source: input.source,
          landing_page: optional(input.landing_page),
          referrer: optional(input.referrer),
          attribution: {
            gclid: optional(input.gclid),
            utm_source: optional(input.utm_source),
            utm_medium: optional(input.utm_medium),
            utm_campaign: optional(input.utm_campaign),
            utm_term: optional(input.utm_term),
            utm_content: optional(input.utm_content),
            msclkid: optional(input.msclkid),
            fbclid: optional(input.fbclid),
          },
        },
        consent: {
          service_inquiry: {
            granted: true as const,
            framework: "PIPEDA_SERVICE_REQUEST" as const,
            version: CONSULT_CONSENT_VERSION,
            captured_at: speedToLead.received_at,
          },
          service_callback: {
            granted: true as const,
            purpose: "Service consultation callback and coordination only" as const,
            version: CONSULT_CONSENT_VERSION,
            captured_at: speedToLead.received_at,
          },
          marketing: {
            granted: input.marketing_consent,
            framework: "CASL_MARKETING" as const,
            version: CONSULT_CONSENT_VERSION,
            captured_at: speedToLead.received_at,
          },
          service_updates: {
            email: input.email_service_updates_consent,
            whatsapp: input.whatsapp_service_updates_consent,
          },
        },
        speed_to_lead: speedToLead,
      },
    },
  };
}
