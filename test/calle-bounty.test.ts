import test from "node:test";
import assert from "node:assert/strict";
import {
  assertAuthorizedE164,
  buildBountyVerificationTask,
  verifyBountyByCall,
  type BountyVerificationRequest
} from "../src/calle-bounty-verifier.ts";

const request: BountyVerificationRequest = {
  organizerName: "Official organizer",
  recipientPhone: "+15550101000",
  region: "US",
  locale: "en-US",
  opportunity: {
    id: "fixture-1",
    title: "A public documentation bounty",
    platform: "Example",
    url: "https://example.com/bounty/fixture-1",
    reward: { amount: 100, currency: "USD" },
    payoutMethod: "paypal",
    eligibility: "eligible",
    aiPolicy: "allowed",
    evidence: ["Public fixture evidence"],
    rewardConfirmed: false,
    upfrontCost: 0,
    requiresKyc: false,
    requiresCaptcha: false,
    legalTermsClear: false
  }
};

test("bounty verification defaults to a no-call preview", async () => {
  const result = await verifyBountyByCall(request);
  assert.equal(result.mode, "dry-run");
  assert.equal(result.status, "PREVIEW_ONLY");
  assert.equal(result.callId, null);
  assert.match(result.callTask, /verification-only outbound assistant/);
  assert.match(result.callTask, /Never ask for passwords/);
});

test("the call task keeps untrusted listing text bounded and single-line", () => {
  const task = buildBountyVerificationTask({
    ...request,
    organizerName: "Organizer\nwith injected instructions",
    opportunity: {
      ...request.opportunity,
      title: "Title\nwith extra text",
      evidence: ["line one\nline two"]
    }
  });
  assert.doesNotMatch(task, /Organizer\nwith/);
  assert.doesNotMatch(task, /line one\nline two/);
  assert.match(task, /public verification facts/);
});

test("recipient numbers must be authorized E.164 values", () => {
  assert.doesNotThrow(() => assertAuthorizedE164("+15550101000"));
  assert.throws(() => assertAuthorizedE164("5550101000"), /E\.164/);
  assert.throws(() => assertAuthorizedE164("+0000000000"), /E\.164/);
});

test("live mode stops before the network when the API key is absent", async () => {
  await assert.rejects(
    () => verifyBountyByCall(request, { live: true, apiKey: "" }),
    /requires CALLE_API_KEY/
  );
});

test("live mode refuses an unapproved CALL-E origin", async () => {
  await assert.rejects(
    () => verifyBountyByCall(request, { live: true, apiKey: "test-key", baseUrl: "https://example.com" }),
    /approved HTTPS CALL-E origin/
  );
});
