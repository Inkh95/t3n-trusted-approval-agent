# T3N Nebius Edition — Hackathon Build Plan

## Goal

Turn T3N into an AI opportunity copilot that can rank, explain, and safely prepare real paid online work opportunities while preserving deterministic approval gates.

## Hackathon angle

Use Nebius-hosted NVIDIA Nemotron inference for the reasoning layer, while keeping eligibility, payout, cost, and policy constraints deterministic and auditable.

## Core workflow

1. Ingest a normalized paid-task opportunity.
2. Validate hard requirements: AI allowed, Bulgaria eligible, zero cost, payout verified.
3. Ask the Nebius/Nemotron reasoning layer to summarize the task, identify ambiguity, estimate execution risk, and explain evidence.
4. Compute a deterministic economic score based on acceptance probability × reward ÷ effort, adjusted by payout speed and competition.
5. Route the task to GO, REVIEW_REQUIRED, or NO_GO.
6. Log every decision in the existing hash-chained audit trail.

## MVP milestones

### M1 — deterministic scoring
- Opportunity scoring engine
- Fast-payout preference
- Competition adjustment
- Fail-closed blockers
- Unit tests

### M2 — Nebius model adapter
- Environment-based Nebius API configuration
- Nemotron prompt contract
- Strict JSON response validation
- No secrets committed to Git
- Graceful offline/mock mode for tests

### M3 — agent orchestration
- Combine T3N policy gate + Nebius reasoning + economic score
- Produce machine-readable decision object
- Add evidence and explanation fields

### M4 — demo
- One high-quality eligible opportunity
- One unsafe/unverified opportunity
- Show why one proceeds and the other is blocked
- Show audit-log integrity

### M5 — Devpost packaging
- Updated README
- Architecture diagram
- Public demo
- Short video
- Submission write-up

## Safety principles

- Model reasoning never overrides deterministic policy.
- Missing payout evidence means REVIEW_REQUIRED.
- No CAPTCHA bypass, fake identity, fake traffic, geolocation spoofing, or unauthorized security testing.
- No automatic submission where platform rules require a human declaration.
- Never log credentials, payment details, personal documents, or API secrets.

## Environment variables planned

- `NEBIUS_API_KEY`
- `NEBIUS_BASE_URL`
- `NEBIUS_MODEL`

No paid API is required for development if official hackathon credits are available; tests must run without external network access.

## Success criteria

- Existing T3N tests remain green.
- New scoring tests pass.
- Nebius adapter returns validated structured output.
- Demo works with a mock mode and with real Nebius credentials when supplied locally.
- Submission clearly demonstrates practical professional value, technical implementation, and safe agent behavior.
