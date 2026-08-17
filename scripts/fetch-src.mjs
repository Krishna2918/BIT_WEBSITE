import { existsSync, mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";

const APP_TGZ = "https://litter.catbox.moe/gr78lg.tgz";
const OVERLAY_TGZ = "https://litter.catbox.moe/c6l67s.tgz";
const JUNK = [
  "src/lib/multiplayer",
  "server/middleware/00-legacy-static.ts",
  "scripts/edolus.mjs",
  "scripts/fetch-public.mjs",
  "scripts/make-checklists.py",
  "scripts/ms.mjs",
  "scripts/qa-apple.mjs",
];

function sh(cmd) {
  console.log("+", cmd);
  execSync(cmd, { stdio: "inherit" });
}

function fetchTgz(url, dest) {
  sh(`curl -fL --retry 3 --retry-delay 2 -o ${dest} "${url}"`);
  sh(`tar -tzf ${dest} >/dev/null`);
}

fetchTgz(APP_TGZ, "/tmp/bit-src.tgz");
fetchTgz(OVERLAY_TGZ, "/tmp/bit-overlays.tgz");

sh("mkdir -p /tmp/bit-extract && tar -xzf /tmp/bit-src.tgz -C /tmp/bit-extract");
if (existsSync("/tmp/bit-extract/app")) {
  sh("cp -a /tmp/bit-extract/app/. .");
} else {
  sh("cp -a /tmp/bit-extract/. .");
}

sh("tar -xzf /tmp/bit-overlays.tgz -C .");
console.log("overlays applied");

for (const junk of JUNK) {
  if (existsSync(junk)) {
    rmSync(junk, { recursive: true, force: true });
    console.log("removed", junk);
  }
}

sh("npm install");
