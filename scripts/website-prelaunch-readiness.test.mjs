import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

test("consult route is self-canonical and preview indexing fails closed", async () => {
  const source = await read("src/routes/consult.tsx");
  assert.match(source, /SITE_INDEXABLE \? "index,follow" : "noindex,nofollow,noarchive"/);
  assert.match(source, /rel: "canonical", href: `\$\{SITE\.url\}\/consult`/);
});

test("approved General/Other label preserves canonical Other value", async () => {
  const source = await read("src/lib/consult-contract.ts");
  assert.match(source, /CONSULT_SERVICE_OPTIONS[\s\S]*"Other"/);
  assert.match(source, /Other: "General\/Other"/);
});

test("robots and sitemap keep private conversion routes out of discovery", async () => {
  const robots = await read("public/robots.txt");
  const sitemap = await read("public/sitemap.xml");

  assert.match(robots, /Disallow: \/login/);
  assert.match(robots, /Disallow: \/thank-you/);
  assert.match(sitemap, /https:\/\/bitsolution\.ca\/consult</);
  assert.match(sitemap, /https:\/\/bitsolution\.ca\/fleet-operations\/ontario</);
  assert.match(sitemap, /https:\/\/bitsolution\.ca\/dental-it\/ontario</);
  assert.doesNotMatch(sitemap, /\/thank-you|\/consult\/continue|\/login|\/api\//);
});

test("mobile navigation hides the phone pill below the small breakpoint", async () => {
  const nav = await read("src/components/site/site-nav.tsx");
  const styles = await read("src/styles.css");

  assert.match(nav, /className="nav-phone cta-ghost/);
  assert.match(styles, /\.nav-phone\s*\{\s*display: none;/);
  assert.match(styles, /@media \(min-width: 640px\)[\s\S]*\.nav-phone\s*\{\s*display: inline-flex;/);
});

test("privacy route carries the owner-approved retention schedule", async () => {
  const privacy = await read("src/routes/privacy.tsx");

  assert.match(privacy, /30 days/);
  assert.match(privacy, /24 months after the last activity/);
  assert.match(privacy, /24 months after withdrawal/);
  assert.match(privacy, /raw analytics identifiers are kept for 14 months/);
  assert.match(privacy, /Call recording is off/);
  assert.match(privacy, /legal hold may pause scheduled deletion/i);
  assert.match(privacy, /rel: "canonical", href: `\$\{SITE\.url\}\/privacy`/);
});
