import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("homepage renders every sector link through exactly one footer row", () => {
  const home = read("src/routes/index.tsx");
  const footer = read("src/components/site/site-footer.tsx");
  const industries = read("src/data/industries.ts");
  const slugs = [...industries.matchAll(/^\s{4}slug: "([^"]+)",$/gmu)].map((match) => match[1]);

  assert.ok(slugs.length > 0);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.doesNotMatch(home, /CoverReel|INDUSTRIES\.map/u);
  assert.equal((footer.match(/INDUSTRIES\.map/gmu) ?? []).length, 1);
  assert.equal((footer.match(/to="\/industries\/\$slug"/gmu) ?? []).length, 1);
  assert.match(footer, /<footer\b/u);
  assert.match(footer, /className="mt-8 flex flex-wrap[^"]*"/u);
});
