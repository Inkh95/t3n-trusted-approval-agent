# Nebius × NVIDIA Submission Readiness

This checklist is the source of truth for what is technically complete versus what still requires external hackathon access or a human-only action.

## Build status

- [x] Nebius/NVIDIA reasoning adapter implemented.
- [x] Deterministic T3N policy gate remains authoritative.
- [x] Economic scoring implemented (reward × acceptance probability ÷ effort, adjusted for payout speed and competition).
- [x] GO / REVIEW_REQUIRED / NO_GO routing implemented.
- [x] Tamper-evident audit events written for opportunity decisions.
- [x] Zero-cost mocked judge demo implemented.
- [x] Judge-facing dashboard and `/api/nebius/demo` endpoint implemented.
- [x] Architecture diagram committed.
- [x] Judge walkthrough committed.
- [x] Demo video script committed.
- [x] CI validates tests and demo flow.
- [x] Safe `.env.example` committed; no real secrets in repository.

## Live-inference readiness

- [x] Live Nebius path is isolated behind `RUN_NEBIUS_MODEL=1`.
- [x] Live mode requires `NEBIUS_API_KEY` and fails closed if it is absent.
- [x] Model output is schema-validated before use.
- [ ] Obtain/activate hackathon Nebius credits and a valid API key.
- [ ] Run one live inference smoke test with credits.
- [ ] Record the live smoke-test result without exposing the key.

## Devpost package

- [x] Project title/tagline concept prepared.
- [x] Full write-up draft prepared.
- [x] Built-with stack prepared.
- [x] Public GitHub repository available.
- [x] Architecture asset available.
- [ ] Confirm the user's Nebius hackathon registration through Devpost connector.
- [ ] Fetch current submission requirements and judging criteria.
- [ ] Create/update the Devpost project record.
- [ ] Add a real publicly playable demo video URL if required.
- [ ] Add a live demo URL if required or strategically useful.
- [ ] Complete every required custom submission field.
- [ ] Before final submission, present the finished project to the user for the explicit final approval required by the standing workflow.
- [ ] Mark SUBMITTED only after Devpost returns an actual Submitted status.

## Human-only / protected actions

The agent must stop for the user when any of these are required:

- CAPTCHA or anti-bot challenge
- KYC, tax forms, government ID, or other personal documents
- credentials or secrets that cannot be handled through an authorized connector
- legal declarations the agent cannot independently verify
- the final Devpost submission approval required by the user's workflow

## Judge proof points

1. The reasoning model can estimate ambiguity, risk, acceptance probability, and effort.
2. The model cannot override deterministic eligibility/safety policy.
3. Unverified payout or risky terms fail closed even when nominal reward is high.
4. Verified opportunities are ranked economically only after policy passes.
5. Every route is recorded in a hash-chained audit trail.
6. The default demo is reproducible with zero paid infrastructure or API spend.
