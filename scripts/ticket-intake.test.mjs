import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildWhatsappTicketHref,
  isSafeWhatsappHref,
  TicketIntakeSchema,
  ticketIngestUrl,
  ticketPayload,
  ticketWorkId,
} from "../src/lib/ticket-intake.ts";
import { deliverTicketIntake, handleTicketRequest } from "../src/lib/ticket-intake.server.ts";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const VALID = {
  company: "Acme Yard",
  email: "it@acme.example",
  name: "Pat",
  hostname: "YARD-PC01",
  impact: "whole-office",
  message: "The dispatch PC will not boot.",
  source: "website-ticket",
};

test("ticket schema requires company, work email, and what is broken", () => {
  assert.equal(TicketIntakeSchema.safeParse(VALID).success, true);
  assert.equal(TicketIntakeSchema.safeParse({ ...VALID, company: "" }).success, false);
  assert.equal(TicketIntakeSchema.safeParse({ ...VALID, email: "not-an-email" }).success, false);
  assert.equal(TicketIntakeSchema.safeParse({ ...VALID, message: "" }).success, false);
  assert.equal(TicketIntakeSchema.safeParse({ ...VALID, phone: "9058676574" }).success, false);
  assert.equal(
    TicketIntakeSchema.safeParse({
      company: VALID.company,
      email: VALID.email,
      message: VALID.message,
      source: "website-ticket",
    }).success,
    true,
  );
});

test("ingest URL is https only and posts /inbound/ticket", () => {
  assert.equal(ticketIngestUrl(undefined), undefined);
  assert.equal(ticketIngestUrl("http://operator.example/inbound/ticket"), undefined);
  assert.equal(
    ticketIngestUrl("https://user:secret@operator.example/inbound/ticket"),
    undefined,
  );
  assert.equal(
    ticketIngestUrl("https://operator.example"),
    "https://operator.example/inbound/ticket",
  );
  assert.equal(
    ticketIngestUrl("https://operator.example/inbound/ticket"),
    "https://operator.example/inbound/ticket",
  );
});

test("WhatsApp fallback carries the filled ticket text and never a secret URL", () => {
  const href = buildWhatsappTicketHref(TicketIntakeSchema.parse(VALID));
  assert.equal(isSafeWhatsappHref(href), true);
  const text = decodeURIComponent(new URL(href).searchParams.get("text") || "");
  assert.match(text, /Company: Acme Yard/);
  assert.match(text, /Work email: it@acme.example/);
  assert.match(text, /PC: YARD-PC01/);
  assert.match(text, /Impact: Whole office/);
  assert.match(text, /The dispatch PC will not boot/);
  assert.doesNotMatch(text, /password|tailscale|BITOS_/i);
});

test("ingest success returns work_id; unset or failed ingest returns WhatsApp", async () => {
  const intake = TicketIntakeSchema.parse(VALID);
  const ok = await deliverTicketIntake(intake, "https://operator.example", async (url, init) => {
    assert.equal(url, "https://operator.example/inbound/ticket");
    assert.deepEqual(JSON.parse(String(init.body)), ticketPayload(intake));
    return new Response(JSON.stringify({ ok: true, work_id: "work_abc123" }), { status: 200 });
  });
  assert.deepEqual(ok, { ok: true, work_id: "work_abc123" });

  const fallback = await deliverTicketIntake(intake, undefined);
  assert.equal(fallback.ok, true);
  assert.equal(fallback.door, "whatsapp");
  assert.equal(isSafeWhatsappHref(fallback.href), true);

  const failed = await deliverTicketIntake(intake, "https://operator.example", async () => {
    return new Response("nope", { status: 502 });
  });
  assert.equal(failed.door, "whatsapp");
});

test("API rejects invalid JSON and accepts a valid ticket", async () => {
  const bad = await handleTicketRequest(
    new Request("https://bitsolution.ca/api/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: "Acme" }),
    }),
    {},
  );
  assert.equal(bad.status, 400);

  const good = await handleTicketRequest(
    new Request("https://bitsolution.ca/api/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(VALID),
    }),
    {},
  );
  assert.equal(good.status, 200);
  const body = await good.json();
  assert.equal(body.ok, true);
  assert.equal(body.door, "whatsapp");
  assert.equal(ticketWorkId({ ticket_id: "tix_1" }), "tix_1");
});

test("Help sheet, ticket page, and support go to /ticket without Tailscale", async () => {
  const [help, page, support, site, form] = await Promise.all([
    read("src/components/site/ask-ai.tsx"),
    read("src/routes/ticket.tsx"),
    read("src/routes/support.tsx"),
    read("src/lib/site.ts"),
    read("src/components/site/ticket-form.tsx"),
  ]);
  assert.match(help, /<strong>Raise a ticket<\/strong>/);
  assert.match(help, /to="\/ticket"/);
  assert.match(page, /<TicketForm/);
  assert.match(page, /WhatsApp \{SITE\.whatsappDisplay\}/);
  assert.match(page, /Call \{SITE\.phoneDisplay\}/);
  assert.doesNotMatch(page, /tailscale|tail9e2ebd|ticketUrl/i);
  assert.doesNotMatch(site, /ticketUrl|tail9e2ebd|tailscale/i);
  assert.match(support, /to="\/ticket"/);
  assert.doesNotMatch(support, /ticketUrl|tail9e2ebd|tailscale/i);
  assert.match(form, /name="company"/);
  assert.match(form, /name="email"/);
  assert.match(form, /name="message"/);
  assert.match(form, /name="name"/);
  assert.match(form, /name="hostname"/);
  assert.match(form, /name="impact"/);
  assert.doesNotMatch(form, /name="phone"|name="whatsapp"/i);
  assert.match(form, /Do not send passwords/);
  assert.match(form, /source: TICKET_SOURCE/);
});
