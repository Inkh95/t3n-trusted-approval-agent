import { verifyBountyByCall, type BountyVerificationRequest } from "../src/calle-bounty-verifier.ts";

const live = process.argv.includes("--live");
const recipientPhone = process.env.CALLE_RECIPIENT_PHONE;

if (live && !recipientPhone) {
  throw new Error("Live mode requires CALLE_RECIPIENT_PHONE in E.164 format for a number owned by or authorized to the operator.");
}

const request: BountyVerificationRequest = {
  organizerName: process.env.CALLE_ORGANIZER_NAME ?? "Demo Bounty Organizer",
  recipientPhone: recipientPhone ?? "+15550101000",
  region: process.env.CALLE_REGION ?? "US",
  locale: process.env.CALLE_LOCALE ?? "en-US",
  opportunity: {
    id: "demo-public-api-bounty",
    title: "Document an open-source API",
    platform: "Demo Bounty Board",
    url: "https://example.com/tasks/demo-public-api-bounty",
    reward: { amount: 50, currency: "EUR" },
    payoutMethod: "sepa",
    eligibility: "eligible",
    aiPolicy: "allowed",
    evidence: ["Demo fixture only: reward and eligibility must be verified with the official organizer."],
    rewardConfirmed: false,
    upfrontCost: 0,
    requiresKyc: false,
    requiresCaptcha: false,
    legalTermsClear: false
  }
};

const result = await verifyBountyByCall(request, { live });
console.log(JSON.stringify(result, null, 2));
