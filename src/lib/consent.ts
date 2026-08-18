export type ConsentDecision = "granted" | "denied";

export type MeasurementConsent = {
  analytics: boolean;
  adsMeasurement: boolean;
};

export type ConsentModeState = {
  analytics_storage: ConsentDecision;
  ad_storage: ConsentDecision;
  ad_user_data: ConsentDecision;
  ad_personalization: "denied";
};

export const CONSENT_STORAGE_KEY = "bit_measurement_consent_v2";
export const LEGACY_CONSENT_STORAGE_KEY = "bit_cookie_consent_v1";
export const CONSENT_CHANGED_EVENT = "bit:consent-changed";
export const CONSENT_OPEN_EVENT = "bit:consent-open";

const DENIED: MeasurementConsent = Object.freeze({
  analytics: false,
  adsMeasurement: false,
});

function clone(value: MeasurementConsent): MeasurementConsent {
  return { analytics: value.analytics, adsMeasurement: value.adsMeasurement };
}

function parseStoredConsent(value: string | null): MeasurementConsent | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (
      parsed.version === 2 &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.adsMeasurement === "boolean" &&
      Object.keys(parsed).sort().join(",") === "adsMeasurement,analytics,version"
    ) {
      return {
        analytics: parsed.analytics,
        adsMeasurement: parsed.adsMeasurement,
      };
    }
  } catch {
    // A malformed stored choice is handled as an explicit fail-closed denial.
  }
  return clone(DENIED);
}

function persist(value: MeasurementConsent) {
  window.localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      version: 2,
      analytics: value.analytics,
      adsMeasurement: value.adsMeasurement,
    }),
  );
  window.localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY);
}

export function readMeasurementConsent(): MeasurementConsent | null {
  if (typeof window === "undefined") return null;
  const current = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (current !== null) {
    const parsed = parseStoredConsent(current) ?? clone(DENIED);
    if (current !== JSON.stringify({ version: 2, ...parsed })) persist(parsed);
    return parsed;
  }

  const legacy = window.localStorage.getItem(LEGACY_CONSENT_STORAGE_KEY);
  if (legacy !== "granted" && legacy !== "denied") return null;

  // The former choice covered analytics only. It may migrate to analytics,
  // but it can never silently grant Ads conversion/call measurement.
  const migrated = {
    analytics: legacy === "granted",
    adsMeasurement: false,
  };
  persist(migrated);
  return migrated;
}

export function writeMeasurementConsent(value: MeasurementConsent) {
  if (typeof window === "undefined") return;
  const normalized = {
    analytics: value.analytics === true,
    adsMeasurement: value.adsMeasurement === true,
  };
  persist(normalized);
  window.dispatchEvent(
    new CustomEvent<MeasurementConsent>(CONSENT_CHANGED_EVENT, {
      detail: normalized,
    }),
  );
}

export function readAnalyticsConsent(): ConsentDecision | null {
  const consent = readMeasurementConsent();
  return consent ? (consent.analytics ? "granted" : "denied") : null;
}

export function readAdsMeasurementConsent(): ConsentDecision | null {
  const consent = readMeasurementConsent();
  return consent ? (consent.adsMeasurement ? "granted" : "denied") : null;
}

export function buildConsentModeState(consent: MeasurementConsent | null): ConsentModeState {
  return {
    analytics_storage: consent?.analytics ? "granted" : "denied",
    ad_storage: consent?.adsMeasurement ? "granted" : "denied",
    ad_user_data: consent?.adsMeasurement ? "granted" : "denied",
    ad_personalization: "denied",
  };
}

export function openConsentPreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
