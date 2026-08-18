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

test("owner-attested privacy approval is recorded without claiming independent advice", () => {
  assert.match(privacy, /OWNER_ATTESTED_PRIVACY_LEGAL_APPROVED/u);
  assert.match(privacy, /owner has attested that the Privacy and Legal terms for this launch are\s+approved/u);
  assert.match(privacy, /does not claim or document independent\s+legal advice or a named reviewer opinion/u);
  const disclosure = privacy.split("Ask AI and human live chat", 2)[1]?.split("Automated-abuse prevention", 1)[0] ?? "";
  assert.doesNotMatch(disclosure, /\btrain(?:ed|ing)?\b|improve (?:the )?model|model development/iu);
  assert.doesNotMatch(privacy, /not yet authorized for publication|Production (?:activation|processing) remains on hold/u);
  assert.match(privacy, /no more than 30 days/u);
  assert.match(privacy, /no more than 24 months after the last activity/u);
  assert.match(privacy, /retained for 24 months\s+after withdrawal/u);
  assert.match(privacy, /Raw analytics\s+identifiers are retained for no more than 14 months/u);
  assert.match(privacy, /legal hold may override scheduled deletion/u);
  assert.match(privacy, /Call recording is off/u);
  assert.match(privacy, /Processing may occur outside Canada/u);
});

test("privacy notice identifies Turnstile token and request IP processing", () => {
  assert.match(
    privacy,
    /Cloudflare Turnstile processes the\s+verification token and request IP to prevent automated abuse/u,
  );
});
