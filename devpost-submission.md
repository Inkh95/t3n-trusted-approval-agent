# Title

T3N Nebius Edition

## One-line Summary

An auditable opportunity copilot that uses Nebius-hosted NVIDIA Nemotron for reasoning while deterministic policy gates control real-world actions.

## Problem

AI agents can interpret messy paid-work listings, but blindly automating real-world decisions is unsafe. Eligibility, payout, AI-use rules, upfront cost, KYC, legal scope, and acceptance likelihood all need evidence—not model confidence.

## Solution

T3N separates reasoning from authority. NVIDIA Nemotron 3 Super on Nebius Token Factory analyzes ambiguity, risk, effort, and acceptance probability. A deterministic gate independently verifies hard constraints, an economic scorer ranks eligible work, and a hash-chained audit log records the final `GO`, `REVIEW_REQUIRED`, or `NO_GO` route.

## Why This Matters

Independent professionals can use AI to find and prioritize real opportunities without surrendering control over consequential actions. Missing or conflicting evidence fails closed, and model optimism can never override policy.

## How We Used AI

The app calls NVIDIA Nemotron 3 Super through Nebius Token Factory's OpenAI-compatible API. A prompt requests structured reasoning; Zod validates every response before it can influence scoring. The model estimates acceptance probability and effort and flags ambiguity, while deterministic code remains the sole authorization layer.

## How We Used Codex

Codex inspected the existing approval gateway, implemented the Nebius adapter and structured-output boundary, added economic scoring and three-way routing, expanded tests, diagnosed and fixed CI, built the judge demo, and prepared the Devpost package. Credentials, declarations, and final submission remain human-controlled.

## Key Features

- Schema-validated Nebius/Nemotron reasoning.
- Deterministic checks for AI permission, Bulgaria eligibility, zero cost, verified payout, confirmed reward, KYC/CAPTCHA, and legal clarity.
- Expected-value-per-hour ranking adjusted for payout speed and competition.
- Explicit `GO`, `REVIEW_REQUIRED`, and `NO_GO` routes.
- Tamper-evident SHA-256 audit chain.
- Reproducible mock demo plus opt-in live inference.

## Architecture

`Opportunity -> T3N policy gate -> Nebius/Nemotron reasoning -> economic score -> route -> audit chain`

Diagram: `docs/nebius-architecture.svg`.

## Testing Instructions

```bash
npm ci
npm run check
npm run demo:nebius
```

Expected: 16 tests pass; a verified SEPA opportunity routes to `GO`; an unverified KYC opportunity routes to `REVIEW_REQUIRED`; the two-event audit chain is valid.

Optional authenticated inference:

```bash
NEBIUS_API_KEY='<local-key>' RUN_NEBIUS_MODEL=1 npm run demo:nebius
```

## Public Demo Link

https://t3n-trusted-approval-agent.kostovdobromir.chatgpt.site

TODO: verify that the deployed build exposes the Nebius judge demo. Local/API fallback: `npm start`, then `GET /api/nebius/demo`.

## Public Repository Link

https://github.com/Inkh95/t3n-trusted-approval-agent/tree/nebius-hackathon

## Demo Video

TODO: Record and upload the Nebius-specific 60–75 second script in `docs/nebius-demo-video-script.md` as a public YouTube video (maximum 3 minutes).

## Screenshot Shot List

1. Dashboard before the judge demo.
2. Verified opportunity routed to `GO` with its score.
3. Risky opportunity routed to `REVIEW_REQUIRED` with blockers.
4. Raw structured reasoning and policy result.
5. Valid audit chain plus architecture diagram.

## Submission Readiness Notes

Working now: adapter, schema validation, deterministic policy, scoring, routing, audit chain, 16 tests, CLI/API demo, public repository, MIT license, architecture asset, and judge walkthrough.

Remaining: authenticated live inference, honest mandatory platform feedback, a public Nebius-specific YouTube demo, deployed-build verification, and personal confirmation of the age/employee declarations.

## Known Limitations

- Marketplace-specific execution remains adapter-dependent.
- CAPTCHA, credentials, KYC, purchases, and unclear terms require a human or are denied.
- Mock inference is the zero-cost default; live inference requires a local Token Factory key.
- The existing hosted demo may lag behind this branch until redeployed.

## TODO Official Form Fields

- 28261 Submitter Type: `Individual`
- 28262 Organization Name: `N/A`
- 28265 Country: `Bulgaria`
- 28266 Canada province: `N/A`
- 28267 Track: `Best apps and agents`
- 28268 Existing before August 26, 2026: `Existing`
- 28269 Significant update: Added a Nebius Token Factory adapter for NVIDIA Nemotron 3 Super, schema-validated reasoning, economic scoring, three-way routing, a judge-facing API/UI demo, expanded tests, CI, architecture documentation, and a Nebius-specific submission package.
- 28270 Repository: https://github.com/Inkh95/t3n-trusted-approval-agent/tree/nebius-hackathon
- 28271 Demo: https://t3n-trusted-approval-agent.kostovdobromir.chatgpt.site — TODO verify deployed Nebius flow.
- 28272 Model: NVIDIA Nemotron 3 Super 120B A12B, selected for strong reasoning with a smaller active-parameter footprint than an ultra-scale model.
- 28273 Output quality rating: TODO after authenticated live inference; never infer this from mocked output.
- 28274 Approach: Prompt-engineered structured JSON output with Zod validation; no fine-tuning.
- 28275 Comparison with other models: TODO after authenticated live inference.
- 28276 Nebius capabilities: Token Factory's OpenAI-compatible hosted API; TODO add observed latency/reliability after authenticated inference. No dedicated GPU instance or autoscaling deployment is claimed.
- 28277 Recommendation rating: TODO after authenticated live inference.
- 28278 Cloud/local experience rating: TODO after authenticated live inference.
- 28279 Improvement request (draft): richer request tracing, per-model latency/cost telemetry, and clearer model-version lifecycle metadata.
- 28280 Nemotron wish (draft): smaller low-latency reasoning variants with equally reliable structured-output adherence.
- 28282 Tavily: `No`
- 28281 Builders & Brews city: leave blank unless personally attended.
- 28283 Age declaration: PERSONAL CONFIRMATION REQUIRED.
- 28284 Employee declaration: PERSONAL CONFIRMATION REQUIRED.

Official deadline: October 30, 2026 at 17:00 UTC. Final submission is not authorized yet.
