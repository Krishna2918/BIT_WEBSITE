import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import plan from "../src/data/legacy-migration.json" with { type: "json" };
import { inventoryMedia } from "./legacy-media-inventory.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function normalizePath(pathname) {
  const raw = pathname.split("?")[0] ?? "/";
  if (raw === "/" || raw === "") return "/";
  return raw.replace(/\/+$/, "") || "/";
}

function resolveLegacy(pathname) {
  const [rawPath = "/", qs] = pathname.split("?");
  const path = normalizePath(rawPath);
  const query = qs ? `?${qs}` : "";
  const key = `${path}${query}`;
  if (plan.goneQueries.includes(key)) return { status: 410 };
  if (plan.gone410.includes(path)) return { status: 410 };
  for (const prefix of plan.gonePrefixes) {
    if (path === prefix.slice(0, -1) || path.startsWith(prefix) || rawPath.startsWith(prefix)) {
      return { status: 410 };
    }
  }
  if (plan.redirects301[path]) return { status: 301, to: plan.redirects301[path] };
  if (rawPath !== path && rawPath !== "/") return { status: 301, to: path };
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

  it("301s every mapped redirect in one hop, including slash variants", () => {
    for (const [from, to] of Object.entries(plan.redirects301)) {
      assert.deepEqual(resolveLegacy(from), { status: 301, to }, from);
      if (!from.endsWith(".xml") && !from.endsWith(".xsl")) {
        assert.deepEqual(resolveLegacy(`${from}/`), { status: 301, to }, `${from}/`);
      }
    }
  });

  it("410s every approved retirement path", () => {
    for (const path of plan.gone410) {
      assert.equal(resolveLegacy(path).status, 410, path);
      assert.equal(resolveLegacy(`${path}/`).status, 410, `${path}/`);
    }
  });

  it("410s known Elementor/WPR query variants only", () => {
    for (const q of plan.goneQueries) {
      assert.equal(resolveLegacy(q).status, 410, q);
    }
    assert.equal(resolveLegacy("/?utm_source=ad").status, 200);
    assert.equal(resolveLegacy("/about-us?elementskit_template=header").status, 200);
  });

  it("maps the six live article slugs to /insights/*", () => {
    const six = {
      "/why-businesses-need-reliable-cloud-backup-services-in-canada": "/insights/why-cloud-backup",
      "/top-cybersecurity-mistakes-businesses-make-and-how-to-avoid-them": "/insights/cyber-mistakes",
      "/managed-it-services-brampton-save-time-money": "/insights/managed-it-time",
      "/cloud-backup-vs-local-storage-brampton": "/insights/backup-vs-local",
      "/struggling-with-cyber-attacks-protect-your-business": "/insights/protect-your-business",
      "/easy-cloud-migration-for-businesses": "/insights/cloud-migration",
    };
    for (const [from, to] of Object.entries(six)) {
      assert.deepEqual(resolveLegacy(from), { status: 301, to });
    }
  });

  it("maps category/author to /insights", () => {
    assert.deepEqual(resolveLegacy("/category/it"), { status: 301, to: "/insights" });
    assert.deepEqual(resolveLegacy("/author/admin"), { status: 301, to: "/insights" });
  });
});

describe("robots and sitemap files", () => {
  const txt = readFileSync(join(root, "public/robots.txt"), "utf8");

  it("preserves Content-Signal and Cloudflare bot blocks", () => {
    assert.match(txt, /Content-Signal: search=yes,ai-train=no,use=reference/);
    for (const bot of [
      "Amazonbot",
      "Applebot-Extended",
      "Bytespider",
      "CCBot",
      "ClaudeBot",
      "CloudflareBrowserRenderingCrawler",
      "Google-Extended",
      "GPTBot",
      "meta-externalagent",
    ]) {
      assert.match(txt, new RegExp(`User-agent: ${bot}\\nDisallow: /`));
    }
  });

  it("adds API, thank-you, and consult-continue exclusions", () => {
    assert.match(txt, /Disallow: \/api\//);
    assert.match(txt, /Disallow: \/thank-you/);
    assert.match(txt, /Disallow: \/consult-continue/);
    assert.match(txt, /Disallow: \/login/);
    assert.match(txt, /Sitemap: https:\/\/bitsolution\.ca\/sitemap\.xml/);
    assert.doesNotMatch(txt, /wp-sitemap\.xml/);
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

  it("every WP child sitemap endpoint is mapped one hop to /sitemap.xml", () => {
    const children = [
      "/wp-sitemap.xml",
      "/wp-sitemap-posts-post-1.xml",
      "/wp-sitemap-posts-page-1.xml",
      "/wp-sitemap-posts-elementskit_content-1.xml",
      "/wp-sitemap-posts-elementskit_template-1.xml",
      "/wp-sitemap-posts-wpr_templates-1.xml",
      "/wp-sitemap-posts-metform-form-1.xml",
      "/wp-sitemap-taxonomies-category-1.xml",
      "/wp-sitemap-users-1.xml",
      "/sitemap",
    ];
    for (const from of children) {
      assert.deepEqual(resolveLegacy(from), { status: 301, to: "/sitemap.xml" }, from);
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

describe("legacy media inventory", () => {
  it("records the 233-asset blocker and hashes any files that exist", () => {
    const report = inventoryMedia();
    assert.equal(report.expectedCount, 233);
    assert.equal(report.filesOnDisk, report.items.length);
    for (const item of report.items) {
      assert.match(item.sha256, /^[a-f0-9]{64}$/);
      assert.equal(item.readable, true);
      assert.ok(item.bytes > 0);
    }
    assert.notEqual(report.filesOnDisk, 233);
    assert.equal(report.status, "BLOCKED");
    assert.match(report.reason, /not in this repository/i);
  });
});
