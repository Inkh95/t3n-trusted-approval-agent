import { analyzeOpportunityWithNebius, type AnalyzeOpportunityInput, type NebiusReasoning } from "./client.ts";
import { scoreOpportunity, type OpportunityScore, type PayoutSpeed } from "./opportunity-score.ts";
import { prepareTaskAction, type TaskOpportunity, type TaskIntakeResult } from "../task-hunter.ts";

export type CompetitionLevel = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";

export type NebiusOpportunity = {
  task: TaskOpportunity;
  description: string;
  payoutSpeed: PayoutSpeed;
  competition: CompetitionLevel;
  rewardEur: number;
};

export type T3NNebiusDecision = {
  route: "GO" | "REVIEW_REQUIRED" | "NO_GO";
  reasoning: NebiusReasoning;
  policy: TaskIntakeResult;
  economics: OpportunityScore;
  explanation: string[];
};

type AnalyzeFn = (input: AnalyzeOpportunityInput) => Promise<NebiusReasoning>;

function routeDecision(policy: TaskIntakeResult, economics: OpportunityScore): T3NNebiusDecision["route"] {
  if (policy.classification === "AI FORBIDDEN") return "NO_GO";
  if (!economics.eligible || !policy.ready) return "REVIEW_REQUIRED";
  if (!policy.autoApproved) return "REVIEW_REQUIRED";
  return "GO";
}

export async function evaluateWithT3NNebius(
  opportunity: NebiusOpportunity,
  options: { analyze?: AnalyzeFn } = {},
): Promise<T3NNebiusDecision> {
  const policy = prepareTaskAction(opportunity.task);
  const analyze = options.analyze ?? ((input) => analyzeOpportunityWithNebius(input));

  const reasoning = await analyze({
    title: opportunity.task.title,
    description: opportunity.description,
    reward: `${opportunity.task.reward.amount} ${opportunity.task.reward.currency}`,
    eligibilityEvidence: opportunity.task.evidence.filter((x) => /bulgaria|eligib/i.test(x)).join("; ") || "No explicit eligibility evidence supplied",
    payoutEvidence: opportunity.task.evidence.filter((x) => /payout|paypal|sepa|payment/i.test(x)).join("; ") || "No explicit payout evidence supplied",
    aiPolicyEvidence: opportunity.task.evidence.filter((x) => /ai|automation|agent/i.test(x)).join("; ") || "No explicit AI-policy evidence supplied",
  });

  const economics = scoreOpportunity({
    rewardEur: opportunity.rewardEur,
    estimatedHours: reasoning.estimatedHours,
    acceptanceProbability: reasoning.acceptanceProbability,
    payoutSpeed: opportunity.payoutSpeed,
    competition: opportunity.competition,
    aiAllowed: opportunity.task.aiPolicy === "allowed",
    bulgariaEligible: opportunity.task.eligibility === "eligible",
    zeroCost: (opportunity.task.upfrontCost ?? 0) === 0,
    payoutVerified: opportunity.task.payoutMethod === "sepa" || opportunity.task.payoutMethod === "paypal",
  });

  const route = routeDecision(policy, economics);
  const explanation = [
    `Nebius: ${reasoning.rationale}`,
    `Economic score: ${economics.finalScore} (expected EUR/hour ${economics.expectedEurPerHour})`,
    ...(policy.blockers.length ? policy.blockers.map((b) => `Policy blocker: ${b}`) : []),
    ...(economics.blockers.length ? economics.blockers.map((b) => `Economic blocker: ${b}`) : []),
  ];

  return { route, reasoning, policy, economics, explanation };
}
