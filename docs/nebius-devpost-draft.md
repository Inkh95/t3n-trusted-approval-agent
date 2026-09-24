# T3N Nebius Edition — Devpost Draft

## Project name
T3N Nebius Edition

## Tagline
An auditable AI opportunity copilot that uses Nebius-hosted NVIDIA Nemotron for reasoning while deterministic policy gates control real-world actions.

## Inspiration
AI agents are good at interpreting messy information, but real paid-work decisions involve hard constraints: eligibility, payout verification, AI-use rules, upfront cost, KYC, legal scope, and deadlines. T3N Nebius Edition separates those concerns so the model can reason without getting unilateral authority to act.

## What it does
T3N ingests a normalized paid opportunity, evaluates deterministic safety and eligibility rules, asks NVIDIA Nemotron through Nebius Token Factory to summarize ambiguity and estimate acceptance probability/effort, computes an economic score, and routes the opportunity to GO, REVIEW_REQUIRED, or NO_GO. Every decision is written to a tamper-evident audit chain.

## How we built it
- TypeScript / Node.js
- Nebius Token Factory OpenAI-compatible API
- NVIDIA Nemotron reasoning model
- Zod-validated structured model output
- deterministic T3N policy gate
- expected-value-per-hour scoring with payout-speed and competition adjustments
- append-only SHA-256 hash-chained audit log
- mock inference mode for zero-cost local testing

## Why the architecture matters
The model is never allowed to override hard policy. A persuasive model response cannot make an ineligible, unverified, AI-forbidden, or non-zero-cost task executable. Missing evidence fails closed.

## Demo flow
1. Verified AI-assisted documentation bounty with Bulgaria eligibility, zero cost, confirmed SEPA payout, and clear terms -> GO.
2. Higher-value task with unverified payout, KYC requirement, or unclear legal terms -> REVIEW_REQUIRED.
3. AI-forbidden task -> NO_GO.
4. Audit chain remains valid across all decisions.

## What we learned
The strongest architecture for professional agents is not 'LLM decides everything'. It is a narrow reasoning layer surrounded by deterministic controls, typed evidence, explicit routing, and an audit trail.

## What's next
- live Nebius inference using hackathon credits
- richer marketplace adapters
- persistent evidence snapshots
- judge-facing dashboard for side-by-side opportunity comparison
- exportable audit receipts

## Testing
```bash
npm install
npm test
npm run demo:nebius
```

For live Nebius inference:
```bash
export NEBIUS_API_KEY='<local-key>'
export RUN_NEBIUS_MODEL=1
npm run demo:nebius
```

## Architecture
See `docs/nebius-architecture.svg`.
