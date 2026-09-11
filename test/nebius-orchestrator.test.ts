import test from "node:test";
import assert from "node:assert/strict";
import { evaluateWithT3NNebius } from "../src/nebius/orchestrator.ts";

const safeTask = {
  id: "docs-1",
  title: "Documentation bounty",
  platform: "Example",
  url: "https://example.com/task/1",
  reward: { amount: 120, currency: "EUR" },
  payoutMethod: "sepa" as const,
  eligibility: "eligible" as const,
  aiPolicy: "allowed" as const,
  evidence: ["Bulgaria eligible", "SEPA payout confirmed", "AI assistance allowed"],
  rewardConfirmed: true,
  upfrontCost: 0,
  requiresKyc: false,
  requiresCaptcha: false,
  legalTermsClear: true,
};

const mockReasoning = async () => ({
  summary: "Clear documentation bounty",
  ambiguity: [],
  riskFlags: [],
  acceptanceProbability: 0.75,
  estimatedHours: 2,
  rationale: "Clear scope and verified evidence",
});

test("routes a fully verified opportunity to GO", async () => {
  const result = await evaluateWithT3NNebius({
    task: safeTask,
    description: "Improve the installation guide",
    payoutSpeed: "FAST",
    competition: "MEDIUM",
    rewardEur: 120,
  }, { analyze: mockReasoning });

  assert.equal(result.policy.autoApproved, true);
  assert.equal(result.economics.eligible, true);
  assert.equal(result.route, "GO");
  assert.equal(result.economics.expectedEurPerHour, 45);
});

test("routes unverified payout to REVIEW_REQUIRED even when model likes the task", async () => {
  const result = await evaluateWithT3NNebius({
    task: { ...safeTask, payoutMethod: "unverified" as const },
    description: "Improve the installation guide",
    payoutSpeed: "UNVERIFIED",
    competition: "LOW",
    rewardEur: 120,
  }, { analyze: mockReasoning });

  assert.equal(result.route, "REVIEW_REQUIRED");
  assert.equal(result.policy.autoApproved, false);
  assert.ok(result.economics.blockers.includes("PAYOUT_UNVERIFIED"));
});

test("routes AI-forbidden work to NO_GO", async () => {
  const result = await evaluateWithT3NNebius({
    task: { ...safeTask, aiPolicy: "forbidden" as const },
    description: "Human-only writing task",
    payoutSpeed: "FAST",
    competition: "LOW",
    rewardEur: 120,
  }, { analyze: mockReasoning });

  assert.equal(result.route, "NO_GO");
  assert.equal(result.policy.classification, "AI FORBIDDEN");
});
