import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import meta from "../src/data/legacy-media.json" with { type: "json" };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const uploads = join(root, meta.localRoot);

const IGNORE = new Set([".gitkeep", ".DS_Store"]);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (IGNORE.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

export function inventoryMedia() {
  const files = walk(uploads).sort();
  const items = files.map((file) => {
    const buf = readFileSync(file);
    return {
      path: `/${relative(join(root, "public"), file)}`,
      bytes: buf.length,
      sha256: createHash("sha256").update(buf).digest("hex"),
      readable: buf.length > 0,
    };
  });
  return {
    expectedCount: meta.expectedCount,
    filesOnDisk: items.length,
    status: items.length === meta.expectedCount ? "READY" : "BLOCKED",
    reason: items.length === meta.expectedCount ? "" : meta.reason,
    items,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = inventoryMedia();
  writeFileSync(
    join(root, "docs/legacy-media-inventory.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify({ status: report.status, expected: report.expectedCount, onDisk: report.filesOnDisk }));
}
