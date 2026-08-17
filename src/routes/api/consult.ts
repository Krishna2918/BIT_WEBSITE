import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createHash } from "node:crypto";
import {
  CONSULT_CONSENT_VERSION,
  CONSULT_CONTRACT_VERSION,
  CONSULT_INTERESTS,
  CONSULT_SOURCE_CHANNEL,
} from "@/lib/consult-contract";

const BaseFields = {
  submission_id: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(7).max(40),
  interest: z.enum(CONSULT_INTERESTS),
  message: z.string().trim().max(2000).optional().default(""),
  casl: z.literal("yes"),
  source: z.string().trim().min(1).max(120),
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

const Schema = z.discriminatedUnion("intent", [
  z.object({
    ...BaseFields,
    intent: z.literal("fleet"),
    power_units: z.coerce.number().int().min(1).max(10000),
    eld_telematics_provider: z.string().trim().min(1).max(160),
    dispatch_bottlenecks: z.string().trim().min(1).max(500),
  }).strict(),
  z.object({
    ...BaseFields,
    intent: z.literal("dental"),
    operatory_count: z.coerce.number().int().min(1).max(1000),
    practice_software: z.string().trim().min(1).max(160),
    backup_frequency: z.string().trim().min(1).max(160),
  }).strict(),
  z.object({
    ...BaseFields,
    intent: z.literal("general"),
  }).strict(),
]);

const CrmResponse = z.object({
  ok: z.literal(true),
  contract_version: z.literal(CONSULT_CONTRACT_VERSION),
  idempotency_key: z.string().regex(/^[a-f0-9]{64}$/),
  lead_ref: z.string().min(1).max(200),
  category: z.literal("FORM_AI"),
  pinned: z.literal(true),
  priority_order: z.literal(0),
  qualified: z.boolean(),
  speed_to_lead: z.unknown(),
}).strict();

const BODY_LIMIT = 32_768;

function env(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizePhone(value: string) {
  const leadingPlus = value.trim().startsWith("+") ? "+" : "";
  return `${leadingPlus}${value.replace(/\D/g, "")}`;
}

async function verifyTurnstile(token: string | undefined, request: Request) {
  if (env("FORM_AI_TURNSTILE_ENABLED") !== "true") return { ok: true as const };
  const secret = env("FORM_AI_TURNSTILE_SECRET_KEY");
  const allowedHosts = (env("FORM_AI_TURNSTILE_EXPECTED_HOSTNAMES") || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const expectedAction = env("FORM_AI_TURNSTILE_EXPECTED_ACTION");
  if (!secret || allowedHosts.length === 0 || !expectedAction) {
    return { ok: false as const, status: 503, error: "verification_not_configured" };
  }
  if (!token) return { ok: false as const, status: 403, error: "verification_failed" };

  const form = new URLSearchParams({ secret, response: token });
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) form.set("remoteip", forwarded);
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
        signal: AbortSignal.timeout(8000),
      },
    );
    const result = (await response.json()) as {
      success?: boolean;
      hostname?: string;
      action?: string;
    };
    const hostname = result.hostname?.toLowerCase() || "";
    if (
      !response.ok ||
      !result.success ||
      !allowedHosts.includes(hostname) ||
      result.action !== expectedAction
    ) {
      return { ok: false as const, status: 403, error: "verification_failed" };
    }
    return { ok: true as const };
  } catch {
    return { ok: false as const, status: 502, error: "verification_unavailable" };
  }
}

export const Route = createFileRoute("/api/consult")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const declaredLength = Number(request.headers.get("content-length") || 0);
        if (declaredLength > BODY_LIMIT) {
          return Response.json({ ok: false, error: "body_too_large" }, { status: 413 });
        }
        let json: unknown;
        try {
          const raw = await request.text();
          if (new TextEncoder().encode(raw).byteLength > BODY_LIMIT) {
            return Response.json({ ok: false, error: "body_too_large" }, { status: 413 });
          }
          json = JSON.parse(raw);
        } catch {
          return Response.json({ ok: false }, { status: 400 });
        }
        const parsed = Schema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid" }, { status: 400 });
        }
        if (parsed.data.company_website) {
          return Response.json({ ok: true });
        }
        const verification = await verifyTurnstile(parsed.data.turnstile_token, request);
        if (!verification.ok) {
          return Response.json(
            { ok: false, error: verification.error },
            { status: verification.status },
          );
        }

        const hook = env("FORM_AI_CRM_ADAPTER_URL");
        const token = env("FORM_AI_CRM_ADAPTER_TOKEN");
        if (!hook || !token || !hook.startsWith("https://")) {
          return Response.json(
            { ok: false, error: "delivery_not_configured" },
            { status: 503 },
          );
        }

        const { company_website: _honeypot, turnstile_token: _turnstile, ...accepted } =
          parsed.data;
        const fingerprint = sha256(JSON.stringify(accepted));
        const qualification =
          accepted.intent === "fleet"
            ? {
                power_units: accepted.power_units,
                eld_telematics_provider: accepted.eld_telematics_provider,
                dispatch_bottlenecks: accepted.dispatch_bottlenecks,
              }
            : accepted.intent === "dental"
              ? {
                  operatory_count: accepted.operatory_count,
                  practice_software: accepted.practice_software,
                  backup_frequency: accepted.backup_frequency,
                }
              : {};
        const body = {
          contract_version: CONSULT_CONTRACT_VERSION,
          operation: "UPSERT_FORM_AI",
          idempotency_key: fingerprint,
          submission_fingerprint: fingerprint,
          submission_id: accepted.submission_id,
          lead_key: `${CONSULT_SOURCE_CHANNEL}:${accepted.intent}:${accepted.email.trim().toLowerCase()}`,
          category: "FORM_AI",
          pinned: true,
          priority_order: 0,
          contact: {
            name: accepted.name,
            company: accepted.company,
            email: accepted.email.trim().toLowerCase(),
            phone: normalizePhone(accepted.phone),
          },
          request: {
            interest: accepted.interest,
            message: accepted.message,
            qualification,
          },
          source: {
            channel: CONSULT_SOURCE_CHANNEL,
            intent: accepted.intent,
            form_source: accepted.source,
            landing_page: accepted.landing_page || "",
            referrer: accepted.referrer || "",
            attribution: {
              gclid: accepted.gclid || "",
              utm_source: accepted.utm_source || "",
              utm_medium: accepted.utm_medium || "",
              utm_campaign: accepted.utm_campaign || "",
              utm_term: accepted.utm_term || "",
              utm_content: accepted.utm_content || "",
              msclkid: accepted.msclkid || "",
              fbclid: accepted.fbclid || "",
            },
          },
          consent: {
            granted: true,
            framework: "CASL",
            version: CONSULT_CONSENT_VERSION,
            captured_at: new Date().toISOString(),
          },
          speed_to_lead: {
            timezone: "America/Toronto",
            staffed_weekdays: (env("FORM_AI_STAFFED_WEEKDAYS") || "Mon,Tue,Wed,Thu,Fri")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            staffed_start: env("FORM_AI_STAFFED_START") || "08:00",
            staffed_end: env("FORM_AI_STAFFED_END") || "18:00",
            staffed_target_minutes: 5,
            staffed_deadline_minutes: 15,
            after_hours: "next_staffed_opening",
          },
        };
        try {
          const delivered = await fetch(hook, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Idempotency-Key": fingerprint,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(8000),
          });
          if (!delivered.ok) {
            return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
          }
          const receipt = CrmResponse.safeParse(await delivered.json());
          if (!receipt.success || receipt.data.idempotency_key !== fingerprint) {
            return Response.json({ ok: false, error: "invalid_delivery_receipt" }, { status: 502 });
          }
          return Response.json({ ok: true, qualified: receipt.data.qualified });
        } catch {
          return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
        }
      },
    },
  },
});
