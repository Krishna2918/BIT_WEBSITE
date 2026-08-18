import { readAnalyticsConsent } from "@/lib/consent";

const KEYS = [
  "gclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "msclkid",
  "fbclid",
] as const;

export type Attribution = Record<(typeof KEYS)[number], string> & {
  landing_page: string;
  referrer: string;
};

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function captureAttribution(): Attribution {
  const empty = Object.fromEntries(KEYS.map((k) => [k, ""])) as Record<
    (typeof KEYS)[number],
    string
  >;
  if (typeof window === "undefined") {
    return { ...empty, landing_page: "", referrer: "" };
  }
  const params = new URLSearchParams(window.location.search);
  const mayPersist = readAnalyticsConsent() === "granted";
  let stored: Partial<Attribution> = {};
  if (mayPersist) {
    try {
      stored = JSON.parse(sessionStorage.getItem("bit_attr") || "{}") as Partial<Attribution>;
    } catch {
      stored = {};
    }
  }
  const next: Attribution = {
    ...empty,
    landing_page: stored.landing_page || window.location.pathname,
    referrer: stored.referrer || document.referrer || "",
  };
  for (const key of KEYS) {
    next[key] = params.get(key) || stored[key] || "";
  }
  if (mayPersist) sessionStorage.setItem("bit_attr", JSON.stringify(next));
  return next;
}

const EVENT_ALIASES: Record<string, string> = {
  book_consult_click: "consultation_cta_click",
  consult_submit: "consultation_form_submit",
  click_to_call: "phone_click",
  ticket_click: "support_ticket_click",
  checklist_download: "resource_download",
};

export function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (readAnalyticsConsent() !== "granted") return;
  const safe: Record<string, unknown> = {
    event: EVENT_ALIASES[event] ?? event,
    event_time: Date.now(),
  };
  for (const [key, value] of Object.entries(payload)) {
    if (
      /email|phone|message|name|company|q\b|query|content|body/i.test(key)
    ) {
      continue;
    }
    if (typeof value === "string" && value.length > 80) continue;
    safe[key] = value;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(safe);
}
