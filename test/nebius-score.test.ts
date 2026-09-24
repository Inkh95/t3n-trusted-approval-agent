import test from "node:test";
import assert from "node:assert/strict";
import { scoreOpportunity } from "../src/nebius/opportunity-score.ts";

test("scores a verified fast opportunity", () => {
  const result = scoreOpportunity({
    rewardEur: 120,
    estimatedHours: 2,
    acceptanceProbability: 0.7,
    payoutSpeed: "FAST",
    competition: "MEDIUM",
    aiAllowed: true,
    bulgariaEligible: true,
    zeroCost: true,
    payoutVerified: true,
  });

  assert.equal(result.eligible, true);
  assert.equal(result.expectedValueEur, 84);
  assert.equal(result.expectedEurPerHour, 42);
  assert.equal(result.finalScore, 45.36);
  assert.deepEqual(result.blockers, []);
});

test("fails closed when payout is unverified", () => {
  const result = scoreOpportunity({
    rewardEur: 500,
    estimatedHours: 4,
    acceptanceProbability: 0.8,
    payoutSpeed: "UNVERIFIED",
    competition: "LOW",
    aiAllowed: true,
    bulgariaEligible: true,
    zeroCost: true,
    payoutVerified: false,
  });

  assert.equal(result.eligible, false);
  assert.equal(result.finalScore, 0);
  assert.ok(result.blockers.includes("PAYOUT_UNVERIFIED"));
});

test("fails closed when AI is forbidden", () => {
  const result = scoreOpportunity({
    rewardEur: 80,
    estimatedHours: 1,
    acceptanceProbability: 0.9,
    payoutSpeed: "SAME_DAY",
    competition: "LOW",
    aiAllowed: false,
    bulgariaEligible: true,
    zeroCost: true,
    payoutVerified: true,
  });

  assert.equal(result.eligible, false);
  assert.equal(result.finalScore, 0);
  assert.ok(result.blockers.includes("AI_NOT_ALLOWED"));
});
