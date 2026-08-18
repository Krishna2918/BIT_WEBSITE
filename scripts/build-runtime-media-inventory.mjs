import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourcePath = join(root, "docs", "seo-legacy-media-inventory-2026-08-18.json");
const outputPath = join(root, "docs", "seo-runtime-media-inventory-2026-08-18.json");
const sourceBytes = await readFile(sourcePath);
const source = JSON.parse(sourceBytes.toString("utf8"));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex").toUpperCase();

const media = [];
for (const item of source.media) {
  const pathname = decodeURIComponent(new URL(item.path, source.source_origin).pathname).replace(/^\/+/, "");
  const bytes = await readFile(join(root, "public", pathname));
  media.push({
    path: item.path,
    source_bytes: item.bytes,
    source_sha256: item.sha256,
    runtime_bytes: bytes.length,
    runtime_sha256: sha256(bytes),
    transformed: bytes.length !== item.bytes || sha256(bytes) !== item.sha256,
  });
}

const transformed = media.filter((item) => item.transformed);
const result = {
  schema: "bit.website.runtime-media-inventory:v1",
  source_inventory_path: "docs/seo-legacy-media-inventory-2026-08-18.json",
  source_inventory_sha256: sha256(sourceBytes),
  source_media_count: source.media_count,
  runtime_media_count: media.length,
  unchanged_count: media.length - transformed.length,
  transformed_count: transformed.length,
  transformation: "Five legacy Elementor font CSS resources retain their exact public paths but contain a local system-font compatibility notice, preventing external Hostinger font requests. The immutable source inventory remains preserved separately.",
  media,
};

await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, media: media.length, transformed: transformed.length }));
