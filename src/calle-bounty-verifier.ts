import { CalleClient, type Call } from "@call-e/calle";
import type { TaskOpportunity } from "./task-hunter.ts";

export interface BountyVerificationRequest {
  organizerName: string;
  opportunity: TaskOpportunity;
  recipientPhone: string;
  region?: string;
  locale?: string;
}

export interface BountyVerificationOptions {
  live?: boolean;
  apiKey?: string;
  baseUrl?: string;
  idempotencyKey?: string;
}

export type BountyVerificationStatus =
  | "PREVIEW_ONLY"
  | "CALL_COMPLETED"
  | "CALL_NOT_COMPLETED"
  | "CALL_FAILED";

export interface BountyVerificationResult {
  mode: "dry-run" | "live";
  status: BountyVerificationStatus;
  opportunityId: string;
  organizerName: string;
  callTask: string;
  callId: string | null;
  callStatus: string | null;
  taskCompleted: boolean | null;
  structuredResult: Record<string, unknown> | null;
  evidence: string[];
  failure: string | null;
}

const ALLOWED_CALL_E_BASE_URLS = new Set([
  "https://api.heycall-e.com",
  "https://test-api.heycall-e.com"
]);

/**
 * This contract asks only for public bounty facts. It does not ask for
 * payment credentials, identity documents, account access, or a commitment
 * to claim the opportunity.
 */
export const bountyVerificationResultSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "reward_status",
    "reward_amount",
    "reward_currency",
    "ai_use",
    "eligibility",
    "deadline",
    "payout_method",
    "submission_url",
    "confidence",
    "notes"
  ],
  properties: {
    reward_status: {
      type: "string",
      enum: ["confirmed", "unconfirmed", "contradicted"]
    },
    reward_amount: { type: ["number", "null"] },
    reward_currency: { type: ["string", "null"] },
    ai_use: {
      type: "string",
      enum: ["allowed", "limited", "forbidden", "unknown"]
    },
    eligibility: {
      type: "string",
      enum: ["eligible", "ineligible", "unknown"]
    },
    deadline: { type: ["string", "null"] },
    payout_method: {
      type: "string",
      enum: ["fiat", "crypto", "other", "unknown"]
    },
    submission_url: { type: ["string", "null"] },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"]
    },
    notes: { type: "string" }
  }
} as Record<string, unknown>;

function compact(value: unknown, maxLength = 240): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function assertAuthorizedE164(phone: string): void {
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
    throw new Error("CALL-E recipientPhone must be an E.164 number owned by or authorized to the operator.");
  }
}

function assertRequest(request: BountyVerificationRequest): void {
  assertAuthorizedE164(request.recipientPhone);
  if (!request.opportunity.id || !request.opportunity.title || !request.opportunity.url) {
    throw new Error("A bounty id, title, and HTTPS listing URL are required for verification.");
  }
  if (!request.opportunity.url.startsWith("https://")) {
    throw new Error("The bounty listing URL must use HTTPS.");
  }
}

export function buildBountyVerificationTask(request: BountyVerificationRequest): string {
  assertRequest(request);
  const opportunity = request.opportunity;
  const evidence = opportunity.evidence
    .map((item) => `- ${compact(item, 180)}`)
    .join("\n");

  return [
    "You are a verification-only outbound assistant for a professional task hunter.",
    "Introduce yourself as an automated assistant calling on behalf of the operator.",
    "Speak only with the official organizer or a person authorized to answer for the listing.",
    "Verify public bounty facts; do not claim the task, negotiate, submit anything, or request credentials.",
    "Never ask for passwords, one-time codes, identity documents, bank details, card details, or payment links.",
    "If the person is not authorized, the line is voicemail, or any fact is unclear, record unknown and end politely.",
    "Ask for the confirmed reward amount and currency, whether AI assistance is allowed, country eligibility, deadline, payout method, and the official submission URL.",
    `Organizer: ${compact(request.organizerName, 120)}`,
    `Opportunity: ${compact(opportunity.title, 180)}`,
    `Public listing URL: ${compact(opportunity.url, 240)}`,
    `Currently reported reward: ${compact(opportunity.reward.amount)} ${compact(opportunity.reward.currency, 30)}`,
    `Currently reported payout route: ${compact(opportunity.payoutMethod, 30)}`,
    `Known public evidence:\n${evidence || "- none supplied"}`,
    "Return a structured result using exactly the supplied result schema. Notes must contain only public verification facts."
  ].join("\n");
}

function structuredResult(call: Call): Record<string, unknown> | null {
  return call.recipients[0]?.structuredResult ?? call.structuredResult ?? null;
}

function safeFailure(error: unknown, apiKey: string): string {
  const message = error instanceof Error ? error.message : String(error);
  return compact(message.replaceAll(apiKey, "[redacted-api-key]"), 400);
}

function approvedBaseUrl(options: BountyVerificationOptions): string {
  const baseUrl = options.baseUrl ?? process.env.CALLE_BASE_URL ?? "https://api.heycall-e.com";
  if (!ALLOWED_CALL_E_BASE_URLS.has(baseUrl)) {
    throw new Error("CALL-E base URL must be an approved HTTPS CALL-E origin.");
  }
  return baseUrl;
}

function liveResult(request: BountyVerificationRequest, callTask: string, call: Call): BountyVerificationResult {
  const completed = call.status === "completed";
  return {
    mode: "live",
    status: completed ? "CALL_COMPLETED" : "CALL_NOT_COMPLETED",
    opportunityId: request.opportunity.id,
    organizerName: compact(request.organizerName, 120),
    callTask,
    callId: call.id,
    callStatus: call.status,
    taskCompleted: call.taskCompleted,
    structuredResult: structuredResult(call),
    evidence: call.evidence.map((item) => compact(item, 300)),
    failure: completed ? call.failureMessage : compact(call.failureMessage ?? "CALL-E did not reach a terminal completed state.", 400)
  };
}

export async function verifyBountyByCall(
  request: BountyVerificationRequest,
  options: BountyVerificationOptions = {}
): Promise<BountyVerificationResult> {
  const callTask = buildBountyVerificationTask(request);
  const baseResult = {
    opportunityId: request.opportunity.id,
    organizerName: compact(request.organizerName, 120),
    callTask,
    callId: null,
    callStatus: null,
    taskCompleted: null,
    structuredResult: null,
    evidence: [],
    failure: null
  } satisfies Omit<BountyVerificationResult, "mode" | "status">;

  if (options.live !== true) {
    return { ...baseResult, mode: "dry-run", status: "PREVIEW_ONLY" };
  }

  const apiKey = options.apiKey ?? process.env.CALLE_API_KEY;
  if (!apiKey) {
    throw new Error("Live CALL-E verification requires CALLE_API_KEY. Run the default dry-run first.");
  }

  const client = new CalleClient({
    apiKey,
    baseUrl: approvedBaseUrl(options)
  });

  try {
    const call = await client.calls.createAndWait(
      {
        task: callTask,
        recipient: {
          phones: [request.recipientPhone],
          region: request.region,
          locale: request.locale
        },
        recipientResultSchema: bountyVerificationResultSchema,
        metadata: {
          workflow: "t3n-trusted-approval-agent",
          purpose: "public-bounty-verification",
          opportunity_id: request.opportunity.id
        }
      },
      { idempotencyKey: options.idempotencyKey ?? `bounty-screen:${request.opportunity.id}` }
    );
    return liveResult(request, callTask, call);
  } catch (error) {
    return {
      ...baseResult,
      mode: "live",
      status: "CALL_FAILED",
      failure: safeFailure(error, apiKey)
    };
  }
}
