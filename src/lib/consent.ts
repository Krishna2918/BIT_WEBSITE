export type AnalyticsConsent = "granted" | "denied" | null;

export const CONSENT_STORAGE_KEY = "bit_cookie_consent_v1";
export const CONSENT_CHANGED_EVENT = "bit:consent-changed";
export const CONSENT_OPEN_EVENT = "bit:consent-open";

export function readAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function writeAnalyticsConsent(value: Exclude<AnalyticsConsent, null>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(
    new CustomEvent<Exclude<AnalyticsConsent, null>>(CONSENT_CHANGED_EVENT, {
      detail: value,
    }),
  );
}

export function openConsentPreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

