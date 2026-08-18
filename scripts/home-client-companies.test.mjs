import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const sector = await readFile(
  new URL("../src/components/site/industry-page.tsx", import.meta.url),
  "utf8",
);
const clients = await readFile(new URL("../src/data/clients.ts", import.meta.url), "utf8");

test("homepage does not list client companies", () => {
  assert.doesNotMatch(home, /id="client-companies"/u);
  assert.doesNotMatch(home, /CLIENT_GROUPS/u);
  assert.doesNotMatch(home, /Companies across the floors we support/u);
});

test("sector pages keep the rotating name ticker", () => {
  assert.match(sector, /function ClientTicker/u);
  assert.match(sector, /Who trusts us\. Who we trust\./u);
  assert.match(sector, /clientsFor\(industry\.slug\)/u);
});

test("approved client registry remains unchanged", () => {
  for (const name of [
    "Sandhu Dental Group",
    "Milestone Dentistry",
    "Revive Dental",
    "DM Transport",
    "ICAP Transport",
    "Skylark Logistics",
    "D Rock Paving",
    "Vespa Packaging",
    "ShipMonk",
  ]) {
    assert.match(clients, new RegExp(name, "u"));
  }
});
