import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, "$1"));
const inventory = JSON.parse(
  await readFile(join(root, "docs", "seo-legacy-media-inventory-2026-08-18.json"), "utf8"),
);
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex").toUpperCase();

const results = await Promise.all(inventory.media.map(async (item) => {
  const url = new URL(item.path, inventory.source_origin);
  const response = await fetch(url, {
    headers: { "User-Agent": "BIT-Website-Legacy-Media-Preservation/1.0" },
    signal: AbortSignal.timeout(20_000),
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || bytes.length !== item.bytes || sha256(bytes) !== item.sha256) {
    throw new Error(`legacy media integrity mismatch: ${item.path}`);
  }
  const destination = join(root, "public", decodeURIComponent(url.pathname).replace(/^\/+/, ""));
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return { path: url.pathname, bytes: bytes.length, sha256: item.sha256 };
}));

const uniquePaths = new Set(results.map((item) => item.path));
if (uniquePaths.size !== inventory.media_count) {
  throw new Error(`expected ${inventory.media_count} unique media paths; got ${uniquePaths.size}`);
}
console.log(JSON.stringify({
  status: "PASS",
  materialized: results.length,
  bytes: results.reduce((sum, item) => sum + item.bytes, 0),
  root: join(root, "public", "wp-content", "uploads"),
}));
