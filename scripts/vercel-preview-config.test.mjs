import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Vercel preview build is migration-free, unbound, and noindex", async () => {
  const [packageJson, vercelJson] = await Promise.all([
    readFile(new URL("package.json", root), "utf8").then(JSON.parse),
    readFile(new URL("vercel.json", root), "utf8").then(JSON.parse),
  ]);

  assert.equal(packageJson.scripts["build:preview"], "vite build");
  assert.equal(vercelJson.framework, "tanstack-start");
  assert.equal(vercelJson.installCommand, "npm ci");
  assert.equal(vercelJson.buildCommand, "npm run build:preview");
  assert.equal("outputDirectory" in vercelJson, false);
  assert.equal("env" in vercelJson, false);
  assert.equal("build" in vercelJson, false);

  const previewBuild = `${packageJson.scripts["build:preview"]} ${vercelJson.buildCommand}`;
  assert.doesNotMatch(previewBuild, /migrat|database|provider|deploy|dns/i);

  assert.deepEqual(vercelJson.headers, [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow, noarchive",
        },
      ],
    },
  ]);
});
