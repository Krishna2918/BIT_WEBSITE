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
