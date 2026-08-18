import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("security headers are self-only and disable form and frame actions", async () => {
  const config = JSON.parse(await read("vercel.json"));
  const headers = Object.fromEntries(
    config.headers.flatMap((rule) => rule.headers.map(({ key, value }) => [key, value])),
  );

  assert.equal(headers["Strict-Transport-Security"], "max-age=31536000");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.equal(headers["Permissions-Policy"], "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");

  const csp = headers["Content-Security-Policy"];
  for (const directive of [
    "default-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'",
    "connect-src 'self'",
    "frame-src 'none'",
  ]) {
    assert.match(csp, new RegExp(escapeRegExp(directive)));
  }
  assert.doesNotMatch(
    csp,
    /https?:|wss?:|fonts\.googleapis\.com|fonts\.gstatic\.com|googletagmanager|google-analytics|clarity\.ms|callrail/i,
  );
});

test("public pages use only local system font stacks", async () => {
  const [rootRoute, styles] = await Promise.all([
    read("src/routes/__root.tsx"),
    read("src/styles.css"),
  ]);
  const publicFontSource = `${rootRoute}\n${styles}`;

  assert.doesNotMatch(publicFontSource, /fonts\.googleapis\.com|fonts\.gstatic\.com/i);
  assert.doesNotMatch(publicFontSource, /Michroma|Orbitron|Bank Gothic|Eurostile Extended/i);
  assert.match(styles, /--font-mark: "Segoe UI Variable Display", "Segoe UI", Arial, sans-serif;/);
  for (const family of ["archivo", "dmsans", "ibmplexsans", "poppins", "roboto"]) {
    const css = await read(`public/wp-content/uploads/elementor/google-fonts/css/${family}.css`);
    assert.match(css, /Legacy compatibility stylesheet/u);
    assert.doesNotMatch(css, /https?:\/\/|hostingersite\.com|@font-face|url\(/iu);
  }
});

test("legacy redirects use exact 301s and have no duplicate source", async () => {
  const config = JSON.parse(await read("vercel.json"));
  const sources = config.redirects.map((redirect) => redirect.source);
  assert.equal(new Set(sources).size, sources.length);
  for (const redirect of config.redirects) {
    assert.equal(redirect.statusCode, 301);
    assert.match(redirect.source, /^\//);
    assert.ok(
      redirect.destination.startsWith("/") || redirect.destination.startsWith("https://bitsolution.ca/"),
    );
  }
  for (const required of [
    "/blog",
    "/blog/",
    "/contact",
    "/contact/",
    "/why-businesses-need-reliable-cloud-backup-services-in-canada",
    "/why-businesses-need-reliable-cloud-backup-services-in-canada/",
    "/wp-sitemap.xml",
  ]) {
    assert.ok(sources.includes(required), `missing redirect for ${required}`);
  }
});

test("sitemap covers public dynamic routes and excludes private routes", async () => {
  const [sitemap, industries, insights, robots] = await Promise.all([
    read("public/sitemap.xml"),
    read("src/data/industries.ts"),
    read("src/data/insights.ts"),
    read("public/robots.txt"),
  ]);
  const sitemapUrls = new Set(
    [...sitemap.matchAll(/<loc>(https:\/\/bitsolution\.ca[^<]+)<\/loc>/g)].map((match) => match[1]),
  );
  for (const slug of [...industries.matchAll(/slug: "([^"]+)"/g)].map((match) => match[1])) {
    assert.ok(sitemapUrls.has(`https://bitsolution.ca/industries/${slug}`));
  }
  for (const slug of [...insights.matchAll(/slug: "([^"]+)"/g)].map((match) => match[1])) {
    assert.ok(sitemapUrls.has(`https://bitsolution.ca/insights/${slug}`));
  }
  assert.doesNotMatch(sitemap, /\/thank-you|\/consult\/continue|\/api\//);
  for (const path of ["/thank-you", "/consult/continue", "/api/"]) {
    assert.match(robots, new RegExp(`Disallow: ${escapeRegExp(path)}`));
  }
});

test("all public route families emit a bitsolution.ca canonical", async () => {
  const routeFiles = [
    "index.tsx", "ai.tsx", "consult.tsx", "dental-it.ontario.tsx",
    "digital-marketing.tsx", "faq.tsx", "fleet-operations.ontario.tsx",
    "gallery.tsx", "hardware.tsx", "industries.index.tsx", "industries.$slug.tsx",
    "insights.index.tsx", "insights.$slug.tsx", "privacy.tsx", "procurement.tsx",
    "security.tsx", "service-areas.tsx", "software.tsx", "support.tsx", "voip.tsx",
    "about-us.tsx", "accessibility-statement.tsx", "solutions.tsx",
    "cloud-services-brampton.tsx", "how-to-choose-a-managed-it-services-provider.tsx",
    "cyber-security-tips-for-small-businesses.tsx", "5-biggest-benefits-of-cloud-backups.tsx",
    "10-signs-your-business-needs-managed-it-support.tsx",
    "top-7-cyber-security-solutions-every-business-needs-in-2025.tsx",
  ];
  for (const file of routeFiles) {
    const source = await read(`src/routes/${file}`);
    assert.match(source, /rel: "canonical"|canonicalLink\(/, `${file} lacks a canonical`);
  }
});

test("public copy excludes malformed timeline and held offer language", async () => {
  const [fleet, dental, software, industries] = await Promise.all([
    read("src/routes/fleet-operations.ontario.tsx"),
    read("src/routes/dental-it.ontario.tsx"),
    read("src/routes/software.tsx"),
    read("src/data/industries.ts"),
  ]);
  const publicCopy = [fleet, dental, software, industries].join("\n");

  assert.match(
    fleet,
    /We support fleet software—and can design custom workflows when\s+off-the-shelf tools do not fit your operation\./,
  );
  assert.match(
    dental,
    /We support clinic software—and can design custom workflows when\s+off-the-shelf tools do not fit your practice\./,
  );
  assert.doesNotMatch(
    publicCopy,
    /\bin 1\b|one month|30-day|three months|three-month|don[’']t pay for three|guarantee|service credit|payment waiver/i,
  );
});

test("partner block uses neutral wording without unevidenced active-status claims", async () => {
  const [home, faqs, partners] = await Promise.all([
    read("src/routes/index.tsx"),
    read("src/data/faqs.ts"),
    read("src/data/partners.ts"),
  ]);
  const runtimeCopy = [home, faqs].join("\n");

  assert.match(home, /Technology platforms/);
  assert.match(home, /Product availability, vendor status, and eligibility/);
  assert.doesNotMatch(runtimeCopy, /Microsoft Cloud Solution Provider|CRTC regulated wholesaler/i);
  assert.match(partners, /Pulled from the partner strip on bitsolution\.ca \(June 2025 logos\)/);
});
