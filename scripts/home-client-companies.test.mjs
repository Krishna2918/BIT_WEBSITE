import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const clients = await readFile(new URL("../src/data/clients.ts", import.meta.url), "utf8");

test("homepage restores one complete approved client-company section", () => {
  assert.equal((home.match(/id="client-companies"/gu) || []).length, 1);
  assert.match(home, /import \{ CLIENTS \} from "@\/data\/clients"/u);
  for (const sector of ["dental", "transportation", "construction", "warehouses"]) {
    assert.match(home, new RegExp(`clients: CLIENTS\\.${sector}`, "u"));
  }
  assert.match(home, /CLIENT_GROUPS\.map/u);
  assert.match(home, /group\.clients\.map/u);
});

test("approved client registry remains unchanged and homepage links use its exact values", () => {
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
  assert.match(home, /href=\{client\.href\}/u);
  assert.match(home, /src=\{client\.logo\}/u);
});
