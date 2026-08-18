import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function pngDimensions(bytes) {
  assert.ok(bytes.subarray(0, 8).equals(PNG_SIGNATURE));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test("every document and PWA icon references the cache-safe official mark family", () => {
  const rootRoute = read("src/routes/__root.tsx");
  const manifest = JSON.parse(read("public/site-v20260818.webmanifest"));

  assert.doesNotMatch(rootRoute, /href: "\/favicon\.svg"/u);
  assert.match(rootRoute, /bit-mark-v20260818\.svg/u);
  assert.match(rootRoute, /bit-mark-v20260818-32\.png/u);
  assert.match(rootRoute, /bit-mark-v20260818-16\.png/u);
  assert.match(rootRoute, /bit-mark-v20260818\.ico/u);
  assert.match(rootRoute, /bit-mark-v20260818-180\.png/u);
  assert.match(rootRoute, /site-v20260818\.webmanifest/u);
  assert.deepEqual(
    manifest.icons.map((icon) => [icon.src, icon.sizes, icon.type]),
    [
      ["/brand-icons/bit-mark-v20260818-192.png", "192x192", "image/png"],
      ["/brand-icons/bit-mark-v20260818-512.png", "512x512", "image/png"],
    ],
  );
  assert.doesNotMatch(JSON.stringify(manifest), /vercel\.app|127\.0\.0\.1|localhost/u);
});

test("generated raster icons exist at their declared square dimensions", () => {
  for (const size of [16, 32, 48, 180, 192, 512]) {
    const path = `public/brand-icons/bit-mark-v20260818-${size}.png`;
    const bytes = readFileSync(new URL(path, root));
    assert.deepEqual(pngDimensions(bytes), { width: size, height: size });
    assert.equal(extname(path), ".png");
  }

  const svg = read("public/brand-icons/bit-mark-v20260818.svg");
  assert.match(svg, /^<svg[^>]+viewBox="0 0 128 128"/u);
  assert.match(svg, /data:image\/png;base64,/u);

  const ico = readFileSync(new URL("public/brand-icons/bit-mark-v20260818.ico", root));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.ok(ico.readUInt16LE(4) >= 3);
});

test("icon generator is bound only to the official production header mark", () => {
  const generator = read("scripts/generate-brand-icons.py");
  assert.match(generator, /public" \/ "images" \/ "bit-mark-official\.png"/u);
  assert.doesNotMatch(generator, /\b(?:requests|httpx|urlopen|urllib)\b/u);
});
