import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildConsentModeState,
  CONSENT_STORAGE_KEY,
  LEGACY_CONSENT_STORAGE_KEY,
  readMeasurementConsent,
  writeMeasurementConsent,
} from "../src/lib/consent.ts";
import {
  buildConsultBrowserSuccess,
  parseConsultBrowserSuccess,
} from "../src/lib/consultation-conversion.ts";
import {
  recordCommittedConsultation,
  track,
  trackConsultationFormSubmitOnce,
} from "../src/lib/tracking.ts";

const root = new URL("../", import.meta.url);

class MemoryStorage {
  #items = new Map();

  getItem(key) {
    return this.#items.has(key) ? this.#items.get(key) : null;
  }

  setItem(key, value) {
    this.#items.set(key, String(value));
  }

  removeItem(key) {
    this.#items.delete(key);
  }

  clear() {
    this.#items.clear();
  }
}

function installBrowser() {
  const localStorage = new MemoryStorage();
  globalThis.window = {
    dataLayer: [],
    localStorage,
    dispatchEvent() {
      return true;
    },
  };
  if (typeof globalThis.CustomEvent === "undefined") {
    globalThis.CustomEvent = class CustomEvent {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
      }
    };
  }
  return { localStorage, window: globalThis.window };
}

function storedConsent(analytics, adsMeasurement) {
  return JSON.stringify({ version: 2, analytics, adsMeasurement });
}

test("Consent Mode v2 states are isolated and ad personalization is always denied", () => {
  assert.deepEqual(buildConsentModeState(null), {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  assert.deepEqual(buildConsentModeState({ analytics: true, adsMeasurement: false }), {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  assert.deepEqual(buildConsentModeState({ analytics: false, adsMeasurement: true }), {
    analytics_storage: "denied",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "denied",
  });
  assert.deepEqual(buildConsentModeState({ analytics: true, adsMeasurement: true }), {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "denied",
  });
  assert.equal(
    buildConsentModeState({ analytics: false, adsMeasurement: false }).ad_personalization,
    "denied",
  );
});

test("legacy analytics storage migrates without granting Ads measurement", () => {
  const { localStorage } = installBrowser();
  localStorage.setItem(LEGACY_CONSENT_STORAGE_KEY, "granted");
  assert.deepEqual(readMeasurementConsent(), { analytics: true, adsMeasurement: false });
  assert.equal(localStorage.getItem(LEGACY_CONSENT_STORAGE_KEY), null);
  assert.equal(localStorage.getItem(CONSENT_STORAGE_KEY), storedConsent(true, false));

  localStorage.clear();
  localStorage.setItem(CONSENT_STORAGE_KEY, "not-json");
  localStorage.setItem(LEGACY_CONSENT_STORAGE_KEY, "granted");
  assert.deepEqual(readMeasurementConsent(), { analytics: false, adsMeasurement: false });
  assert.equal(localStorage.getItem(LEGACY_CONSENT_STORAGE_KEY), null);
  assert.equal(localStorage.getItem(CONSENT_STORAGE_KEY), storedConsent(false, false));
});

test("consultation conversion obeys all-denied, analytics-only, ads-only, both, and withdrawal", () => {
  const { window } = installBrowser();
  const transactions = {
    denied: "a".repeat(64),
    analytics: "b".repeat(64),
    ads: "c".repeat(64),
    both: "d".repeat(64),
    withdrawn: "e".repeat(64),
  };

  writeMeasurementConsent({ analytics: false, adsMeasurement: false });
  assert.equal(
    trackConsultationFormSubmitOnce(transactions.denied, { intent: "general", source: "test" }),
    false,
  );
  assert.equal(window.dataLayer.length, 0);

  writeMeasurementConsent({ analytics: false, adsMeasurement: true });
  assert.equal(
    trackConsultationFormSubmitOnce(transactions.denied, { intent: "general", source: "test" }),
    false,
  );
  assert.equal(window.dataLayer.length, 0);

  writeMeasurementConsent({ analytics: true, adsMeasurement: false });
  assert.equal(
    trackConsultationFormSubmitOnce(transactions.analytics, {
      intent: "general",
      source: "test",
    }),
    false,
  );
  assert.equal(track("phone_click", { source: "test" }), false);
  assert.equal(window.dataLayer.length, 0);

  writeMeasurementConsent({ analytics: false, adsMeasurement: true });
  assert.equal(
    trackConsultationFormSubmitOnce(transactions.ads, { intent: "fleet", source: "test" }),
    true,
  );
  assert.equal(track("qualified_form_submit", { intent: "fleet", source: "test" }), false);

  writeMeasurementConsent({ analytics: true, adsMeasurement: true });
  assert.equal(
    trackConsultationFormSubmitOnce(transactions.both, { intent: "dental", source: "test" }),
    true,
  );

  writeMeasurementConsent({ analytics: false, adsMeasurement: false });
  assert.equal(
    trackConsultationFormSubmitOnce(transactions.withdrawn, {
      intent: "general",
      source: "test",
    }),
    false,
  );
  assert.equal(window.dataLayer.length, 2);
  assert.equal(
    window.dataLayer.every((entry) => entry.event === "consultation_form_submit"),
    true,
  );
});

test("successful committed receipt emits once with transaction id; failure and replay emit nothing", () => {
  const { window } = installBrowser();
  writeMeasurementConsent({ analytics: false, adsMeasurement: true });
  const transactionId = "f".repeat(64);
  const committed = buildConsultBrowserSuccess(transactionId, true);

  assert.equal(
    recordCommittedConsultation({ ok: false }, { intent: "fleet", source: "test" }),
    null,
  );
  assert.equal(window.dataLayer.length, 0);

  assert.deepEqual(
    recordCommittedConsultation(committed, { intent: "fleet", source: "test" }),
    committed,
  );
  assert.equal(window.dataLayer.length, 1);
  assert.equal(window.dataLayer[0].event, "consultation_form_submit");
  assert.equal(window.dataLayer[0].transaction_id, transactionId);

  assert.deepEqual(
    recordCommittedConsultation(committed, { intent: "fleet", source: "test" }),
    committed,
  );
  assert.equal(window.dataLayer.length, 1);
});

test("honeypot, invalid input, and CRM unavailable responses emit no primary conversion", () => {
  const { window } = installBrowser();
  writeMeasurementConsent({ analytics: true, adsMeasurement: true });

  const blockedResponses = [
    { ok: true },
    { ok: false, error: "invalid" },
    { ok: false, error: "delivery_not_configured" },
  ];
  for (const response of blockedResponses) {
    assert.equal(
      recordCommittedConsultation(response, { intent: "general", source: "test" }),
      null,
    );
  }

  assert.equal(window.dataLayer.length, 0);
});

test("browser success response is strict and conversion payload excludes PII", () => {
  const { window } = installBrowser();
  writeMeasurementConsent({ analytics: false, adsMeasurement: true });
  const transactionId = "1".repeat(64);
  const success = buildConsultBrowserSuccess(transactionId, false);
  assert.deepEqual(Object.keys(success).sort(), ["ok", "qualified", "transaction_id"]);
  assert.equal(
    parseConsultBrowserSuccess({ ...success, lead_ref: "must-not-reach-browser" }),
    null,
  );

  track("consultation_form_submit", {
    transaction_id: transactionId,
    intent: "general",
    source: "test",
    name: "No Name",
    email: "no@example.test",
    phone: "+1 000 000 0000",
    company: "No Company",
    message: "No message",
  });
  assert.deepEqual(
    Object.keys(window.dataLayer[0]).sort(),
    ["event", "event_time", "intent", "source", "transaction_id"].sort(),
  );
});

test("source binds conversion to strict CRM success and exposes two optional unchecked choices", async () => {
  const [api, form, trackingHooks, cookie, privacy, site] = await Promise.all([
    readFile(new URL("src/routes/api/consult.ts", root), "utf8"),
    readFile(new URL("src/components/site/consult-form.tsx", root), "utf8"),
    readFile(new URL("src/components/site/tracking.tsx", root), "utf8"),
    readFile(new URL("src/components/site/cookie-consent.tsx", root), "utf8"),
    readFile(new URL("src/routes/privacy.tsx", root), "utf8"),
    readFile(new URL("src/lib/site.ts", root), "utf8"),
  ]);

  assert.ok(
    api.lastIndexOf("buildConsultBrowserSuccess") > api.indexOf("receipt.data.idempotency_key"),
  );
  assert.match(
    form,
    /if \(!res\.ok\) throw new Error\("send"\);[\s\S]*recordCommittedConsultation/u,
  );
  assert.match(api, /if \(parsed\.data\.company_website\)[\s\S]*Response\.json\(\{ ok: true \}\)/u);
  assert.match(form, /submissionInFlight\.current/u);
  assert.match(trackingHooks, /buildConsentModeState\(null\)/u);
  assert.doesNotMatch(trackingHooks, /ad_personalization:\s*"granted"/u);
  assert.match(cookie, /Allow analytics cookies/u);
  assert.match(cookie, /Allow Ads conversion and call measurement/u);
  assert.match(cookie, /const \[adsMeasurement, setAdsMeasurement\] = useState\(false\)/u);
  assert.doesNotMatch(cookie, /defaultChecked|checked=\{true\}/u);
  assert.match(privacy, /Analytics and Ads conversion\/call measurement are separate/u);
  assert.match(privacy, /Ads\s+personalization remains denied in every state/u);
  assert.match(site, /phoneDisplay:\s*"\+1 905-867-6574"/u);
});
