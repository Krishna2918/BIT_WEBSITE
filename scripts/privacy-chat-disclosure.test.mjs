import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const privacy = await readFile(
  new URL("../src/routes/privacy.tsx", import.meta.url),
  "utf8",
);

test("privacy notice discloses AI processing, categories, processors, and human handoff", () => {
  assert.match(privacy, /Ask AI and human live chat/u);
  assert.match(privacy, /submitted chat text and limited technical\s+routing information/u);
  assert.match(privacy, /website-hosting provider, approved AI Gateway and model\s+processing providers/u);
  assert.match(privacy, /through Chatwoot/u);
  assert.match(privacy, /review the conversation, reply, and take over/u);
  assert.match(privacy, /not for\s+marketing reuse/u);
  assert.match(privacy, /Do not enter passwords, access codes, tokens, private keys, payment or\s+health information, client records/u);
});

test("chat disclosure defers exact retention to Privacy without unsupported model-use claims", () => {
  assert.match(privacy, /exact legal retention period remain subject to the approved privacy policy/u);
  assert.match(privacy, /will not be activated until Privacy approves those terms/u);
  const disclosure = privacy.split("Ask AI and human live chat", 2)[1]?.split("Cookies and measurement", 1)[0] ?? "";
  assert.doesNotMatch(disclosure, /\b(?:days?|months?|years?)\b/iu);
  assert.doesNotMatch(disclosure, /\btrain(?:ed|ing)?\b|improve (?:the )?model|model development/iu);
});
