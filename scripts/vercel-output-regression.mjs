import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, "$1"));
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

assert.match(combined, /method_not_allowed/);
assert.match(combined, /delivery_not_configured/);
assert.match(combined, /Live AI is not configured/);
assert.match(combined, /openai\/gpt-5\.6-luna/);
assert.doesNotMatch(
  combined,
  /VITE_(?:AI_GATEWAY_API_KEY|VERCEL_OIDC_TOKEN|BIT_PUBLIC_AI_ENABLED|BIT_PUBLIC_AI_MODEL)/i,
);
assert.doesNotMatch(combined, /grok\.com\/grok-app-builder|grok-app-builder\/extensions\.js/i);

console.log(
  JSON.stringify({
    status: "PASS",
    buildOutput: ".vercel/output",
    serverFunction: "functions/__server.func/index.mjs",
    searchedFiles: searchable.length,
    externalBuilderReferences: 0,
    measurementActivation: "verified by rendered-response smoke with empty preview IDs",
  }),
);
