import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, "$1"));
const read = (path, encoding = "utf8") => readFile(join(root, path), encoding);
const normalize = (path) => path === "/" ? "/" : path.replace(/\/+$/, "");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex").toUpperCase();

test("authoritative 42-row map is complete and mutually exclusive", async () => {
  const map = JSON.parse(await read("docs/seo-migration-route-map-2026-08-18.json"));
  assert.equal(map.baseline_sitemap_rows, 42);
  assert.deepEqual(map.assertion_counts, {
    preserve_200: 10,
    redirect_301: 21,
    gone_410_noindex: 11,
  });
  assert.equal(new Set(map.current_sitemap_rows.map((row) => row.source)).size, 42);
  assert.equal(map.internally_linked_legacy_aliases.length, 13);
  assert.equal(map.wp_sitemap_compatibility.length, 9);
  assert.equal(map.rules.preserve_query_strings, true);
  assert.equal(map.host_normalization.maximum_hops, 1);
});

test("preserved legacy pages have owned routes, exact canonicals, H1 content, and sitemap membership", async () => {
  const map = JSON.parse(await read("docs/seo-migration-route-map-2026-08-18.json"));
  const sitemap = await read("public/sitemap.xml");
  for (const row of map.current_sitemap_rows.filter((item) => item.action === "preserve_200")) {
    if (row.source === "/") continue;
    const name = row.source.replace(/^\/+|\/+$/g, "");
    const source = await read(`src/routes/${name}.tsx`);
    assert.match(source, /<Legacy(?:Preserved|Insight)Page/);
    assert.match(source, new RegExp(`\\$\\{SITE\\.url\\}\\/${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/`));
    assert.match(sitemap, new RegExp(`<loc>https:\\/\\/bitsolution\\.ca\\/${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/<\\/loc>`));
  }
  const [home, preserved, insight] = await Promise.all([
    read("src/routes/index.tsx"),
    read("src/components/site/legacy-preserved-page.tsx"),
    read("src/components/site/legacy-insight-page.tsx"),
  ]);
  assert.match(home, /<h1[\s\S]*BIT Solution — technology solutions for Ontario businesses[\s\S]*<\/h1>/);
  assert.match(home, /<img[\s\S]*alt=""/);
  assert.match(preserved, /<h1/);
  assert.match(insight, /<h1/);
});

test("redirect layer is 301-only, covers slash variants, query-safe, and has no target chain", async () => {
  const [config, map] = await Promise.all([
    read("vercel.json").then(JSON.parse),
    read("docs/seo-migration-route-map-2026-08-18.json").then(JSON.parse),
  ]);
  const pathRedirects = config.redirects.filter((item) => !item.has);
  const bySource = new Map(pathRedirects.map((item) => [item.source, item]));
  assert.equal(bySource.size, pathRedirects.length);
  for (const redirect of config.redirects) {
    assert.equal(redirect.statusCode, 301);
    assert.equal("permanent" in redirect, false);
    assert.doesNotMatch(redirect.source, /\?/);
    assert.doesNotMatch(redirect.destination, /\?/);
  }
  for (const row of map.current_sitemap_rows.filter((item) => item.action === "redirect_301")) {
    assert.equal(bySource.get(row.source)?.destination, row.destination, `missing exact redirect ${row.source}`);
    const noSlash = normalize(row.source);
    if (noSlash !== row.source && !["/support", "/thank-you"].includes(noSlash)) {
      assert.equal(bySource.get(noSlash)?.destination, row.destination, `missing slash variant ${noSlash}`);
    }
  }
  for (const row of [...map.internally_linked_legacy_aliases, ...map.wp_sitemap_compatibility]) {
    assert.equal(bySource.get(row.source)?.destination, row.destination, `missing alias ${row.source}`);
  }
  const redirectSources = new Set(pathRedirects.map((item) => item.source));
  for (const redirect of pathRedirects) {
    assert.equal(redirectSources.has(redirect.destination), false, `redirect chain: ${redirect.source}`);
  }
});

test("retired artifacts are real server-side 410/noindex targets", async () => {
  const [map, middleware] = await Promise.all([
    read("docs/seo-migration-route-map-2026-08-18.json").then(JSON.parse),
    read("server/middleware/legacy-gone.ts"),
  ]);
  const goneRows = map.current_sitemap_rows.filter((item) => item.action === "gone_410_noindex");
  assert.equal(goneRows.length, 11);
  for (const row of goneRows) {
    const url = new URL(row.source, "https://bitsolution.ca");
    if (url.search) assert.match(middleware, new RegExp([...url.searchParams.keys()][0]));
    else assert.match(middleware, new RegExp(url.pathname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\/$/, "")));
  }
  assert.match(middleware, /event\.res\.status = 410/);
  assert.match(middleware, /X-Robots-Tag.*noindex, nofollow, noarchive/s);
});

test("robots and canonical sitemap preserve policy without redirected or gone entries", async () => {
  const [robots, sitemap, map, rootRoute] = await Promise.all([
    read("public/robots.txt"),
    read("public/sitemap.xml"),
    read("docs/seo-migration-route-map-2026-08-18.json").then(JSON.parse),
    read("src/routes/__root.tsx"),
  ]);
  assert.match(robots, /^Content-Signal: search=yes,ai-train=no,use=reference$/m);
  for (const bot of ["Amazonbot", "Applebot-Extended", "Bytespider", "CCBot", "ClaudeBot", "CloudflareBrowserRenderingCrawler", "Google-Extended", "GPTBot", "meta-externalagent"]) {
    assert.match(robots, new RegExp(`User-agent: ${bot}\\nDisallow: /`));
  }
  assert.match(robots, /Disallow: \/wp-admin\/\nAllow: \/wp-admin\/admin-ajax\.php/);
  assert.match(robots, /Sitemap: https:\/\/bitsolution\.ca\/sitemap\.xml/);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.every((url) => url.startsWith("https://bitsolution.ca/")));
  for (const row of map.current_sitemap_rows.filter((item) => item.action !== "preserve_200")) {
    assert.equal(urls.includes(`https://bitsolution.ca${row.source}`), false, `non-200 sitemap entry ${row.source}`);
  }
  assert.match(rootRoute, /"@type": "ProfessionalService"/);
});

test("all 233 linked WordPress media paths remain materialized with source evidence and runtime hashes", async () => {
  const inventoryBytes = await read("docs/seo-legacy-media-inventory-2026-08-18.json", null);
  const inventory = JSON.parse(inventoryBytes.toString("utf8"));
  const runtime = JSON.parse(await read("docs/seo-runtime-media-inventory-2026-08-18.json"));
  assert.equal(sha256(inventoryBytes), "C4265233C215AE66BBAD41C40CC6B7EDBCE4437C12C4016CC3F4F6880168DF33");
  assert.equal(inventory.media_count, 233);
  assert.equal(inventory.media.reduce((sum, item) => sum + item.bytes, 0), 24_981_741);
  assert.equal(runtime.source_inventory_sha256, sha256(inventoryBytes));
  assert.equal(runtime.runtime_media_count, 233);
  assert.equal(runtime.unchanged_count, 228);
  assert.equal(runtime.transformed_count, 5);
  for (const item of inventory.media) {
    const pathname = decodeURIComponent(new URL(item.path, inventory.source_origin).pathname).replace(/^\/+/, "");
    const runtimeItem = runtime.media.find((entry) => entry.path === item.path);
    assert.ok(runtimeItem, item.path);
    for (const prefix of ["public", ".vercel/output/static"]) {
      const bytes = await read(`${prefix}/${pathname}`, null);
      assert.equal(bytes.length, runtimeItem.runtime_bytes, `${prefix}/${pathname}`);
      assert.equal(sha256(bytes), runtimeItem.runtime_sha256, `${prefix}/${pathname}`);
    }
  }
});

test("sealed Cloudflare rollback snapshot identity is unchanged", async () => {
  const snapshot = "C:/Users/Administrator/Documents/BIT_OS/runtime/phase3/workspaces/departments/website/evidence/CLOUDFLARE_PRE_CUTOVER_ROLLBACK_SNAPSHOT_2026-08-18.json";
  const bytes = await readFile(snapshot);
  assert.equal(bytes.length, 2265);
  assert.equal(sha256(bytes), "3507AE8FA1BEB5D48D0ADF814490C7404474E77D67B1B2C8E85C9DAD9D095C64");
  assert.equal((await stat(snapshot)).isFile(), true);
});
