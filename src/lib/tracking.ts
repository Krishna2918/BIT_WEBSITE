import { readMeasurementConsent } from "./consent.ts";
import {
  isSafeTransactionId,
  parseConsultBrowserSuccess,
  type ConsultBrowserSuccess,
} from "./consultation-conversion.ts";

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

const ADS_MEASUREMENT_EVENTS = new Set(["consultation_form_submit", "phone_click"]);

const emittedConsultationTransactions = new Set<string>();

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
  const mayPersist = readMeasurementConsent()?.analytics === true;
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
  if (typeof window === "undefined") return false;
  const normalizedEvent = EVENT_ALIASES[event] ?? event;
  const consent = readMeasurementConsent();
  const permitted = ADS_MEASUREMENT_EVENTS.has(normalizedEvent)
    ? consent?.adsMeasurement === true
    : consent?.analytics === true;
  if (!permitted) return false;
  const safe: Record<string, unknown> = {
    event: normalizedEvent,
    event_time: Date.now(),
  };
  for (const [key, value] of Object.entries(payload)) {
    if (/email|phone|message|name|company|q\b|query|content|body/i.test(key)) {
      continue;
    }
    if (typeof value === "string" && value.length > 80) continue;
    safe[key] = value;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(safe);
  return true;
}

export function trackConsultationFormSubmitOnce(
  transactionId: string,
  payload: { intent: string; source: string },
) {
  if (!isSafeTransactionId(transactionId)) return false;
  if (emittedConsultationTransactions.has(transactionId)) return false;
  emittedConsultationTransactions.add(transactionId);
  const emitted = track("consultation_form_submit", {
    intent: payload.intent,
    source: payload.source,
    transaction_id: transactionId,
  });
  return emitted;
}

export function recordCommittedConsultation(
  value: unknown,
  payload: { intent: string; source: string },
): ConsultBrowserSuccess | null {
  const result = parseConsultBrowserSuccess(value);
  if (!result) return null;
  trackConsultationFormSubmitOnce(result.transaction_id, payload);
  return result;
}
