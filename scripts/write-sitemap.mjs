import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import plan from "../src/data/legacy-migration.json" with { type: "json" };

const industries = [
  "transportation",
  "construction",
  "accounting",
  "healthcare",
  "legal",
  "schools",
  "colleges",
  "city-councils",
  "dental",
  "public-private",
  "airports",
  "retail",
  "warehouses",
  "industrial",
  "auto-dealerships",
  "hospitality",
];
const insights = [
  "protect-your-business",
  "cloud-migration",
  "backup-vs-local",
  "managed-it-time",
  "cyber-mistakes",
  "why-cloud-backup",
];

const paths = [
  "/",
  "/software",
  "/hardware",
  "/ai",
  "/security",
  "/industries",
  ...industries.map((s) => `/industries/${s}`),
  "/consult",
  "/privacy",
  "/faq",
  "/insights",
  ...insights.map((s) => `/insights/${s}`),
  "/gallery",
  "/images",
  "/support",
  "/service-areas",
  "/digital-marketing",
  "/procurement",
  "/voip",
  "/fleet-operations/ontario",
  "/dental-it/ontario",
  ...plan.keep200,
].sort((a, b) => a.localeCompare(b));

const unique = [...new Set(paths)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique.map((p) => `  <url><loc>https://bitsolution.ca${p === "/" ? "/" : p}</loc></url>`).join("\n")}
</urlset>
`;

const out = join(dirname(fileURLToPath(import.meta.url)), "../public/sitemap.xml");
writeFileSync(out, xml);
console.log(`wrote ${unique.length} urls to sitemap.xml`);
