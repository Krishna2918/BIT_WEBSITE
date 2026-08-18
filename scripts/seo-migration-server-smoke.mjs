import assert from "node:assert/strict";

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
];
for (const path of gone) {
  const response = await fetchLocal(path);
  assert.equal(response.status, 410, path);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive", path);
  assert.match(await response.text(), /<h1>Content removed<\/h1>/);
}

console.log(JSON.stringify({
  status: "PASS",
  preserve200Assertions: preserved.length * 2 - 1,
  gone410Assertions: gone.length,
  previewIndexing: "noindex,nofollow,noarchive",
}));
