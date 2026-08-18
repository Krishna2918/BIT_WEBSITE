import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

delete process.env.VITE_SITE_INDEXABLE;
const { default: server } = await import("../.vercel/output/functions/__server.func/index.mjs");
const fetchLocal = (path) => server.fetch(new Request(`https://preview.invalid${path}`), {});

const preserved = [
  ["/", "BIT Solution — technology solutions for Ontario businesses", "https://bitsolution.ca/"],
  ["/about-us/", "One team for the technology your business runs on.", "https://bitsolution.ca/about-us/"],
  ["/accessibility-statement/", "Accessibility statement", "https://bitsolution.ca/accessibility-statement/"],
  ["/solutions/", "Technology that fits the work.", "https://bitsolution.ca/solutions/"],
  ["/cloud-services-brampton/", "Cloud Services Brampton", "https://bitsolution.ca/cloud-services-brampton/"],
  ["/how-to-choose-a-managed-it-services-provider/", "How to Choose a Managed IT Services Provider", "https://bitsolution.ca/how-to-choose-a-managed-it-services-provider/"],
  ["/cyber-security-tips-for-small-businesses/", "Cyber Security Tips for Small Businesses", "https://bitsolution.ca/cyber-security-tips-for-small-businesses/"],
  ["/5-biggest-benefits-of-cloud-backups/", "5 Biggest Benefits of Cloud Backups", "https://bitsolution.ca/5-biggest-benefits-of-cloud-backups/"],
  ["/10-signs-your-business-needs-managed-it-support/", "10 Signs Your Business Needs Managed IT Support", "https://bitsolution.ca/10-signs-your-business-needs-managed-it-support/"],
  ["/top-7-cyber-security-solutions-every-business-needs-in-2025/", "Top 7 Cyber Security Solutions Every Business Needs in 2025", "https://bitsolution.ca/top-7-cyber-security-solutions-every-business-needs-in-2025/"],
];

for (const [path, marker, canonical] of preserved) {
  for (const variant of path === "/" ? [path] : [path, path.replace(/\/$/, "")]) {
    const response = await fetchLocal(`${variant}?migration_canary=1`);
    const body = await response.text();
    assert.equal(response.status, 200, variant);
    assert.match(body, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), variant);
    assert.match(body, new RegExp(`<link rel="canonical" href="${canonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), variant);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive", variant);
  }
}

const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const sitemapPaths = [...sitemap.matchAll(/<loc>https:\/\/bitsolution\.ca([^<]*)<\/loc>/g)].map(
  (match) => match[1] || "/",
);
assert.equal(sitemapPaths.length, 49);
for (const path of sitemapPaths) {
  const response = await fetchLocal(path);
  const body = await response.text();
  assert.equal(response.status, 200, path);
  assert.doesNotMatch(body, /<(?:form|input|textarea|select)\b/i, path);
  assert.doesNotMatch(
    body,
    /mailto:|wa\.me|info@bitsolution\.ca|support@bitsolution\.ca|Chatwoot|Turnstile|FORM_AI|CRM_ADAPTER|googletagmanager|google-analytics|clarity\.ms|callrail/i,
    path,
  );
}

const gone = [
  "/sample-page/",
  "/404-2/",
  "/hero-section/",
  "/elementskit-content/dynamic-content-megamenu-menuitem488/",
  "/metform-form/ad-form/",
  "/metform-form/contact-form/",
  "/metform-form/servies/",
  "/?elementskit_template=header",
  "/?wpr_templates=user-footer-footer",
  "/?wpr_templates=user-header-header",
  "/?wpr_templates=user-single-single",
  "/consult/continue",
  "/thank-you",
];
for (const path of gone) {
  const response = await fetchLocal(path);
  assert.equal(response.status, 410, path);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive", path);
  assert.match(await response.text(), /<h1>Content removed<\/h1>/);
}

for (const path of ["/api/consult", "/api/assistant"]) {
  for (const method of ["GET", "POST"]) {
    const response = await server.fetch(
      new Request(`https://preview.invalid${path}`, {
        method,
        headers: { "content-type": "application/json" },
        body: method === "POST" ? JSON.stringify({ should_not_be_read: true }) : undefined,
      }),
      {},
    );
    assert.equal(response.status, 410, `${method} ${path}`);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { ok: false, error: "gone" });
  }
}

process.env.VITE_SITE_INDEXABLE = "1";
const productionIndexing = await server.fetch(new Request("https://bitsolution.ca/privacy"), {});
const wwwIndexing = await server.fetch(new Request("https://www.bitsolution.ca/privacy"), {});
const previewIndexing = await server.fetch(new Request("https://candidate.vercel.app/privacy"), {});
assert.equal(productionIndexing.headers.get("x-robots-tag"), "index, follow");
assert.equal(wwwIndexing.headers.get("x-robots-tag"), "index, follow");
assert.equal(previewIndexing.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
delete process.env.VITE_SITE_INDEXABLE;

console.log(JSON.stringify({
  status: "PASS",
  preserve200Assertions: preserved.length * 2 - 1,
  gone410Assertions: gone.length,
  apiGoneAssertions: 4,
  sitemapPhoneOnlyAssertions: sitemapPaths.length,
  exactHostIndexingAssertions: 3,
  previewIndexing: "noindex,nofollow,noarchive",
}));
