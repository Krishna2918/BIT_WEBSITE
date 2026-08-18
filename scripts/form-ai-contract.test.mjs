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
import {
  CONSULT_SERVICE_DISPLAY_LABELS,
  resolveConsultRouting,
} from "../src/lib/consult-contract.ts";

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
  services: ["Hardware & connected devices"],
  website_review_consent: false,
  preferred_contact_time: "Morning",
  preferred_reply: "Email",
  service_inquiry_consent: true,
  service_callback_consent: true,
  service_update_consent: false,
  marketing_consent: false,
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
    assert.equal(canary.body.contract_version, "bitos.form-ai.crm:v2");
    assert.equal(canary.body.operation, "UPSERT_GOOGLE_LEADS_AI_SERVICE_INTAKE");
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
    assert.deepEqual(Object.keys(canary.body.lead).sort(), [
      "category",
      "consent",
      "contact",
      "lead_key",
      "pinned",
      "priority_order",
      "request",
      "source",
      "speed_to_lead",
    ]);
    assert.deepEqual(Object.keys(canary.body.lead.request).sort(), [
      "interest",
      "preferred_contact",
      "public_site_review",
      "qualification",
      "services",
      "summary",
    ]);
    assert.equal(
      canary.body.lead.consent.service_inquiry.captured_at,
      canary.body.lead.speed_to_lead.received_at,
    );
    assert.equal(canary.body.lead.consent.service_inquiry.granted, true);
    assert.equal(canary.body.lead.consent.service_callback.granted, true);
    assert.equal(
      canary.body.lead.consent.service_callback.purpose,
      "Service consultation callback and coordination only",
    );
    assert.equal(canary.body.lead.consent.service_updates.email, false);
    assert.equal(canary.body.lead.consent.marketing.granted, false);
    assert.deepEqual(canary.body.lead.request.services, ["Hardware & connected devices"]);
    assert.equal(CONSULT_SERVICE_DISPLAY_LABELS[canary.body.lead.request.services[0]], "Hardware/Connected Devices");
    assert.equal(canary.body.lead.request.preferred_contact.channel, "email");
    assert.equal(canary.body.lead.request.preferred_contact.time_window, "weekday_morning");
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

test("campaign and General interests stay fixed while services carry the multi-select", () => {
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
      interest: "General consultation",
      services: ["AI workflows"],
    },
    received,
    STAFFED_WINDOW,
  );
  assert.equal(general.body.lead.request.interest, "General consultation");
  assert.deepEqual(general.body.lead.request.services, ["AI workflows"]);
  assert.equal(resolveConsultRouting(["AI workflows"]).accountable_owner_key, "consultant");
  assert.throws(
    () =>
      buildFormAiCrmPayload(
        {
          ...COMMON,
          submission_id: "66666666-6666-4666-8666-666666666666",
          intent: "general",
          source: "consult-page",
          interest: "AI",
        },
        received,
        STAFFED_WINDOW,
      ),
    /interest does not match intent/,
  );
});

test("service routing is deterministic and mixed work creates Consultant collaboration", () => {
  const received = new Date("2026-08-17T14:00:00.000Z");
  const software = buildFormAiCrmPayload(
    {
      ...COMMON,
      submission_id: "77777777-7777-4777-8777-777777777777",
      intent: "general",
      source: "consult-page",
      interest: "General consultation",
      services: ["Custom software", "AI workflows"],
      service_update_consent: true,
    },
    received,
    STAFFED_WINDOW,
  );
  assert.equal(software.body.lead.request.services[0], "Custom software");
  assert.equal(software.body.lead.consent.service_updates.email, true);

  const mixed = buildFormAiCrmPayload(
    {
      ...COMMON,
      submission_id: "88888888-8888-4888-8888-888888888888",
      intent: "general",
      source: "consult-page",
      interest: "General consultation",
      services: ["Cybersecurity", "Custom software"],
    },
    received,
    STAFFED_WINDOW,
  );
  assert.deepEqual(mixed.body.lead.request.services, ["Custom software", "Cybersecurity"]);
  assert.equal(
    resolveConsultRouting(["Cybersecurity", "Custom software"]).route_reason,
    "mixed_services",
  );
});

test("unknown or duplicate services reject and a URL never implies review consent", () => {
  const received = new Date("2026-08-17T14:00:00.000Z");
  const base = {
    ...COMMON,
    submission_id: "99999999-9999-4999-8999-999999999999",
    intent: "general",
    source: "consult-page",
    interest: "General consultation",
  };
  assert.throws(
    () =>
      buildFormAiCrmPayload(
        { ...base, services: ["AI workflows", "AI workflows"] },
        received,
        STAFFED_WINDOW,
      ),
    /duplicate service selection/,
  );
  assert.throws(
    () =>
      buildFormAiCrmPayload({ ...base, services: ["Unknown service"] }, received, STAFFED_WINDOW),
    /unknown service selection/,
  );
  assert.throws(
    () =>
      buildFormAiCrmPayload(
        { ...base, website_url: "https://example.test/public", website_review_consent: false },
        received,
        STAFFED_WINDOW,
      ),
    /public website URL requires review consent/,
  );
  const reviewed = buildFormAiCrmPayload(
    { ...base, website_url: "https://client.example/public", website_review_consent: true },
    received,
    STAFFED_WINDOW,
  );
  assert.deepEqual(Object.keys(reviewed.body.lead.request.public_site_review).sort(), [
    "consent",
    "note",
    "public_url",
  ]);
  assert.equal(
    reviewed.body.lead.request.public_site_review.public_url,
    "https://client.example/public",
  );
  assert.equal(JSON.stringify(reviewed.body.lead).split("https://client.example/public").length - 1, 1);
  assert.throws(
    () =>
      buildFormAiCrmPayload({ ...base, website_review_consent: true }, received, STAFFED_WINDOW),
    /requires a public URL/,
  );
  for (const url of [
    "http://localhost/path",
    "https://portal.local/path",
    "https://service.internal/path",
    "https://office.lan/path",
    "https://router.home/path",
    "https://intranet/path",
    "http://127.0.0.1/path",
    "http://10.12.0.4/path",
    "http://100.64.0.1/path",
    "http://172.16.4.2/path",
    "http://192.168.1.4/path",
    "http://169.254.10.2/path",
    "http://192.0.2.1/path",
    "http://198.51.100.1/path",
    "http://203.0.113.1/path",
    "http://224.0.0.1/path",
    "http://255.255.255.255/path",
    "http://[::1]/path",
    "http://[fe80::1]/path",
    "http://[fd00::1]/path",
    "http://[::ffff:127.0.0.1]/path",
  ]) {
    assert.throws(
      () =>
        buildFormAiCrmPayload(
          { ...base, website_url: url, website_review_consent: true },
          received,
          STAFFED_WINDOW,
        ),
      /website URL is invalid/,
      url,
    );
  }
});

test("after-hours schedule starts the response clock at the next Toronto staffed opening", () => {
  const schedule = computeSpeedToLeadSchedule(new Date("2026-08-21T22:00:00.000Z"), STAFFED_WINDOW);
  assert.equal(schedule.priority_callback, true);
  assert.equal(schedule.callback_at, "2026-08-24T12:00:00.000Z");
  assert.equal(schedule.response_target_at, "2026-08-24T12:05:00.000Z");
  assert.equal(schedule.response_deadline_at, "2026-08-24T12:15:00.000Z");
});
