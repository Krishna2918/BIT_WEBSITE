import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getChatwootConfig, openConfiguredChatwoot } from "../src/lib/chatwoot.ts";

const valid = {
  VITE_CHATWOOT_ENABLED: "true",
  VITE_CHATWOOT_BASE_URL: "https://livechat.bitsolution.ca",
  VITE_CHATWOOT_SDK_PATH: "/packs/js/sdk.js",
  VITE_CHATWOOT_WEBSITE_TOKEN: "publicWidgetTokenForTest123",
};

test("Chatwoot remains off unless the flag and exact public tuple are valid", async () => {
  assert.equal(await openConfiguredChatwoot({ ...valid, VITE_CHATWOOT_ENABLED: "false" }), false);
  for (const environment of [
    { ...valid, VITE_CHATWOOT_WEBSITE_TOKEN: "" },
    { ...valid, VITE_CHATWOOT_BASE_URL: "https://chat.bitsolution.ca" },
    { ...valid, VITE_CHATWOOT_BASE_URL: "https://livechat.bitsolution.ca.evil.test" },
    { ...valid, VITE_CHATWOOT_SDK_PATH: "/other.js" },
  ]) {
    assert.equal(getChatwootConfig(environment).enabled, false);
  }
  assert.deepEqual(getChatwootConfig(valid), {
    enabled: true,
    baseUrl: "https://livechat.bitsolution.ca",
    sdkUrl: "https://livechat.bitsolution.ca/packs/js/sdk.js",
    websiteToken: valid.VITE_CHATWOOT_WEBSITE_TOKEN,
  });
});

test("tracked defaults contain no Chatwoot token or browser-side AI secret", async () => {
  const template = await readFile(new URL("../.env.example", import.meta.url), "utf8");
  assert.match(template, /^VITE_ASK_AI_ENABLED=false$/mu);
  assert.match(template, /^VITE_CHATWOOT_ENABLED=false$/mu);
  assert.match(template, /^VITE_CHATWOOT_WEBSITE_TOKEN=$/mu);
  assert.match(template, /^BIT_PUBLIC_AI_ENABLED=false$/mu);
  assert.match(template, /^BIT_PUBLIC_AI_MODEL=openai\/gpt-5\.6-luna$/mu);
  assert.match(template, /^AI_GATEWAY_API_KEY=$/mu);
  assert.doesNotMatch(template, /^VITE_.*(?:SECRET|API_KEY)=.+$/mu);
});

test("Ask AI has no local fabricated answer engine and its disabled fallback is honest", async () => {
  const component = await readFile(
    new URL("../src/components/site/ask-ai.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(component, /function replyFor|BIT AI is typing|Online ·/u);
  assert.match(component, /Live AI is not active here yet/u);
  assert.match(component, /No AI answer was\s+generated/u);
  assert.match(component, /openConfiguredChatwoot/u);
});
