import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CONSULT_CONTRACT_VERSION } from "@/lib/consult-contract";
import { ConsultIntakeSchema } from "@/lib/consult-intake-schema";
import { buildFormAiCrmPayload } from "@/lib/form-ai-payload.server";
import { buildConsultBrowserSuccess } from "@/lib/consultation-conversion";

const CrmResponse = z
  .object({
    ok: z.literal(true),
    contract_version: z.literal(CONSULT_CONTRACT_VERSION),
    idempotency_key: z.string().regex(/^[a-f0-9]{64}$/),
    lead_ref: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/),
    category: z.literal("FORM_AI"),
    queue_key: z.string().min(1),
    display_label: z.string().min(1),
    pinned: z.literal(true),
    priority_order: z.literal(0),
    sector_classification: z.string().min(1),
    services: z.array(z.string()).min(1),
    routing: z.record(z.string(), z.unknown()),
    qualified: z.boolean(),
    software_primary_recommendation: z.boolean(),
    offer_eligibility_review: z.boolean(),
    offer_eligibility_state: z.string().min(1),
    offer_external_use_allowed: z.literal(false),
    speed_to_lead: z
      .object({
        timezone: z.literal("America/Toronto"),
        received_at: z.string().datetime(),
        response_target_at: z.string().datetime(),
        response_deadline_at: z.string().datetime(),
        priority_callback: z.boolean(),
        callback_at: z.string().datetime().nullable(),
        staffed_window: z
          .object({
            weekdays: z.array(z.number().int().min(1).max(7)).min(1).max(7),
            start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
            end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
          })
          .strict(),
      })
      .strict(),
    outbox: z
      .object({
        artifact_types: z.array(z.string()),
        artifact_count: z.number().int().nonnegative(),
        all_states: z.literal("pending"),
        all_attempt_counts: z.literal(0),
        workers_started: z.literal(false),
      })
      .strict(),
    external_effects_permitted: z.literal(false),
  })
  .strict();

const BODY_LIMIT = 32_768;
const ADAPTER_RESPONSE_LIMIT = 32_768;

function env(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function secureAdapterUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password && !parsed.hash
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function serverToken(value: string | undefined) {
  return value && value.length >= 16 && value.length <= 4096 && !/\s/.test(value)
    ? value
    : undefined;
}

async function boundedResponseText(response: Response, limit: number) {
  const declared = response.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > limit)) return undefined;
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        return undefined;
      }
      chunks.push(value);
    }
    const combined = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(combined);
  } catch {
    return undefined;
  } finally {
    reader.releaseLock();
  }
}

function scheduleMatches(
  actual: z.infer<typeof CrmResponse>["speed_to_lead"],
  expected: ReturnType<typeof buildFormAiCrmPayload>["body"]["lead"]["speed_to_lead"],
) {
  return (
    actual.timezone === expected.timezone &&
    actual.received_at === expected.received_at &&
    actual.response_target_at === expected.response_target_at &&
    actual.response_deadline_at === expected.response_deadline_at &&
    actual.priority_callback === expected.priority_callback &&
    actual.callback_at === expected.callback_at &&
    actual.staffed_window.start === expected.staffed_window.start &&
    actual.staffed_window.end === expected.staffed_window.end &&
    actual.staffed_window.weekdays.length === expected.staffed_window.weekdays.length &&
    actual.staffed_window.weekdays.every(
      (weekday, index) => weekday === expected.staffed_window.weekdays[index],
    )
  );
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
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(8000),
    });
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
      GET: () =>
        Response.json(
          { ok: false, error: "method_not_allowed" },
          { status: 405, headers: { Allow: "POST" } },
        ),
      POST: async ({ request }) => {
        if (
          request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !==
          "application/json"
        ) {
          return Response.json({ ok: false, error: "unsupported_media_type" }, { status: 415 });
        }
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
        const parsed = ConsultIntakeSchema.safeParse(json);
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

        const hook = secureAdapterUrl(env("FORM_AI_CRM_ADAPTER_URL"));
        const token = serverToken(env("FORM_AI_CRM_ADAPTER_TOKEN"));
        if (!hook || !token) {
          return Response.json({ ok: false, error: "delivery_not_configured" }, { status: 503 });
        }

        const {
          company_website: _honeypot,
          turnstile_token: _turnstile,
          ...accepted
        } = parsed.data;
        let delivery: ReturnType<typeof buildFormAiCrmPayload>;
        try {
          delivery = buildFormAiCrmPayload(accepted);
        } catch {
          return Response.json({ ok: false, error: "delivery_not_configured" }, { status: 503 });
        }
        const { body, idempotencyKey } = delivery;
        try {
          const delivered = await fetch(hook, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Idempotency-Key": idempotencyKey,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(8000),
          });
          if (!delivered.ok) {
            return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
          }
          if (
            delivered.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !==
            "application/json"
          ) {
            return Response.json({ ok: false, error: "invalid_delivery_receipt" }, { status: 502 });
          }
          const receiptText = await boundedResponseText(delivered, ADAPTER_RESPONSE_LIMIT);
          if (receiptText === undefined) {
            return Response.json({ ok: false, error: "invalid_delivery_receipt" }, { status: 502 });
          }
          let receiptValue: unknown;
          try {
            receiptValue = JSON.parse(receiptText);
          } catch {
            return Response.json({ ok: false, error: "invalid_delivery_receipt" }, { status: 502 });
          }
          const receipt = CrmResponse.safeParse(receiptValue);
          if (
            !receipt.success ||
            receipt.data.idempotency_key !== idempotencyKey ||
            !scheduleMatches(receipt.data.speed_to_lead, body.lead.speed_to_lead)
          ) {
            return Response.json({ ok: false, error: "invalid_delivery_receipt" }, { status: 502 });
          }
          return Response.json(buildConsultBrowserSuccess(idempotencyKey, receipt.data.qualified));
        } catch {
          return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
        }
      },
    },
  },
});
