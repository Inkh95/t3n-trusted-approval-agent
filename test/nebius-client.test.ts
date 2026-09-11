import test from "node:test";
import assert from "node:assert/strict";
import { analyzeOpportunityWithNebius, NEBIUS_DEFAULTS } from "../src/nebius/client.ts";

test("parses validated structured reasoning from Nebius-compatible response", async () => {
  let requestedUrl = "";
  const fakeFetch: typeof fetch = (async (url: any, init?: any) => {
    requestedUrl = String(url);
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Authorization, "Bearer test-key");
    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: JSON.stringify({
            summary: "Small documentation bounty",
            ambiguity: [],
            riskFlags: [],
            acceptanceProbability: 0.75,
            estimatedHours: 1.5,
            rationale: "Clear scope and low implementation risk",
          }),
        },
      }],
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;

  const result = await analyzeOpportunityWithNebius({
    title: "Docs bounty",
    description: "Improve setup guide",
    reward: "$100",
    eligibilityEvidence: "Bulgaria allowed",
    payoutEvidence: "PayPal confirmed",
    aiPolicyEvidence: "AI allowed",
  }, { apiKey: "test-key", fetchImpl: fakeFetch });

  assert.equal(requestedUrl, `${NEBIUS_DEFAULTS.baseUrl}/chat/completions`);
  assert.equal(result.acceptanceProbability, 0.75);
  assert.equal(result.estimatedHours, 1.5);
});

test("fails when live inference has no API key", async () => {
  await assert.rejects(
    analyzeOpportunityWithNebius({
      title: "x",
      description: "x",
      reward: "$20",
      eligibilityEvidence: "x",
      payoutEvidence: "x",
      aiPolicyEvidence: "x",
    }, { apiKey: "" }),
    /NEBIUS_API_KEY/,
  );
});
