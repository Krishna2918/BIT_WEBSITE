import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, "$1"));
const baseline = JSON.parse(await readFile(join(root, "docs", "wordpress-seo-baseline-2026-08-18.json"), "utf8"));

const preserve = new Set([
  "/",
  "/about-us/",
  "/accessibility-statement/",
  "/solutions/",
  "/cloud-services-brampton/",
  "/how-to-choose-a-managed-it-services-provider/",
  "/cyber-security-tips-for-small-businesses/",
  "/5-biggest-benefits-of-cloud-backups/",
  "/10-signs-your-business-needs-managed-it-support/",
  "/top-7-cyber-security-solutions-every-business-needs-in-2025/",
]);

const redirects = new Map([
  ["/author/admin/", "/insights"],
  ["/blog/", "/insights"],
  ["/business-voip-phone-service-brampton/", "/voip"],
  ["/category/it/", "/insights"],
  ["/cloud-backup-vs-local-storage-brampton/", "/insights/backup-vs-local"],
  ["/contact/", "/consult"],
  ["/cyber-security-services-brampton/", "/security"],
  ["/digital-marketing-services-brampton/", "/digital-marketing"],
  ["/easy-cloud-migration-for-businesses/", "/insights/cloud-migration"],
  ["/manage-it-services-brampton/", "/support"],
  ["/managed-it-services-brampton-save-time-money/", "/insights/managed-it-time"],
  ["/managed-it-services/", "/support"],
  ["/office-network-installation-brampton/", "/hardware"],
  ["/procurement-services/", "/procurement"],
  ["/security-camera-installation-brampton/", "/hardware"],
  ["/sitemap/", "/sitemap.xml"],
  ["/struggling-with-cyber-attacks-protect-your-business/", "/insights/protect-your-business"],
  ["/support/", "/support"],
  ["/thank-you/", "/thank-you"],
  ["/top-cybersecurity-mistakes-businesses-make-and-how-to-avoid-them/", "/insights/cyber-mistakes"],
  ["/why-businesses-need-reliable-cloud-backup-services-in-canada/", "/insights/why-cloud-backup"],
]);

const gone = new Set([
  "/?elementskit_template=header",
  "/?wpr_templates=user-footer-footer",
  "/?wpr_templates=user-header-header",
  "/?wpr_templates=user-single-single",
  "/404-2/",
  "/elementskit-content/dynamic-content-megamenu-menuitem488/",
  "/hero-section/",
  "/metform-form/ad-form/",
  "/metform-form/contact-form/",
  "/metform-form/servies/",
  "/sample-page/",
]);

const rows = baseline.pages.map(({ path }) => {
  if (preserve.has(path)) return { source: path, action: "preserve_200", destination: path };
  if (redirects.has(path)) return { source: path, action: "redirect_301", destination: redirects.get(path) };
  if (gone.has(path)) return { source: path, action: "gone_410_noindex", destination: null };
  throw new Error(`unclassified WordPress sitemap row: ${path}`);
});
const counts = Object.fromEntries(
  ["preserve_200", "redirect_301", "gone_410_noindex"].map((action) => [
    action,
    rows.filter((row) => row.action === action).length,
  ]),
);
if (counts.preserve_200 !== 10 || counts.redirect_301 !== 21 || counts.gone_410_noindex !== 11) {
  throw new Error(`unexpected map counts: ${JSON.stringify(counts)}`);
}

const internalAliases = [
  ["/business-communication/", "/voip"],
  ["/cloud-services/", "/cloud-services-brampton/"],
  ["/cyber-security-services/", "/security"],
  ["/digital-marketing/", "/digital-marketing"],
  ["/manage-it-services/", "/support"],
  ["/professional-it-services/", "/hardware"],
  ["/security-camera-alarm/", "/hardware"],
  ["/cloud-services.html", "/cloud-services-brampton/"],
  ["/cyber-security-services.html", "/security"],
  ["/digital-marketing.html", "/digital-marketing"],
  ["/manage-it-services.html", "/support"],
  ["/professional-it-services.html", "/hardware"],
  ["/security-camera.html", "/hardware"],
].map(([source, destination]) => ({ source, action: "redirect_301", destination }));

const wpSitemapCompatibility = [
  "/wp-sitemap.xml",
  "/wp-sitemap-posts-post-1.xml",
  "/wp-sitemap-posts-page-1.xml",
  "/wp-sitemap-posts-elementskit_content-1.xml",
  "/wp-sitemap-posts-elementskit_template-1.xml",
  "/wp-sitemap-posts-wpr_templates-1.xml",
  "/wp-sitemap-posts-metform-form-1.xml",
  "/wp-sitemap-taxonomies-category-1.xml",
  "/wp-sitemap-users-1.xml",
].map((source) => ({ source, action: "redirect_301", destination: "/sitemap.xml" }));

const document = {
  schema: "bit.website.seo-migration-route-map:v2",
  captured_at: baseline.captured_at,
  source_origin: "https://bitsolution.ca",
  final_origin: "https://bitsolution.ca",
  baseline_sitemap_rows: rows.length,
  assertion_counts: counts,
  rules: {
    redirect_status: 301,
    preserve_query_strings: true,
    maximum_hops: 1,
    canonical_scheme: "https",
    canonical_host: "bitsolution.ca",
    preview_indexing: "noindex,nofollow,noarchive",
  },
  current_sitemap_rows: rows,
  internally_linked_legacy_aliases: internalAliases,
  wp_sitemap_compatibility: wpSitemapCompatibility,
  host_normalization: {
    final: "https://bitsolution.ca/:path*",
    required_sources: [
      "http://bitsolution.ca/:path*",
      "http://www.bitsolution.ca/:path*",
      "https://www.bitsolution.ca/:path*",
    ],
    preserve_path_and_query: true,
    maximum_hops: 1,
    production_gate: "Vercel primary-domain and Cloudflare edge readback; no DNS action in this release",
  },
};

const output = join(root, "docs", "seo-migration-route-map-2026-08-18.json");
await writeFile(output, `${JSON.stringify(document, null, 2)}\n`);
console.log(JSON.stringify({ status: "PASS", output, counts, aliases: internalAliases.length, compatibility: wpSitemapCompatibility.length }));
