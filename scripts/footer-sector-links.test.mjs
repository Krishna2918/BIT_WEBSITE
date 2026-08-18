import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("shared footer renders every sector link exactly once in one sector grid", () => {
  const home = read("src/routes/index.tsx");
  const footer = read("src/components/site/site-footer.tsx");
  const landingChrome = read("src/components/site/lp-chrome.tsx");
  const industries = read("src/data/industries.ts");
  const slugs = [...industries.matchAll(/^\s{4}slug: "([^"]+)",$/gmu)].map((match) => match[1]);

  assert.equal(slugs.length, 16);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.doesNotMatch(home, /CoverReel|INDUSTRIES\.map/u);
  assert.equal((footer.match(/INDUSTRIES\.map/gmu) ?? []).length, 1);
  assert.equal((footer.match(/to="\/industries\/\$slug"/gmu) ?? []).length, 1);
  assert.match(footer, /<footer\b/u);
  assert.equal((footer.match(/className="site-footer-sectors"/gmu) ?? []).length, 1);
  assert.match(footer, /<h2 id="footer-sectors-heading">Sectors<\/h2>/u);
  assert.match(footer, /title: "Core services"/u);
  assert.match(footer, /title: "Business services"/u);
  assert.match(footer, /title: "Company"/u);
  assert.match(footer, /title: "Contact"/u);
  assert.doesNotMatch(footer, /title: "Also"/u);
  assert.equal((footer.match(/to="\/privacy"/gmu) ?? []).length, 1);
  assert.equal((footer.match(/to: "\/consult", label: "Book consultation"/gmu) ?? []).length, 1);
  assert.match(footer, /href=\{SITE\.phoneHref\}/u);
  assert.match(footer, /href=\{SITE\.whatsappHref\}/u);
  assert.match(footer, /href=\{`mailto:\$\{SITE\.email\}`\}/u);
  assert.match(footer, /\{SITE\.address\}/u);
  assert.match(footer, /onClick=\{openConsentPreferences\}/u);
  assert.match(landingChrome, /return <SiteFooter \/>;/u);
  assert.doesNotMatch(landingChrome, /className="lp-foot"/u);
});
