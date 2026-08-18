import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  GTM_SCRIPT_ID,
  initializeGtag,
  syncGtmScript,
} from "../src/lib/gtm-script.ts";
import { writeMeasurementConsent } from "../src/lib/consent.ts";
import { trackConsultationFormSubmitOnce } from "../src/lib/tracking.ts";

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
}

class FakeDocument {
  scripts = [];
  head = {
    appendChild: (element) => {
      this.scripts.push(element);
      return element;
    },
  };
  createElement(tagName) {
    const documentRef = this;
    return {
      tagName,
      dataset: {},
      id: "",
      src: "",
      async: false,
      remove() {
        documentRef.scripts = documentRef.scripts.filter((item) => item !== this);
      },
    };
  }
  getElementById(id) {
    return this.scripts.find((item) => item.id === id) ?? null;
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
  return globalThis.window;
}

test("GTM external script follows consent, loads once, and is removed on withdrawal", () => {
  const documentRef = new FakeDocument();
  const containerId = "GTM-K8S8QCQJ";

  assert.equal(syncGtmScript(documentRef, false, containerId), false);
  assert.equal(documentRef.scripts.length, 0);

  assert.equal(syncGtmScript(documentRef, true, containerId), true);
  assert.equal(syncGtmScript(documentRef, true, containerId), true);
  assert.equal(documentRef.scripts.length, 1);
  assert.equal(documentRef.scripts[0].id, GTM_SCRIPT_ID);
  assert.equal(documentRef.scripts[0].dataset.bitGtm, "true");
  assert.equal(documentRef.scripts[0].async, true);
  assert.equal(
    documentRef.scripts[0].src,
    "https://www.googletagmanager.com/gtm.js?id=GTM-K8S8QCQJ",
  );

  assert.equal(syncGtmScript(documentRef, false, containerId), false);
  assert.equal(documentRef.scripts.length, 0);
  assert.equal(syncGtmScript(documentRef, true, containerId), true);
  assert.equal(documentRef.scripts.length, 1);
});

test("gtag fallback queues canonical command arguments before the loader exists", () => {
  const windowRef = { dataLayer: [] };
  const gtag = initializeGtag(windowRef);
  const denied = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
  gtag("consent", "default", denied);
  assert.equal(windowRef.dataLayer.length, 1);
  assert.equal(Object.prototype.toString.call(windowRef.dataLayer[0]), "[object Arguments]");
  assert.deepEqual(Array.from(windowRef.dataLayer[0]), ["consent", "default", denied]);

  assert.equal(initializeGtag(windowRef), gtag);
  gtag("consent", "update", { ...denied, ad_storage: "granted", ad_user_data: "granted" });
  assert.equal(windowRef.dataLayer.length, 2);
  assert.deepEqual(Array.from(windowRef.dataLayer[1]).slice(0, 2), ["consent", "update"]);
});

test("analytics-only never authorizes the Ads consultation conversion", () => {
  const window = installBrowser();
  writeMeasurementConsent({ analytics: true, adsMeasurement: false });
  assert.equal(
    trackConsultationFormSubmitOnce("9".repeat(64), {
      intent: "general",
      source: "gtm-live-behavior-test",
    }),
    false,
  );
  assert.equal(window.dataLayer.length, 0);

  writeMeasurementConsent({ analytics: false, adsMeasurement: true });
  assert.equal(
    trackConsultationFormSubmitOnce("8".repeat(64), {
      intent: "general",
      source: "gtm-live-behavior-test",
    }),
    true,
  );
  assert.equal(window.dataLayer.length, 1);
  assert.equal(window.dataLayer[0].event, "consultation_form_submit");
});

test("TrackingHooks imperatively loads GTM only after measurement consent", async () => {
  const source = await readFile(new URL("src/components/site/tracking.tsx", root), "utf8");
  assert.match(source, /TRACKING\.measurementOn && \(analyticsAllowed \|\| adsMeasurementAllowed\)/u);
  assert.match(source, /syncGtmScript\(document, mayLoadMeasurement, TRACKING\.gtmId\)/u);
  assert.match(source, /initializeGtag\(window\)/u);
  assert.match(source, /window\.gtag\?\.\("consent", "default"/u);
  assert.match(source, /window\.gtag\?\.\("consent", "update"/u);
  assert.doesNotMatch(source, /gtm\.start|ns\.html|dangerouslySetInnerHTML[\s\S]*gtm\.js/u);
});

test("CSP contains only the bounded GTM and Google Ads measurement hosts", async () => {
  const config = JSON.parse(await readFile(new URL("vercel.json", root), "utf8"));
  const csp = config.headers[0].headers.find(
    (header) => header.key === "Content-Security-Policy",
  ).value;
  for (const host of [
    "https://www.googletagmanager.com",
    "https://www.googleadservices.com",
    "https://www.google.com",
    "https://google.com",
    "https://pagead2.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
    "https://ad.doubleclick.net",
  ]) {
    assert.match(csp, new RegExp(host.replaceAll(".", "\\.")));
  }
  assert.doesNotMatch(csp, /\*\.google|google-analytics\.com|clarity\.ms|gstatic\.com/u);
});
