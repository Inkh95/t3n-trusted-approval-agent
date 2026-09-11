import { evaluateWithT3NNebius } from "../src/nebius/orchestrator.ts";

const opportunity = {
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

const mock = async () => ({
  summary: "Well-scoped documentation bounty",
  ambiguity: [],
  riskFlags: [],
  acceptanceProbability: 0.8,
  estimatedHours: 2.5,
  rationale: "The task is scoped, AI use is allowed, and payout evidence is clear.",
});

const useLive = process.env.NEBIUS_API_KEY && process.env.RUN_NEBIUS_MODEL === "1";
const result = await evaluateWithT3NNebius(opportunity, useLive ? {} : { analyze: mock });
console.log(JSON.stringify({ mode: useLive ? "live-nebius" : "mock", ...result }, null, 2));
