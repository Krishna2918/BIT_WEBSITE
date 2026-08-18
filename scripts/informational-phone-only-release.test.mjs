import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (path) => readFile(join(root, path), "utf8");

async function walk(dir) {
  const paths = [];
  for (const entry of await readdir(join(root, dir), { withFileTypes: true })) {
    const relative = join(dir, entry.name);
    if (entry.isDirectory()) paths.push(...(await walk(relative)));
    else if (entry.isFile()) paths.push(relative);
  }
  return paths;
}

async function runtimeSource() {
  const files = (await Promise.all(["src", "server", "public"].map(walk))).flat();
  const searchable = files.filter((path) => /\.(?:css|html|js|json|mjs|ts|tsx|txt|xml)$/i.test(path));
  return (await Promise.all(searchable.map(async (path) => `\n/* ${path} */\n${await read(path)}`))).join("");
}

async function missing(path) {
  try {
    await access(join(root, path));
    return false;
  } catch {
    return true;
  }
}

const componentRemovals = [
  "src/components/site/tracking.tsx",
  "src/components/site/cookie-consent.tsx",
  "src/components/site/ask-ai.tsx",
  "src/components/site/consult-form.tsx",
  "src/components/site/turnstile.tsx",
];

const libraryRemovals = [
  "src/lib/tracking.ts",
  "src/lib/consent.ts",
  "src/lib/chatwoot.ts",
  "src/lib/public-assistant.ts",
  "src/lib/public-assistant.server.ts",
  "src/lib/consult-contract.ts",
  "src/lib/consult-intake-schema.ts",
  "src/lib/form-ai-payload.server.ts",
  "src/lib/onboarding-contract.ts",
];

test("interactive hooks and widgets are physically removed", async () => {
  for (const path of componentRemovals) assert.equal(await missing(path), true, path);
});

test("provider and customer-intake libraries are physically removed", async () => {
  for (const path of libraryRemovals) assert.equal(await missing(path), true, path);
});

test("continuation and thank-you workflow routes are removed", async () => {
  for (const path of ["src/routes/consult_.continue.tsx", "src/routes/thank-you.tsx"]) {
    assert.equal(await missing(path), true, path);
  }
});

for (const [name, path] of [
  ["consult page", "src/routes/consult.tsx"],
  ["fleet page", "src/routes/fleet-operations.ontario.tsx"],
  ["dental page", "src/routes/dental-it.ontario.tsx"],
  ["navigation", "src/components/site/site-nav.tsx"],
  ["footer", "src/components/site/site-footer.tsx"],
  ["support page", "src/routes/support.tsx"],
  ["home page", "src/routes/index.tsx"],
]) {
  test(`${name} exposes phone contact only`, async () => {
    const source = await read(path);
    assert.match(source, /SITE\.phoneHref/);
    assert.doesNotMatch(source, /mailto:|wa\.me|WhatsApp|ConsultForm|AskAi|Chatwoot|Turnstile|track\(/i);
  });
}

test("root shell contains no tracking, consent, chat, help, or email JSON-LD", async () => {
  const source = await read("src/routes/__root.tsx");
  assert.doesNotMatch(source, /TrackingHooks|CookieConsent|AskAiChat|HelpSheet|email:/);
  assert.match(source, /telephone: SITE\.phoneTel/);
});

test("both API routes are constant Gone endpoints", async () => {
  for (const path of ["src/routes/api/consult.ts", "src/routes/api/assistant.ts"]) {
    const source = await read(path);
    assert.match(source, /status: 410/);
    assert.match(source, /GET: gone/);
    assert.match(source, /POST: gone/);
  }
});

test("Gone APIs never read request bodies, environment, or network", async () => {
  for (const path of ["src/routes/api/consult.ts", "src/routes/api/assistant.ts"]) {
    const source = await read(path);
    assert.doesNotMatch(source, /\brequest\b|process\.env|import\.meta\.env|fetch\s*\(|request\.(?:json|text)\s*\(/);
  }
});

test("Gone APIs have no application or provider imports", async () => {
  for (const path of ["src/routes/api/consult.ts", "src/routes/api/assistant.ts"]) {
    const imports = [...(await read(path)).matchAll(/^import .+ from ["']([^"']+)["'];?$/gm)].map((m) => m[1]);
    assert.deepEqual(imports, ["@tanstack/react-router"]);
  }
});

test("Gone APIs emit noindex and no-store", async () => {
  const source = await read("src/routes/api/consult.ts");
  assert.match(source, /"Cache-Control": "no-store"/);
  assert.match(source, /"X-Robots-Tag": "noindex, nofollow, noarchive"/);
});

test("CSP defaults every load to self", async () => {
  const config = JSON.parse(await read("vercel.json"));
  const csp = config.headers[0].headers.find((entry) => entry.key === "Content-Security-Policy").value;
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /connect-src 'self'/);
});

test("CSP disables all form submissions", async () => {
  const config = JSON.parse(await read("vercel.json"));
  const csp = config.headers[0].headers.find((entry) => entry.key === "Content-Security-Policy").value;
  assert.match(csp, /form-action 'none'/);
});

test("CSP disables frames and contains no external origin", async () => {
  const config = JSON.parse(await read("vercel.json"));
  const csp = config.headers[0].headers.find((entry) => entry.key === "Content-Security-Policy").value;
  assert.match(csp, /frame-src 'none'/);
  assert.doesNotMatch(csp, /https?:|wss?:|\*/);
});

test("indexing allowlist contains only the exact canonical hosts", async () => {
  const [source, middleware] = await Promise.all([read("src/lib/site.ts"), read("server/middleware/indexing.ts")]);
  assert.match(source, /\["bitsolution\.ca", "www\.bitsolution\.ca"\]/);
  assert.doesNotMatch(source, /vercel\.app|localhost|127\.0\.0\.1/);
  assert.match(middleware, /new Set\(\["bitsolution\.ca", "www\.bitsolution\.ca"\]\)/);
  assert.doesNotMatch(middleware, /vercel\.app|localhost|127\.0\.0\.1/);
});

test("indexing needs both an explicit flag and exact hostname", async () => {
  const [source, consult] = await Promise.all([read("src/lib/site.ts"), read("src/routes/consult.tsx")]);
  assert.match(source, /VITE_SITE_INDEXABLE === "1"/);
  assert.match(source, /CANONICAL_PUBLIC_HOSTS\.includes/);
  assert.match(source, /VITE_PUBLIC_HOSTNAME/);
  assert.match(consult, /rel: "canonical", href: `\$\{SITE\.url\}\/consult`/);
  assert.match(consult, /SITE_INDEXABLE \? "index,follow" : "noindex,nofollow,noarchive"/);
  assert.match(source, /Every preview, Vercel, or unknown host stays noindex/);
});

test("environment template exposes only hostname and indexing controls", async () => {
  const lines = (await read(".env.example")).split(/\r?\n/).filter((line) => /^[A-Z0-9_]+=/.test(line));
  assert.deepEqual(lines, ["VITE_PUBLIC_HOSTNAME=", "VITE_SITE_INDEXABLE=0"]);
});

test("privacy notice declares the owner-approved phone-only scope", async () => {
  const source = await read("src/routes/privacy.tsx");
  assert.match(source, /owner-approved release is informational and phone-only/);
});

test("privacy notice identifies Vercel and Cloudflare limited metadata processing", async () => {
  const source = await read("src/routes/privacy.tsx");
  assert.match(source, /Vercel and Cloudflare may process limited IP address, request, and security metadata/);
});

test("privacy notice discloses possible processing outside Canada", async () => {
  assert.match(await read("src/routes/privacy.tsx"), /outside Canada/);
});

test("privacy notice states phone-only and call recording off", async () => {
  const source = await read("src/routes/privacy.tsx");
  assert.match(source, /Phone inquiries/);
  assert.match(source, /call recording is off/);
});

test("privacy notice contains the exact officer address and phone", async () => {
  const source = await read("src/routes/privacy.tsx");
  assert.match(source, /Privacy Officer, BIT Solution/);
  assert.match(source, /373 Steeles Ave W, Brampton, Ontario L6Y 0P8/);
  assert.match(source, /SITE\.phoneDisplay/);
});

test("privacy notice keeps qualified review pending", async () => {
  assert.match(await read("src/routes/privacy.tsx"), /qualified Privacy and Legal review is still pending/);
});

test("accessibility statement makes WCAG 2.0 AA mandatory", async () => {
  const [source, rootRoute, styles] = await Promise.all([
    read("src/data/legacy-pages.ts"),
    read("src/routes/__root.tsx"),
    read("src/styles.css"),
  ]);
  assert.match(source, /WCAG 2\.0 Level AA as a mandatory launch standard/);
  assert.match(source, /regardless of employee threshold/);
  assert.match(rootRoute, /className="skip-link" href="#main"/);
  assert.match(styles, /overflow-x: clip/);
  assert.match(styles, /img,\s+video,\s+canvas,\s+svg \{\s+max-width: 100%/);
});

test("runtime TSX contains no customer-input elements", async () => {
  const files = await walk("src");
  const tsx = (await Promise.all(files.filter((path) => path.endsWith(".tsx")).map(read))).join("\n");
  assert.doesNotMatch(tsx, /<(?:form|input|textarea|select)\b/i);
});

test("runtime source contains no removed channel or provider marker", async () => {
  const source = await runtimeSource();
  assert.doesNotMatch(source, /mailto:|wa\.me|support@bitsolution\.ca|info@bitsolution\.ca|Chatwoot|Turnstile|FORM_AI|CRM_ADAPTER|googletagmanager|google-analytics|clarity\.ms|callrail/i);
});

test("runtime source contains no consent storage", async () => {
  const source = await runtimeSource();
  assert.doesNotMatch(source, /localStorage|sessionStorage|cookie preferences|consent_granted|consent_denied/i);
});

test("public downloads contain no retired service email", async () => {
  const source = await runtimeSource();
  assert.doesNotMatch(source, /info@bitsolution\.ca|support@bitsolution\.ca|mailto:/i);
});

test("package has no form, AI-provider, or schema dependency", async () => {
  const pkg = JSON.parse(await read("package.json"));
  for (const name of ["@hookform/resolvers", "react-hook-form", "ai", "zod"]) {
    assert.equal(name in pkg.dependencies, false, name);
  }
});

test("retired workflow paths are server-side Gone targets", async () => {
  const source = await read("server/middleware/legacy-gone.ts");
  assert.match(source, /"\/consult\/continue"/);
  assert.match(source, /"\/thank-you"/);
});

test("robots excludes retired workflow and API paths", async () => {
  const robots = await read("public/robots.txt");
  for (const path of ["/thank-you", "/consult/continue", "/api/"]) {
    assert.match(robots, new RegExp(`Disallow: ${path.replace(/[.*+?^$()|[\]{}\\]/g, "\\$&")}`));
  }
});

test("structured data has phone and no email field", async () => {
  const source = await read("src/routes/__root.tsx");
  assert.match(source, /telephone: SITE\.phoneTel/);
  assert.doesNotMatch(source, /\bemail\s*:/);
});

test("approved phone number is consistent in site and privacy contact", async () => {
  const [site, privacy] = await Promise.all([read("src/lib/site.ts"), read("src/routes/privacy.tsx")]);
  assert.match(site, /phoneDisplay: "\+1 905-867-6574"/);
  assert.match(site, /phoneHref: "tel:\+19058676574"/);
  assert.match(privacy, /SITE\.phoneHref/);
});
