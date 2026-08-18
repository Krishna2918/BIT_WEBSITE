import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import plan from "../src/data/legacy-migration.json" with { type: "json" };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const redirects = Object.entries(plan.redirects301).flatMap(([from, to]) => {
  const entries = [{ source: from, destination: to, permanent: true }];
  if (!from.endsWith(".xml") && !from.endsWith(".xsl") && !from.endsWith("/")) {
    entries.push({ source: `${from}/`, destination: to, permanent: true });
  }
  return entries;
});

const vercel = {
  trailingSlash: false,
  redirects,
};

writeFileSync(join(root, "vercel.json"), `${JSON.stringify(vercel, null, 2)}\n`);
console.log(`wrote ${redirects.length} vercel redirects`);
