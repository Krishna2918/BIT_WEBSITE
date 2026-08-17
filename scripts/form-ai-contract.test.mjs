import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFormAiCrmPayload,
  computeLeadKey,
  computeSpeedToLeadSchedule,
  normalizeCompany,
  normalizeEmail,
  normalizePhone,
} from "../src/lib/form-ai-payload.server.ts";

const STAFFED_WINDOW = {
  weekdays: [1, 2, 3, 4, 5],
  startMinutes: 8 * 60,
  endMinutes: 18 * 60,
};

const CONTACT = {
  name: "Synthetic Person",
  company: "  Synthetic Company  ",
  email: " SYNTHETIC.PERSON@EXAMPLE.TEST ",
  phone: "(416) 555-0123",
};

const COMMON = {
  ...CONTACT,
  message: "Synthetic local-only canary.",
  casl: "yes",
  gclid: "synthetic-click",
  landing_page: "https://example.test/landing",
  referrer: "https://example.test/",
};

test("normalization matches the agreed Website-to-bridge dedupe bytes", () => {
  assert.equal(normalizeEmail(CONTACT.email), "synthetic.person@example.test");
  assert.equal(normalizePhone(CONTACT.phone), "4165550123");
  assert.equal(normalizeCompany(CONTACT.company), "synthetic company");
  assert.equal(normalizeCompany("  Synthetic  Company  "), "synthetic  company");
});

test("Fleet and Dental canaries use the exact nested bridge contract and remain cross-scope isolated", () => {
  const received = new Date("2026-08-17T14:00:00.000Z");
  const fleet = buildFormAiCrmPayload(
    {
      ...COMMON,
      submission_id: "11111111-1111-4111-8111-111111111111",
      intent: "fleet",
      source: "fleet-operations-ontario",
      interest: "Fleet operations — Ontario",
      power_units: 24,
      eld_telematics_provider: "Synthetic ELD",
      dispatch_bottlenecks: "Manual dispatch handoffs",
    },
    received,
    STAFFED_WINDOW,
  );
  const dental = buildFormAiCrmPayload(
    {
      ...COMMON,
      submission_id: "22222222-2222-4222-8222-222222222222",
      intent: "dental",
      source: "dental-it-ontario",
      interest: "Dental IT — Ontario",
      operatory_count: 8,
      practice_software: "Synthetic PMS",
      backup_frequency: "Nightly",
    },
    received,
    STAFFED_WINDOW,
  );

  for (const canary of [fleet, dental]) {
    assert.match(canary.idempotencyKey, /^[a-f0-9]{64}$/);
    assert.equal(canary.body.contract_version, "bitos.form-ai.crm:v1");
    assert.equal(canary.body.operation, "UPSERT_FORM_AI");
    assert.equal(canary.body.idempotency_key, canary.idempotencyKey);
    assert.deepEqual(Object.keys(canary.body).sort(), [
      "contract_version",
      "idempotency_key",
      "lead",
      "operation",
      "submission_fingerprint",
    ]);
    assert.equal(canary.body.lead.category, "FORM_AI");
    assert.equal(canary.body.lead.pinned, true);
    assert.equal(canary.body.lead.priority_order, 0);
    assert.equal(canary.body.lead.consent.captured_at, canary.body.lead.speed_to_lead.received_at);
    assert.equal(canary.body.lead.source.attribution.utm_source, null);
    assert.equal(canary.body.lead.speed_to_lead.response_target_at, "2026-08-17T14:05:00.000Z");
    assert.equal(canary.body.lead.speed_to_lead.response_deadline_at, "2026-08-17T14:15:00.000Z");
    assert.equal("teams" in canary.body, false);
    assert.equal("email" in canary.body, false);
  }

  assert.equal(fleet.body.lead.source.form_source, "fleet-operations-ontario");
  assert.equal(fleet.body.lead.request.qualification.sector, "fleet");
  assert.equal(dental.body.lead.source.form_source, "dental-it-ontario");
  assert.equal(dental.body.lead.request.qualification.sector, "dental");
  assert.notEqual(fleet.body.lead.lead_key, dental.body.lead.lead_key);
  assert.equal(fleet.body.lead.lead_key, computeLeadKey({ intent: "fleet", ...CONTACT }));
});

test("tampered form source is rejected before any bridge call", () => {
  assert.throws(
    () =>
      buildFormAiCrmPayload(
        {
          ...COMMON,
          submission_id: "33333333-3333-4333-8333-333333333333",
          intent: "fleet",
          source: "dental-it-ontario",
          interest: "Fleet operations — Ontario",
          power_units: 5,
          eld_telematics_provider: "Synthetic ELD",
          dispatch_bottlenecks: "Synthetic bottleneck",
        },
        new Date("2026-08-17T14:00:00.000Z"),
        STAFFED_WINDOW,
      ),
    /source does not match intent/,
  );
});

test("campaign interests are fixed while General uses only the approved allowlist", () => {
  const received = new Date("2026-08-17T14:00:00.000Z");
  assert.throws(
    () =>
      buildFormAiCrmPayload(
        {
          ...COMMON,
          submission_id: "44444444-4444-4444-8444-444444444444",
          intent: "fleet",
          source: "fleet-operations-ontario",
          interest: "Dental IT — Ontario",
          power_units: 5,
          eld_telematics_provider: "Synthetic ELD",
          dispatch_bottlenecks: "Synthetic bottleneck",
        },
        received,
        STAFFED_WINDOW,
      ),
    /interest does not match intent/,
  );
  const general = buildFormAiCrmPayload(
    {
      ...COMMON,
      submission_id: "55555555-5555-4555-8555-555555555555",
      intent: "general",
      source: "consult-page",
      interest: "AI",
    },
    received,
    STAFFED_WINDOW,
  );
  assert.equal(general.body.lead.request.interest, "AI");
  assert.throws(
    () =>
      buildFormAiCrmPayload(
        {
          ...COMMON,
          submission_id: "66666666-6666-4666-8666-666666666666",
          intent: "general",
          source: "consult-page",
          interest: "Fleet operations — Ontario",
        },
        received,
        STAFFED_WINDOW,
      ),
    /interest does not match intent/,
  );
});

test("after-hours schedule starts the response clock at the next Toronto staffed opening", () => {
  const schedule = computeSpeedToLeadSchedule(new Date("2026-08-21T22:00:00.000Z"), STAFFED_WINDOW);
  assert.equal(schedule.priority_callback, true);
  assert.equal(schedule.callback_at, "2026-08-24T12:00:00.000Z");
  assert.equal(schedule.response_target_at, "2026-08-24T12:05:00.000Z");
  assert.equal(schedule.response_deadline_at, "2026-08-24T12:15:00.000Z");
});
