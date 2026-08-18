import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Vercel preview build is migration-free, unbound, and fail-closed", async () => {
  const [packageJson, vercelJson, middleware, consultRoute, assistantRoute, viteConfig, envExample] = await Promise.all([
    readFile(new URL("package.json", root), "utf8").then(JSON.parse),
    readFile(new URL("vercel.json", root), "utf8").then(JSON.parse),
    readFile(new URL("server/middleware/indexing.ts", root), "utf8"),
    readFile(new URL("src/routes/api/consult.ts", root), "utf8"),
    readFile(new URL("src/routes/api/assistant.ts", root), "utf8"),
    readFile(new URL("vite.config.ts", root), "utf8"),
    readFile(new URL(".env.example", root), "utf8"),
  ]);

  assert.equal(
    packageJson.scripts["build:preview"],
    "vite build && node scripts/vercel-output-regression.mjs",
  );
  assert.equal(vercelJson.framework, "tanstack-start");
  assert.equal(vercelJson.installCommand, "npm ci");
  assert.equal(vercelJson.buildCommand, "npm run build:preview");
  assert.equal("outputDirectory" in vercelJson, false);
  assert.equal("env" in vercelJson, false);
  assert.equal("build" in vercelJson, false);

  const previewBuild = `${packageJson.scripts["build:preview"]} ${vercelJson.buildCommand}`;
  assert.doesNotMatch(previewBuild, /migrat|database|provider|deploy|dns/i);

  const configuredHeaders = Object.fromEntries(
    vercelJson.headers.flatMap((rule) => rule.headers.map(({ key, value }) => [key, value])),
  );
  assert.equal(configuredHeaders["X-Robots-Tag"], undefined);
  assert.match(middleware, /process\.env\.VITE_SITE_INDEXABLE === "1"/);
  assert.match(middleware, /"index, follow"/);
  assert.match(middleware, /"noindex, nofollow, noarchive"/);
  assert.match(consultRoute, /GET:\s*\(\) =>/);
  assert.match(consultRoute, /method_not_allowed/);
  assert.match(consultRoute, /status:\s*405/);
  assert.match(consultRoute, /POST:\s*async/);
  assert.match(assistantRoute, /GET:\s*methodNotAllowed/);
  assert.match(assistantRoute, /POST:\s*\(\{ request \}\)/);
  assert.match(assistantRoute, /status:\s*405/);
  assert.doesNotMatch(viteConfig, /popup|preview bridge|install tutorial/i);
  assert.match(envExample, /^VITE_PUBLIC_HOSTNAME=$/mu);
  assert.match(envExample, /^VITE_SITE_INDEXABLE=0$/mu);
  assert.match(envExample, /^VITE_MEASUREMENT_ON=0$/mu);
  assert.match(envExample, /^FORM_AI_TEAMS_ADAPTER_URL=$/mu);
  assert.match(envExample, /^FORM_AI_TEAMS_ADAPTER_TOKEN=$/mu);
});
