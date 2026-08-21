import { TRACKING } from "@/lib/site";

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
  let stored: Partial<Attribution> = {};
  try {
    stored = JSON.parse(sessionStorage.getItem("bit_attr") || "{}") as Partial<Attribution>;
  } catch {
    stored = {};
  }
  const next: Attribution = {
    ...empty,
    landing_page: stored.landing_page || window.location.pathname,
    referrer: stored.referrer || document.referrer || "",
  };
  for (const key of KEYS) {
    next[key] = params.get(key) || stored[key] || "";
  }
  sessionStorage.setItem("bit_attr", JSON.stringify(next));
  return next;
}

export function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const safe: Record<string, unknown> = { event, event_time: Date.now() };
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

const MEASURE_KEY = "bit_measure";
const CONV_KEY = "bit_conv_fired";

export function hasMeasurementConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(MEASURE_KEY) === "1") return true;
  } catch {
    /* private mode */
  }
  return document.cookie.split(";").some((part) => part.trim() === `${MEASURE_KEY}=1`);
}

export function setMeasurementConsent(on: boolean) {
  if (typeof window === "undefined") return;
  const value = on ? "1" : "0";
  const maxAge = on ? 31536000 : 0;
  document.cookie = `${MEASURE_KEY}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  try {
    localStorage.setItem(MEASURE_KEY, value);
  } catch {
    /* private mode */
  }
}

export function fireConsultConversion(payload: { intent?: string } = {}) {
  if (typeof window === "undefined") return;
  if (!hasMeasurementConsent()) return;
  try {
    if (sessionStorage.getItem(CONV_KEY) === "1") return;
    sessionStorage.setItem(CONV_KEY, "1");
  } catch {
    /* still fire once this load */
  }
  track("consult_complete", { intent: payload.intent || "", source: "thank-you" });
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { ad_storage: "granted", analytics_storage: "granted" });
  const ads = TRACKING.adsId;
  if (!ads || !TRACKING.measurementOn) return;
  const sendTo = TRACKING.adsLabel ? `${ads}/${TRACKING.adsLabel}` : ads;
  window.gtag("event", "conversion", { send_to: sendTo });
}
