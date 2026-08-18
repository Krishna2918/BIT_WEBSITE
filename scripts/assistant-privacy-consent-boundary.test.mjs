import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

test("Ask AI requires an initially unchecked service-processing consent", async () => {
  const [component, client] = await Promise.all([
    read("src/components/site/ask-ai.tsx"),
    read("src/lib/public-assistant.ts"),
  ]);

  assert.match(component, /const \[assistantConsent, setAssistantConsent\] = useState\(false\)/u);
  assert.match(component, /checked=\{assistantConsent\}/u);
  assert.match(component, /askPublicAssistant\(clean, assistantConsent\)/u);
  assert.match(component, /disabled=\{!assistantConsent \|\| !draft\.trim\(\) \|\| waiting\}/u);
  assert.match(component, /service processing, not marketing consent/u);
  assert.match(client, /if \(consent !== true\) throw new Error\("Public assistant processing consent is required"\)/u);
  assert.match(client, /body: JSON\.stringify\(\{\s*source: "bitsolution-homepage",\s*consent,/u);
  assert.doesNotMatch(client, /source: "bitsolution-homepage",\s*consent: true/u);
});

test("Chatwoot opens separately and never receives the Ask AI transcript", async () => {
  const component = await read("src/components/site/ask-ai.tsx");

  assert.match(component, /Human live chat uses Chatwoot separately/u);
  assert.match(component, /Your Ask AI transcript is not\s+transferred; repeat your question in live chat/u);
  assert.match(component, /openConfiguredChatwoot\(\)/u);
  assert.doesNotMatch(component, /openConfiguredChatwoot\([^)]*(?:msgs|draft|clean|question)/u);
  assert.doesNotMatch(component, /localStorage[\s\S]{0,120}(?:msgs|transcript|chat)/iu);
});

test("free-text and Turnstile disclosures are proximal while contact consents stay separate", async () => {
  const form = await read("src/components/site/consult-form.tsx");
  const warning = /patient or health information, driver files, passwords, access codes,\s*credentials, payment information, private client records, or sensitive security details/u;

  assert.match(form, warning);
  assert.match(form, /Cloudflare Turnstile processes its verification token and the request IP to\s+prevent automated abuse/u);
  assert.match(form, /name="service_inquiry_consent" value="yes" required/u);
  assert.match(form, /name="service_callback_consent" value="yes" required/u);
  assert.match(form, /name="service_update_consent" value="yes"/u);
  assert.match(form, /This is not an automatic call or marketing consent/u);
  assert.match(form, /This is not marketing/u);
});
