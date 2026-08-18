import assert from "node:assert/strict";
import test from "node:test";
import {
  handlePublicAssistantRequest,
  PUBLIC_AI_MODEL,
  PUBLIC_AI_RATE_LIMIT_MAX_REQUESTS,
} from "../src/lib/public-assistant.server.ts";

const enabledEnvironment = {
  BIT_PUBLIC_AI_ENABLED: "true",
  BIT_PUBLIC_AI_MODEL: PUBLIC_AI_MODEL,
  BIT_PUBLIC_AI_FIREWALL_RATE_LIMIT_CONFIRMED: "true",
  AI_GATEWAY_API_KEY: "test-only-placeholder",
};

function request(message, headers = {}) {
  const requestHeaders = new Headers({
    "Content-Type": "application/json",
    Origin: "https://www.bitsolution.ca",
    "Sec-Fetch-Site": "same-origin",
    "X-Vercel-Forwarded-For": "203.0.113.10",
    ...headers,
  });
  return new Request("https://www.bitsolution.ca/api/assistant", {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({ source: "bitsolution-homepage", consent: true, message }),
  });
}

async function read(response) {
  return { status: response.status, body: await response.json() };
}

test("server AI is default-off and performs no dependency call", async () => {
  let called = false;
  const response = await handlePublicAssistantRequest(request("What services do you offer?"), {
    environment: {},
    fetchImplementation: async () => {
      called = true;
      throw new Error("must not run");
    },
    generateImplementation: async () => {
      called = true;
      throw new Error("must not run");
    },
  });
  assert.equal(called, false);
  assert.deepEqual(await read(response), {
    status: 503,
    body: { status: "handoff", answer: "Live AI is not configured. Please use human support." },
  });
});

test("verified FAQ grounding precedes exact Luna Gateway decision", async () => {
  let faqRequest;
  let modelRequest;
  const response = await handlePublicAssistantRequest(request("What services do you offer?"), {
    environment: enabledEnvironment,
    fetchImplementation: async (input, init) => {
      faqRequest = { input, init };
      return new Response(JSON.stringify({ status: "answer", answer: "Verified FAQ answer." }));
    },
    generateImplementation: async (input) => {
      modelRequest = input;
      return "ANSWER";
    },
  });
  assert.equal(faqRequest.input, "https://livechat.bitsolution.ca/v1/public/assistant");
  assert.equal(faqRequest.init.headers.Origin, "https://bitsolution.ca");
  assert.notEqual(faqRequest.init.headers.Origin, request("ignored").headers.get("origin"));
  assert.equal(modelRequest.model, "openai/gpt-5.6-luna");
  assert.equal(modelRequest.maxOutputTokens, 8);
  assert.equal(modelRequest.maxRetries, 0);
  assert.deepEqual(await read(response), {
    status: 200,
    body: { status: "answer", mode: "ai", answer: "Verified FAQ answer." },
  });
});

test("contact, secret, human, and cross-origin inputs fail to handoff without upstream work", async () => {
  let called = false;
  const deps = {
    environment: enabledEnvironment,
    fetchImplementation: async () => {
      called = true;
      throw new Error("must not run");
    },
    generateImplementation: async () => {
      called = true;
      throw new Error("must not run");
    },
  };
  for (const message of [
    "Email me at jane@example.com",
    "My password is secret",
    "Open https://example.com/private",
    "I want to speak with a human",
  ]) {
    const response = await handlePublicAssistantRequest(request(message), deps);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, "handoff");
  }
  const crossOrigin = request("Hello", { Origin: "https://evil.example", "Sec-Fetch-Site": "cross-site" });
  assert.equal((await handlePublicAssistantRequest(crossOrigin, deps)).status, 403);
  assert.equal(called, false);
});

test("model prose cannot reach the browser and Gateway failure uses honest FAQ mode", async () => {
  const dependencies = {
    environment: enabledEnvironment,
    fetchImplementation: async () =>
      new Response(JSON.stringify({ status: "answer", answer: "Verified FAQ answer." })),
  };
  const ungrounded = await handlePublicAssistantRequest(
    request("What services do you offer?", { "X-Vercel-Forwarded-For": "203.0.113.21" }),
    { ...dependencies, generateImplementation: async () => "Invented price and guarantee." },
  );
  const failed = await handlePublicAssistantRequest(
    request("What services do you offer?", { "X-Vercel-Forwarded-For": "203.0.113.22" }),
    { ...dependencies, generateImplementation: async () => { throw new Error("down"); } },
  );
  assert.equal((await ungrounded.json()).status, "handoff");
  assert.deepEqual(await failed.json(), {
    status: "answer",
    mode: "faq",
    answer: "Verified FAQ answer.",
  });
});

test("bounded application rate limit blocks excess upstream work", async () => {
  let fetched = 0;
  const dependencies = {
    environment: enabledEnvironment,
    fetchImplementation: async () => {
      fetched += 1;
      return new Response(JSON.stringify({ status: "handoff", answer: "Use human support." }));
    },
  };
  for (let index = 0; index < PUBLIC_AI_RATE_LIMIT_MAX_REQUESTS; index += 1) {
    const response = await handlePublicAssistantRequest(
      request(`Question ${index}`, { "X-Vercel-Forwarded-For": "203.0.113.50" }),
      dependencies,
    );
    assert.equal(response.status, 200);
  }
  const limited = await handlePublicAssistantRequest(
    request("One more question", { "X-Vercel-Forwarded-For": "203.0.113.50" }),
    dependencies,
  );
  assert.equal(fetched, PUBLIC_AI_RATE_LIMIT_MAX_REQUESTS);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "60");
});
