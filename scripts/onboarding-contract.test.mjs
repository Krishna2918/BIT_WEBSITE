import assert from "node:assert/strict";
import test from "node:test";

import {
  AMEETA_COORDINATOR_KEY,
  ONBOARDING_MESSAGE_POLICY,
  ONBOARDING_SERVICE_MESSAGE_BODY,
  ONBOARDING_SERVICE_MESSAGE_SUBJECT,
  buildContinuationPath,
  continuationPathHasNoPii,
  isOpaqueContinuationToken,
} from "../src/lib/onboarding-contract.ts";

test("Ameeta onboarding stays a service message and remains queued", () => {
  assert.equal(AMEETA_COORDINATOR_KEY, "ameeta");
  assert.equal(ONBOARDING_SERVICE_MESSAGE_SUBJECT, "Help us understand your needs");
  assert.match(ONBOARDING_SERVICE_MESSAGE_BODY, /Ameeta understand your needs/);
  assert.match(ONBOARDING_SERVICE_MESSAGE_BODY, /not a marketing subscription/);
  assert.equal(ONBOARDING_MESSAGE_POLICY.marketing_content_allowed, false);
  assert.equal(ONBOARDING_MESSAGE_POLICY.auto_call_allowed, false);
  assert.equal(ONBOARDING_MESSAGE_POLICY.provider_worker_default, "OFF");
});

test("continuation links carry only an opaque capability token", () => {
  const token = "A".repeat(32);
  const path = buildContinuationPath(token);
  assert.equal(path, `/consult/continue?token=${token}`);
  assert.equal(isOpaqueContinuationToken(token), true);
  assert.equal(continuationPathHasNoPii(path), true);
  assert.equal(continuationPathHasNoPii("/consult/continue?email=test@example.com"), false);
  assert.throws(() => buildContinuationPath("short"), /invalid continuation token/);
});
