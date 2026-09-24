export type PayoutSpeed = "INSTANT" | "SAME_DAY" | "FAST" | "STANDARD" | "UNVERIFIED";

export type OpportunityScoreInput = {
  rewardEur: number;
  estimatedHours: number;
  acceptanceProbability: number;
  payoutSpeed: PayoutSpeed;
  competition: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  aiAllowed: boolean;
  bulgariaEligible: boolean;
  zeroCost: boolean;
  payoutVerified: boolean;
};

export type OpportunityScore = {
  eligible: boolean;
  expectedValueEur: number;
  expectedEurPerHour: number;
  payoutMultiplier: number;
  competitionMultiplier: number;
  finalScore: number;
  blockers: string[];
};

const payoutMultiplier: Record<PayoutSpeed, number> = {
  INSTANT: 1.2,
  SAME_DAY: 1.15,
  FAST: 1.08,
  STANDARD: 1,
  UNVERIFIED: 0,
};

const competitionMultiplier = {
  LOW: 1.1,
  MEDIUM: 1,
  HIGH: 0.8,
  UNKNOWN: 0.9,
} as const;

export function scoreOpportunity(input: OpportunityScoreInput): OpportunityScore {
  const blockers: string[] = [];
  if (!input.aiAllowed) blockers.push("AI_NOT_ALLOWED");
  if (!input.bulgariaEligible) blockers.push("BULGARIA_NOT_ELIGIBLE");
  if (!input.zeroCost) blockers.push("NON_ZERO_COST");
  if (!input.payoutVerified || input.payoutSpeed === "UNVERIFIED") blockers.push("PAYOUT_UNVERIFIED");
  if (!(input.rewardEur > 0)) blockers.push("INVALID_REWARD");
  if (!(input.estimatedHours > 0)) blockers.push("INVALID_EFFORT");
  if (input.acceptanceProbability < 0 || input.acceptanceProbability > 1) blockers.push("INVALID_ACCEPTANCE_PROBABILITY");

  const eligible = blockers.length === 0;
  const expectedValueEur = Math.max(0, input.rewardEur) * Math.min(1, Math.max(0, input.acceptanceProbability));
  const expectedEurPerHour = input.estimatedHours > 0 ? expectedValueEur / input.estimatedHours : 0;
  const pMult = payoutMultiplier[input.payoutSpeed];
  const cMult = competitionMultiplier[input.competition];
  const finalScore = eligible ? expectedEurPerHour * pMult * cMult : 0;

  return {
    eligible,
    expectedValueEur: Number(expectedValueEur.toFixed(2)),
    expectedEurPerHour: Number(expectedEurPerHour.toFixed(2)),
    payoutMultiplier: pMult,
    competitionMultiplier: cMult,
    finalScore: Number(finalScore.toFixed(2)),
    blockers,
  };
}
