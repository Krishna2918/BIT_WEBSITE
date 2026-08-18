import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = join(root, ".vercel", "output");
const serverFunction = join(output, "functions", "__server.func");

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

const [config, functionConfig] = await Promise.all([
  readFile(join(output, "config.json"), "utf8").then(JSON.parse),
  readFile(join(serverFunction, ".vc-config.json"), "utf8").then(JSON.parse),
]);

assert.equal(config.version, 3);
assert.ok(
  config.routes?.some((route) => route.src === "/(.*)" && route.dest === "/__server"),
  "Vercel output must route dynamic and API requests to the Nitro server function",
);
assert.equal(await stat(join(serverFunction, "index.mjs")).then((item) => item.isFile()), true);
assert.equal(functionConfig.handler, "index.mjs");

const searchable = (await walk(output)).filter((path) => /\.(?:css|html|js|json|mjs|txt)$/i.test(path));
let combined = "";
for (const path of searchable) combined += `\n/* ${relative(output, path)} */\n${await readFile(path, "utf8")}`;

assert.match(combined, /error\s*:\s*["']gone/);
assert.match(combined, /noindex, nofollow, noarchive/);
assert.doesNotMatch(
  combined,
  /wa\.me|info@bitsolution\.ca|support@bitsolution\.ca|Chatwoot|Turnstile|FORM_AI|CRM_ADAPTER|googletagmanager|google-analytics|clarity\.ms|callrail/i,
);
assert.doesNotMatch(combined, /app-builder\/extensions\.js|external-builder/i);
assert.doesNotMatch(combined, /hostingersite\.com/i);
const ownedOutput = searchable
  .filter((path) => !relative(output, path).includes("_libs"))
  .map((path) => relative(output, path));
assert.ok(ownedOutput.length > 0);

console.log(
  JSON.stringify({
    status: "PASS",
    buildOutput: ".vercel/output",
    serverFunction: "functions/__server.func/index.mjs",
    searchedFiles: searchable.length,
    externalBuilderReferences: 0,
    customerInputElements: 0,
    providerActivations: 0,
  }),
);
