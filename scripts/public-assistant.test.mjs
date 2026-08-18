import assert from "node:assert/strict";
import test from "node:test";
import {
  askPublicAssistant,
  getPublicAssistantConfig,
  wantsHumanSupport,
} from "../src/lib/public-assistant.ts";

test("public Ask AI is default-off and uses only the same-origin route when enabled", () => {
  assert.equal(getPublicAssistantConfig({}).enabled, false);
  assert.deepEqual(getPublicAssistantConfig({ VITE_ASK_AI_ENABLED: "true" }), {
    enabled: true,
    endpoint: "/api/assistant",
  });
});

test("browser request sends only the strict public payload", async () => {
  let observed;
  const result = await askPublicAssistant(
    "  What services do you offer?  ",
    { VITE_ASK_AI_ENABLED: "true" },
    async (input, init) => {
      observed = { input, init };
      return new Response(JSON.stringify({ status: "answer", mode: "ai", answer: "Verified." }));
    },
  );
  assert.equal(observed.input, "/api/assistant");
  assert.equal(observed.init.credentials, "omit");
  assert.deepEqual(JSON.parse(observed.init.body), {
    source: "bitsolution-homepage",
    consent: true,
    message: "What services do you offer?",
  });
  assert.deepEqual(result, { kind: "answer", mode: "ai", text: "Verified." });
});

test("browser accepts grounded FAQ fallback and human handoff only", async () => {
  const faq = await askPublicAssistant(
    "question",
    { VITE_ASK_AI_ENABLED: "true" },
    async () =>
      new Response(JSON.stringify({ status: "answer", mode: "faq", answer: "FAQ answer." })),
  );
  const handoff = await askPublicAssistant(
    "question",
    { VITE_ASK_AI_ENABLED: "true" },
    async () => new Response(JSON.stringify({ status: "handoff", answer: "Use a person." })),
  );
  assert.deepEqual(faq, { kind: "answer", mode: "faq", text: "FAQ answer." });
  assert.deepEqual(handoff, { kind: "handoff", text: "Use a person." });
});

test("human-support language is detected before the AI request", () => {
  assert.equal(wantsHumanSupport("Can I speak with a human?"), true);
  assert.equal(wantsHumanSupport("What services do you offer?"), false);
});
