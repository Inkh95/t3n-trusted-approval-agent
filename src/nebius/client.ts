import { z } from "zod";

const NebiusReasoningSchema = z.object({
  summary: z.string().min(1),
  ambiguity: z.array(z.string()).default([]),
  riskFlags: z.array(z.string()).default([]),
  acceptanceProbability: z.number().min(0).max(1),
  estimatedHours: z.number().positive(),
  rationale: z.string().min(1),
});

export type NebiusReasoning = z.infer<typeof NebiusReasoningSchema>;

export type AnalyzeOpportunityInput = {
  title: string;
  description: string;
  reward: string;
  eligibilityEvidence: string;
  payoutEvidence: string;
  aiPolicyEvidence: string;
};

const DEFAULT_BASE_URL = "https://api.tokenfactory.us-central1.nebius.com/v1";
const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b";

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return JSON.parse(trimmed);
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Nebius response did not contain JSON");
  return JSON.parse(trimmed.slice(start, end + 1));
}

export async function analyzeOpportunityWithNebius(
  input: AnalyzeOpportunityInput,
  options: { apiKey?: string; baseUrl?: string; model?: string; fetchImpl?: typeof fetch } = {},
): Promise<NebiusReasoning> {
  const apiKey = options.apiKey ?? process.env.NEBIUS_API_KEY;
  if (!apiKey) throw new Error("NEBIUS_API_KEY is required for live Nebius inference");

  const baseUrl = (options.baseUrl ?? process.env.NEBIUS_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const model = options.model ?? process.env.NEBIUS_MODEL ?? DEFAULT_MODEL;
  const fetchImpl = options.fetchImpl ?? fetch;

  const system = [
    "You are the reasoning layer inside T3N, a guarded agent for evaluating paid online work.",
    "Do not decide whether to claim or submit work. Deterministic policy does that separately.",
    "Return JSON only with keys: summary, ambiguity, riskFlags, acceptanceProbability, estimatedHours, rationale.",
    "Use acceptanceProbability as a number from 0 to 1 and estimatedHours as a positive number.",
  ].join(" ");

  const response = await fetchImpl(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(input) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Nebius inference failed (${response.status}): ${body.slice(0, 500)}`);
  }

  const payload = await response.json() as any;
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Nebius response missing message content");

  return NebiusReasoningSchema.parse(extractJson(content));
}

export const NEBIUS_DEFAULTS = {
  baseUrl: DEFAULT_BASE_URL,
  model: DEFAULT_MODEL,
};
