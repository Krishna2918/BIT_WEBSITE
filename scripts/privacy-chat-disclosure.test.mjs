import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const privacy = await readFile(
  new URL("../src/routes/privacy.tsx", import.meta.url),
  "utf8",
);

test("privacy notice discloses consent-gated AI processing and separate human handoff", () => {
  assert.match(privacy, /Ask AI and human live chat/u);
  assert.match(privacy, /off until you affirm its separate service-processing consent/u);
  assert.match(privacy, /server FAQ service processes the submitted chat text and limited\s+technical routing information/u);
  assert.match(privacy, /Vercel AI Gateway and\s+OpenAI/u);
  assert.match(privacy, /Human live chat is a separate Chatwoot service/u);
  assert.match(privacy, /Ask AI transcript is not transferred to Chatwoot/u);
  assert.match(privacy, /review and reply only to the\s+information you submit in that separate live-chat conversation/u);
  assert.match(privacy, /not\s+reused for marketing/u);
  assert.match(privacy, /patient or\s+health information, driver files, passwords, access codes, credentials, payment\s+information, private client records, or sensitive security details/u);
});

test("provider retention and cross-border review remain held without unsupported model-use claims", () => {
  assert.match(privacy, /provider retention rules, plus provider\s+and cross-border processing review, remain unresolved authoritative Privacy and Legal\s+gates/u);
  assert.match(privacy, /Production activation remains on hold/u);
  const disclosure = privacy.split("Ask AI and human live chat", 2)[1]?.split("Automated-abuse prevention", 1)[0] ?? "";
  assert.doesNotMatch(disclosure, /\b(?:days?|months?|years?)\b/iu);
  assert.doesNotMatch(disclosure, /\btrain(?:ed|ing)?\b|improve (?:the )?model|model development/iu);
});

test("privacy notice identifies Turnstile token and request IP processing", () => {
  assert.match(
    privacy,
    /Cloudflare Turnstile processes the\s+verification token and request IP to prevent automated abuse/u,
  );
});
