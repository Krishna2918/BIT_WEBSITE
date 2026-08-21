import { createHash } from "node:crypto";

const BODY_LIMIT = 32_768;
const ALLOWED_KEYS = new Set([
  "name",
  "company",
  "email",
  "phone",
  "interest",
  "message",
  "casl",
  "measure",
  "intent",
  "source",
  "gclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "msclkid",
  "fbclid",
  "landing_page",
  "referrer",
  "company_website",
]);

export type ConsultEnv = Record<string, string | undefined>;

export type ConsultPost = {
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  casl: "yes";
  measure?: string;
  intent?: string;
  source?: string;
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
  company_website?: string;
};

function env(name: string, environment: ConsultEnv) {
  const value = environment[name]?.trim();
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

function text(value: unknown, min: number, max: number) {
  if (typeof value !== "string") return undefined;
  const result = value.trim();
  if (result.length < min || result.length > max) return undefined;
  return result;
}

function optionalText(value: unknown, max: number) {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length > max) return undefined;
  return value;
}

export function parseConsultPost(json: unknown): ConsultPost | undefined {
  if (!json || typeof json !== "object" || Array.isArray(json)) return undefined;
  const raw = json as Record<string, unknown>;
  if (Object.keys(raw).some((key) => !ALLOWED_KEYS.has(key))) return undefined;
  const name = text(raw.name, 2, 120);
  const company = text(raw.company, 1, 160);
  const email = text(raw.email, 3, 160);
  const phone = text(raw.phone, 7, 40);
  const interest = text(raw.interest, 2, 160);
  if (!name || !company || !email || !phone || !interest) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return undefined;
  if (raw.casl !== "yes") return undefined;
  const message = raw.message === undefined ? "" : text(raw.message, 0, 2000);
  if (message === undefined) return undefined;
  return {
    name,
    company,
    email,
    phone,
    interest,
    message,
    casl: "yes",
    measure: optionalText(raw.measure, 8),
    intent: optionalText(raw.intent, 40),
    source: optionalText(raw.source, 120),
    gclid: optionalText(raw.gclid, 200),
    utm_source: optionalText(raw.utm_source, 120),
    utm_medium: optionalText(raw.utm_medium, 120),
    utm_campaign: optionalText(raw.utm_campaign, 160),
    utm_term: optionalText(raw.utm_term, 160),
    utm_content: optionalText(raw.utm_content, 160),
    msclkid: optionalText(raw.msclkid, 200),
    fbclid: optionalText(raw.fbclid, 200),
    landing_page: optionalText(raw.landing_page, 200),
    referrer: optionalText(raw.referrer, 400),
    company_website: optionalText(raw.company_website, 200),
  };
}

export function consultTransactionId(input: {
  email: string;
  phone: string;
  company: string;
  interest: string;
  message: string;
  intent?: string;
  source?: string;
}) {
  return createHash("sha256")
    .update(
      [
        "consult",
        input.email.trim().toLowerCase(),
        input.phone.replace(/\D/g, ""),
        input.company.trim().toLowerCase(),
        input.interest.trim(),
        input.message.trim(),
        (input.intent || "").trim(),
        (input.source || "").trim(),
      ].join("|"),
      "utf8",
    )
    .digest("hex");
}

export function consultMethodNotAllowed() {
  return Response.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } },
  );
}

function crmPayload(data: ConsultPost, transactionId: string) {
  return {
    transaction_id: transactionId,
    idempotency_key: transactionId,
    name: data.name,
    company: data.company,
    email: data.email.trim().toLowerCase(),
    phone: data.phone.replace(/\D/g, ""),
    interest: data.interest,
    message: data.message,
    intent: data.intent || "",
    source: data.source || "",
    gclid: data.gclid || "",
    utm_source: data.utm_source || "",
    utm_medium: data.utm_medium || "",
    utm_campaign: data.utm_campaign || "",
    utm_term: data.utm_term || "",
    utm_content: data.utm_content || "",
    msclkid: data.msclkid || "",
    fbclid: data.fbclid || "",
    landing_page: data.landing_page || "",
    referrer: data.referrer || "",
    received_at: new Date().toISOString(),
  };
}

export async function handleConsultPost(
  request: Request,
  environment: ConsultEnv = process.env,
  fetchImplementation: typeof fetch = fetch,
) {
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
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const parsed = parseConsultPost(json);
  if (!parsed) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  if (parsed.company_website) {
    return Response.json({ ok: true });
  }

  const transactionId = consultTransactionId(parsed);
  const outbound = crmPayload(parsed, transactionId);
  const encoded = JSON.stringify(outbound);

  const hook =
    secureAdapterUrl(env("CONSULT_WEBHOOK_URL", environment)) ||
    secureAdapterUrl(env("FORM_AI_CRM_ADAPTER_URL", environment));
  const token = serverToken(env("FORM_AI_CRM_ADAPTER_TOKEN", environment));
  if (!hook || !token) {
    return Response.json({ ok: false, error: "delivery_not_configured" }, { status: 503 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Idempotency-Key": transactionId,
    Authorization: `Bearer ${token}`,
  };
  try {
    const delivered = await fetchImplementation(hook, {
      method: "POST",
      headers,
      body: encoded,
      signal: AbortSignal.timeout(8000),
    });
    if (!delivered.ok) {
      return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
    }
  } catch {
    return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return Response.json(
    { ok: true, transaction_id: transactionId },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
