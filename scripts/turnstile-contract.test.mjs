import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Turnstile environment, browser widget, and server verification use one exact action", async () => {
  const [environment, client, server] = await Promise.all([
    readFile(new URL(".env.example", root), "utf8"),
    readFile(new URL("src/components/site/turnstile.tsx", root), "utf8"),
    readFile(new URL("src/routes/api/consult.ts", root), "utf8"),
  ]);

  const environmentAction = environment.match(
    /^FORM_AI_TURNSTILE_EXPECTED_ACTION=([^\r\n]+)$/mu,
  )?.[1];
  const clientAction = client.match(/action:\s*"([^"]+)"/u)?.[1];

  assert.equal(environmentAction, "consult");
  assert.equal(clientAction, environmentAction);
  assert.match(server, /env\("FORM_AI_TURNSTILE_EXPECTED_ACTION"\)/u);
  assert.match(server, /result\.action !== expectedAction/u);
});
