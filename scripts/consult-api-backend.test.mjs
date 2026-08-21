import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  consultMethodNotAllowed,
  consultTransactionId,
  handleConsultPost,
} from "../src/lib/consult-api.server.ts";

const valid = {
  name: "Synthetic Person",
  company: "Synthetic Company",
  email: "synthetic.person@example.test",
  phone: "4165550123",
  interest: "Fleet operations — Ontario",
  message: "Synthetic local-only canary.",
  casl: "yes",
  measure: "yes",
  intent: "fleet",
  source: "fleet-operations-ontario",
};

function request(body) {
  return new Request("https://bitsolution.ca/api/consult", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("consult GET is JSON 405 with Allow POST", async () => {
  const response = consultMethodNotAllowed();
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
  assert.match(response.headers.get("content-type"), /application\/json/u);
  assert.deepEqual(await response.json(), { ok: false, error: "method_not_allowed" });
});

test("consult POST rejects conversation, Turnstile leakage, and extra fields", async () => {
  for (const extra of [
    { conversation: "Ask AI transcript" },
    { "cf-turnstile-response": "leaked" },
    { turnstile_token: "fake" },
    { client_status: "new" },
  ]) {
    const response = await handleConsultPost(request({ ...valid, ...extra }), {});
    assert.equal(response.status, 400, JSON.stringify(extra));
    assert.deepEqual(await response.json(), { ok: false, error: "invalid" });
  }
});

test("consult POST returns a stable 64-hex transaction id without sending mail", async () => {
  const response = await handleConsultPost(request(valid), {}, async () => {
    throw new Error("must not fetch when CRM is unbound");
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.match(body.transaction_id, /^[a-f0-9]{64}$/u);
  assert.equal(
    body.transaction_id,
    consultTransactionId(valid),
  );
  assert.equal(
    body.transaction_id,
    createHash("sha256")
      .update(
        "consult|synthetic.person@example.test|4165550123|synthetic company|Fleet operations — Ontario|Synthetic local-only canary.|fleet|fleet-operations-ontario",
        "utf8",
      )
      .digest("hex"),
  );
});

test("Fleet and Dental get different ids; exact duplicate replay is the same id", async () => {
  const fleet = await (await handleConsultPost(request(valid), {})).json();
  const replay = await (await handleConsultPost(request(valid), {})).json();
  const dental = await (
    await handleConsultPost(
      request({
        ...valid,
        interest: "Dental IT — Ontario",
        intent: "dental",
        source: "dental-it-ontario",
      }),
      {},
    )
  ).json();
  assert.equal(fleet.transaction_id, replay.transaction_id);
  assert.notEqual(fleet.transaction_id, dental.transaction_id);
});

test("bound CRM is HTTPS-only, strips measurement cookies, and uses Idempotency-Key", async () => {
  assert.equal(
    (
      await handleConsultPost(request(valid), {
        CONSULT_WEBHOOK_URL: "http://crm.example/intake",
      })
    ).status,
    503,
  );

  const calls = [];
  const ok = await handleConsultPost(
    request(valid),
    {
      FORM_AI_CRM_ADAPTER_URL: "https://crm.example.test/v1/form-ai/intake",
      FORM_AI_CRM_ADAPTER_TOKEN: "synthetic-crm-adapter-token",
    },
    async (url, init = {}) => {
      calls.push({ url: String(url), init });
      return new Response("{}", { status: 200 });
    },
  );
  assert.equal(ok.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.headers["Idempotency-Key"].length, 64);
  assert.equal(calls[0].init.headers.Authorization, "Bearer synthetic-crm-adapter-token");
  const payload = JSON.parse(calls[0].init.body);
  assert.equal("measure" in payload, false);
  assert.equal("casl" in payload, false);
  assert.equal("conversation" in payload, false);
  assert.equal("turnstile_token" in payload, false);
  assert.equal(payload.interest, "Fleet operations — Ontario");
  assert.match(payload.transaction_id, /^[a-f0-9]{64}$/u);
  assert.equal(payload.idempotency_key, payload.transaction_id);
});
