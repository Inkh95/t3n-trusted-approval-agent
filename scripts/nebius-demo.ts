import { evaluateWithT3NNebius } from "../src/nebius/orchestrator.ts";
import { AuditLog } from "../src/audit.ts";

const safeOpportunity = {
  task: {
    id: "demo-docs-100",
    title: "AI-assisted documentation bounty",
    platform: "Demo Marketplace",
    url: "https://example.com/bounties/docs-100",
    reward: { amount: 150, currency: "EUR" },
    payoutMethod: "sepa" as const,
    eligibility: "eligible" as const,
    aiPolicy: "allowed" as const,
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
  description: "Improve the setup guide, add troubleshooting steps, and update examples.",
  payoutSpeed: "FAST" as const,
  competition: "MEDIUM" as const,
  rewardEur: 150,
};

const unsafeOpportunity = {
  task: {
    id: "demo-unsafe-500",
    title: "Unverified high-reward task",
    platform: "Unknown Marketplace",
    url: "https://example.com/tasks/unsafe-500",
    reward: { amount: 500, currency: "EUR" },
    payoutMethod: "unverified" as const,
    eligibility: "unknown" as const,
    aiPolicy: "allowed" as const,
    evidence: ["Reward mentioned in listing but payout terms are unclear"],
    rewardConfirmed: false,
    upfrontCost: 0,
    requiresKyc: true,
    requiresCaptcha: false,
    legalTermsClear: false,
  },
  description: "Large reward with unclear payout, eligibility, and legal terms.",
  payoutSpeed: "UNVERIFIED" as const,
  competition: "UNKNOWN" as const,
  rewardEur: 500,
};

const mockSafe = async () => ({
  summary: "Well-scoped documentation bounty",
  ambiguity: [],
  riskFlags: [],
  acceptanceProbability: 0.8,
  estimatedHours: 2.5,
  rationale: "The task is scoped, AI use is allowed, and payout evidence is clear.",
});

const mockUnsafe = async () => ({
  summary: "Potentially attractive but poorly verified task",
  ambiguity: ["Country eligibility not proven", "Payout route not proven"],
  riskFlags: ["KYC required", "Legal terms unclear"],
  acceptanceProbability: 0.7,
  estimatedHours: 4,
  rationale: "The reward is high, but evidence is insufficient for safe autonomous action.",
});

const audit = new AuditLog();
const useLive = process.env.NEBIUS_API_KEY && process.env.RUN_NEBIUS_MODEL === "1";

const safe = await evaluateWithT3NNebius(
  safeOpportunity,
  useLive ? { audit } : { analyze: mockSafe, audit },
);
const unsafe = await evaluateWithT3NNebius(
  unsafeOpportunity,
  useLive ? { audit } : { analyze: mockUnsafe, audit },
);

console.log(JSON.stringify({
  mode: useLive ? "live-nebius" : "mock",
  safe: {
    title: safeOpportunity.task.title,
    route: safe.route,
    score: safe.economics.finalScore,
    expectedEurPerHour: safe.economics.expectedEurPerHour,
    explanation: safe.explanation,
    auditEventHash: safe.auditEventHash,
  },
  unsafe: {
    title: unsafeOpportunity.task.title,
    route: unsafe.route,
    score: unsafe.economics.finalScore,
    explanation: unsafe.explanation,
    auditEventHash: unsafe.auditEventHash,
  },
  audit: {
    events: audit.list().length,
    valid: audit.verify(),
    chain: audit.list().map((event) => ({ sequence: event.sequence, event: event.event, hash: event.hash, previousHash: event.previousHash })),
  },
}, null, 2));
