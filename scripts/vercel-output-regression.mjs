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
const clientConsultAssetNames = (await readdir(join(output, "static", "assets"))).filter((name) =>
  /^consult-form-[A-Za-z0-9_-]+\.js$/u.test(name),
);
assert.equal(clientConsultAssetNames.length, 1, "exactly one client consultation form asset is required");
const clientConsultAsset = await readFile(
  join(output, "static", "assets", clientConsultAssetNames[0]),
  "utf8",
);

const iconRoot = join(output, "static", "brand-icons");
const iconPaths = [
  "bit-mark-v20260818.svg",
  "bit-mark-v20260818-16.png",
  "bit-mark-v20260818-32.png",
  "bit-mark-v20260818-48.png",
  "bit-mark-v20260818.ico",
  "bit-mark-v20260818-180.png",
  "bit-mark-v20260818-192.png",
  "bit-mark-v20260818-512.png",
];
for (const name of iconPaths) {
  assert.equal(await stat(join(iconRoot, name)).then((item) => item.isFile()), true, `${name} must exist`);
}
await assert.rejects(stat(join(output, "static", "favicon.svg")), { code: "ENOENT" });
assert.equal(await stat(join(output, "static", "site-v20260818.webmanifest")).then((item) => item.isFile()), true);

assert.match(combined, /method_not_allowed/);
assert.match(combined, /delivery_not_configured/);
assert.match(combined, /Live AI is not configured/);
assert.match(combined, /openai\/gpt-5\.6-luna/);
assert.doesNotMatch(
  combined,
  /VITE_(?:AI_GATEWAY_API_KEY|VERCEL_OIDC_TOKEN|BIT_PUBLIC_AI_ENABLED|BIT_PUBLIC_AI_MODEL)/i,
);
assert.doesNotMatch(combined, /app-builder\/extensions\.js|external-builder/i);
assert.doesNotMatch(combined, /hostingersite\.com/i);
assert.doesNotMatch(combined, /href:\s*["']\/favicon\.svg["']/i);
assert.match(combined, /bit-mark-v20260818\.svg/);
assert.match(combined, /bit-mark-v20260818-180\.png/);
assert.match(combined, /site-v20260818\.webmanifest/);

const verifyProductionPublicBuild = process.env.BIT_VERIFY_PRODUCTION_PUBLIC_BUILD === "1";
if (verifyProductionPublicBuild) {
  assert.equal(process.env.VITE_TURNSTILE_ENABLED, "true");
  assert.equal(process.env.VITE_TURNSTILE_SITE_KEY, "0x4AAAAAAETHN-YhhbIwjKbD");
  assert.match(clientConsultAsset, /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit/);
  assert.match(clientConsultAsset, /0x4AAAAAAETHN-YhhbIwjKbD/);
  assert.match(clientConsultAsset, /action:\s*[`"']consult[`"']/u);
  assert.match(combined, /bit-gtm-script/);
  assert.match(combined, /www\.googletagmanager\.com\/gtm\.js\?id=/);
  assert.doesNotMatch(combined, /gtm\.start|googletagmanager\.com\/ns\.html/u);
  assert.match(combined, /Content-Security-Policy/);
  assert.match(combined, /https:\/\/www\.googleadservices\.com/);
}

console.log(
  JSON.stringify({
    status: "PASS",
    buildOutput: ".vercel/output",
    serverFunction: "functions/__server.func/index.mjs",
    searchedFiles: searchable.length,
    externalBuilderReferences: 0,
    verifiedBrandIcons: iconPaths.length,
    legacyFaviconPresent: false,
    productionPublicBuild: verifyProductionPublicBuild,
    turnstileCompiled: verifyProductionPublicBuild,
    turnstileAction: verifyProductionPublicBuild ? "consult" : "not asserted",
    imperativeGtmLoader: verifyProductionPublicBuild,
  }),
);
