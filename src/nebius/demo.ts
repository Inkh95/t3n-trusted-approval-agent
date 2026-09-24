import { AuditLog } from "../audit.ts";
import { evaluateWithT3NNebius } from "./orchestrator.ts";

const goodReasoning = async () => ({
  summary: "Well-scoped documentation bounty",
  ambiguity: [],
  riskFlags: [],
  acceptanceProbability: 0.8,
  estimatedHours: 2.5,
  rationale: "Clear scope, explicit AI permission, verified payout, and low delivery risk.",
});

const riskyReasoning = async () => ({
  summary: "High-value task with incomplete payout and identity requirements",
  ambiguity: ["Payout route is not verified", "Legal/IP terms are incomplete"],
  riskFlags: ["KYC_REQUIRED", "PAYOUT_UNVERIFIED"],
  acceptanceProbability: 0.65,
  estimatedHours: 4,
  rationale: "Reward is attractive, but required evidence is incomplete and policy should stop execution.",
});

export async function runNebiusDemo(audit = new AuditLog()) {
  const safe = await evaluateWithT3NNebius({
    task: {
      id: "demo-safe-docs",
      title: "AI-assisted documentation bounty",
      platform: "Demo Marketplace",
      url: "https://example.com/bounties/docs-150",
      reward: { amount: 150, currency: "EUR" },
      payoutMethod: "sepa",
      eligibility: "eligible",
      aiPolicy: "allowed",
      evidence: [
        "Bulgaria eligible",
        "SEPA payout confirmed",
        "AI assistance explicitly allowed",
        "Reward officially confirmed",
      ],
      rewardConfirmed: true,
      upfrontCost: 0,
      requiresKyc: false,
      requiresCaptcha: false,
      legalTermsClear: true,
    },
    description: "Improve setup docs, troubleshooting, and code examples.",
    payoutSpeed: "FAST",
    competition: "MEDIUM",
    rewardEur: 150,
  }, { analyze: goodReasoning, audit });

  const unsafe = await evaluateWithT3NNebius({
    task: {
      id: "demo-risky-500",
      title: "Unverified high-value task",
      platform: "Demo Marketplace",
      url: "https://example.com/tasks/risky-500",
      reward: { amount: 500, currency: "EUR" },
      payoutMethod: "unverified",
      eligibility: "eligible",
      aiPolicy: "allowed",
      evidence: ["Bulgaria eligible", "Reward advertised as 500 EUR"],
      rewardConfirmed: true,
      upfrontCost: 0,
      requiresKyc: true,
      requiresCaptcha: false,
      legalTermsClear: false,
    },
    description: "Complete an unspecified automation task with identity verification.",
    payoutSpeed: "UNVERIFIED",
    competition: "UNKNOWN",
    rewardEur: 500,
  }, { analyze: riskyReasoning, audit });

  return {
    safe,
    unsafe,
    audit: { valid: audit.verify(), events: audit.list() },
  };
}
