import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import plan from "../src/data/legacy-migration.json" with { type: "json" };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function normalizePath(pathname) {
  const raw = pathname.split("?")[0] ?? "/";
  if (raw === "/" || raw === "") return "/";
  return raw.replace(/\/+$/, "") || "/";
}

function resolveLegacy(pathname) {
  const raw = (pathname.split("?")[0] ?? "/") || "/";
  const path = normalizePath(raw);
  if (plan.gone410.includes(path)) return { status: 410 };
  for (const prefix of plan.gonePrefixes) {
    if (path === prefix.slice(0, -1) || path.startsWith(prefix) || raw.startsWith(prefix)) {
      return { status: 410 };
    }
  }
  if (plan.redirects301[path]) return { status: 301, to: plan.redirects301[path] };
  if (raw !== path && raw !== "/") return { status: 301, to: path };
  return { status: 200 };
}

describe("one-hop legacy plan", () => {
  it("has no two-hop, self, or 200/410 collisions", () => {
    const froms = new Set(Object.keys(plan.redirects301));
    const errors = [];
    for (const [from, to] of Object.entries(plan.redirects301)) {
      if (from === to) errors.push(`${from} self`);
      if (froms.has(to)) errors.push(`${from} → ${to} two-hop`);
      if (plan.gone410.includes(to)) errors.push(`${from} → 410`);
      if (plan.keep200.includes(from)) errors.push(`${from} is 200 and redirect`);
    }
    for (const keep of plan.keep200) {
      if (plan.gone410.includes(keep)) errors.push(`${keep} 200 and 410`);
    }
    assert.deepEqual(errors, []);
  });

  it("keeps the nine valuable pages as 200", () => {
    assert.equal(plan.keep200.length, 9);
    for (const path of plan.keep200) {
      assert.equal(resolveLegacy(path).status, 200, path);
      assert.deepEqual(resolveLegacy(`${path}/`), { status: 301, to: path });
    }
  });

  it("301s aliases in one hop and 410s retirements", () => {
    assert.deepEqual(resolveLegacy("/about"), { status: 301, to: "/about-us" });
    assert.deepEqual(resolveLegacy("/about/"), { status: 301, to: "/about-us" });
    assert.deepEqual(resolveLegacy("/services"), { status: 301, to: "/solutions" });
    assert.deepEqual(resolveLegacy("/contact-us"), { status: 301, to: "/consult" });
    assert.deepEqual(resolveLegacy("/help-centre"), { status: 410 });
    assert.deepEqual(resolveLegacy("/author/admin"), { status: 410 });
    assert.deepEqual(resolveLegacy("/category/it"), { status: 410 });
  });
});

describe("robots and sitemap files", () => {
  it("production robots preserve Content-Signal and exclusions", () => {
    const txt = readFileSync(join(root, "public/robots.txt"), "utf8");
    assert.match(txt, /Content-Signal: search=yes, ai-train=no, use=reference/);
    assert.match(txt, /Disallow: \/api\//);
    assert.match(txt, /Disallow: \/thank-you/);
    assert.match(txt, /Sitemap: https:\/\/bitsolution\.ca\/sitemap\.xml/);
  });

  it("sitemap is bitsolution.ca only and includes the nine pages", () => {
    const xml = readFileSync(join(root, "public/sitemap.xml"), "utf8");
    assert.match(xml, /https:\/\/bitsolution\.ca\//);
    assert.doesNotMatch(xml, /vercel\.app/);
    assert.doesNotMatch(xml, /\/thank-you/);
    assert.doesNotMatch(xml, /\/login</);
    assert.doesNotMatch(xml, /\/api\//);
    for (const path of plan.keep200) {
      assert.match(xml, new RegExp(`https://bitsolution\\.ca${path.replaceAll("/", "\\/")}<`));
    }
  });
});

describe("source gates", () => {
  it("root does not load fonts.googleapis.com", () => {
    const rootSrc = readFileSync(join(root, "src/routes/__root.tsx"), "utf8");
    assert.doesNotMatch(rootSrc, /fonts\.googleapis\.com/);
  });

  it("homepage has a real text H1", () => {
    const home = readFileSync(join(root, "src/routes/index.tsx"), "utf8");
    assert.match(home, /<h1[\s\S]*Intelligent Infrastructure/);
    assert.doesNotMatch(home, /<h1 className="hero-lockup">/);
  });

  it("nine route files exist", () => {
    for (const path of plan.keep200) {
      const file = join(root, "src/routes", `${path.slice(1)}.tsx`);
      assert.equal(readFileSync(file, "utf8").includes("legacyRoute"), true, file);
    }
  });
});
