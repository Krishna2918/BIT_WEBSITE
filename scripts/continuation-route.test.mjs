import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const routePath = new URL("../src/routes/consult_.continue.tsx", import.meta.url);
const source = fs.readFileSync(routePath, "utf8");

test("continuation route is token-only and fail-closed", () => {
  // The trailing underscore keeps the public URL at /consult/continue while
  // preventing TanStack Router from nesting it under the /consult page.
  assert.match(source, /createFileRoute\("\/consult_\/continue"\)/);
  assert.match(source, /token\?: string/);
  assert.match(source, /isOpaqueContinuationToken\(token\)/);
  assert.match(source, /data-continuation-state="unavailable"/);
  assert.doesNotMatch(source, /<form\b|type=["']submit["']|onSubmit\s*=/i);
  assert.doesNotMatch(source, /fetch\s*\(|axios|navigator\.sendBeacon|provider/i);
  assert.doesNotMatch(source, /search\.(?:email|phone|name|company|message|credentials)/i);
});
