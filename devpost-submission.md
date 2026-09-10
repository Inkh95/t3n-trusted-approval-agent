# Title

T3N Trusted Approval Agent

## One-line Summary

A guarded professional agent that verifies paid work opportunities, rejects unsafe or unverifiable tasks, and starts only eligible zero-cost work under a standing human policy.

## Problem

Independent professionals lose time checking fragmented task marketplaces, verifying whether rewards and eligibility are real, and deciding whether a task is safe to claim. Blind automation is dangerous: it can accept unclear legal terms, expose credentials, trigger payments, or claim work that cannot be completed.

## Solution

T3N combines a task hunter with an approval gateway and tamper-evident audit log. Each opportunity is normalized, evaluated against explicit evidence, and either rejected, escalated for review, or claimed under the user's standing approval. The agent fails closed when reward, geography, AI-use permission, payout safety, or zero-cost execution cannot be verified.

## Why This Matters

The system gives solo professionals more reach without surrendering control. It automates repetitive discovery and verification while preserving human authority over consequential or ambiguous actions.

## How We Used AI

The project uses the Strands Agents TypeScript SDK with two typed tools: `evaluate_paid_task` and `start_eligible_task`. The model can reason about a listing and invoke the workflow, but it cannot bypass deterministic policy. Tool calls prohibit fabricated claims, CAPTCHA solving, credential collection, KYC handling, payments, or starting a task with missing evidence.

## How We Used Codex

Codex inspected the existing safety gateway, integrated the Strands SDK, designed the typed tool boundary, added the standing-approval rule, expanded task-evidence validation, wrote tests, ran the end-to-end demo, and published the verified implementation to GitHub.

## Key Features

- Evidence-based task screening for AI permission, confirmed reward, Bulgarian eligibility, zero upfront cost, legal clarity, and safe payout.
- Deterministic fail-closed policy beneath the AI layer.
- Standing approval for `task.claim` only after all hard gates pass.
- Explicit review path for ambiguity or elevated risk.
- Hash-chained audit records with integrity verification.
- Safe demo covering both an accepted SEPA task and a blocked KYC/crypto task.

## Architecture

Marketplace adapters feed normalized opportunities into the Strands agent. Its typed evaluation tool calls the deterministic task hunter. Eligible work proceeds through the trusted approval gateway to a claim action; anything ambiguous stops at review. Every decision is appended to the audit chain.

Architecture diagram file: `docs/t3n-architecture.png` (to be generated and attached to the Devpost draft).

## Testing Instructions

```bash
npm install
npm run check
npm run demo:strands
```

Expected result: six tests pass. The verified zero-cost SEPA example reaches `CLAIMED`; the unconfirmed KYC/crypto example reaches `REVIEW_REQUIRED`; the audit chain reports valid.

Optional live-model run (requires configured AWS credentials and model access):

```bash
RUN_STRANDS_MODEL=1 npm run demo:strands
```

## Public Demo Link

https://t3n-trusted-approval-agent.kostovdobromir.chatgpt.site

The repository CLI demo remains the reproducible fallback.

## Public Repository Link

https://github.com/Inkh95/t3n-trusted-approval-agent

## Demo Video

https://www.youtube.com/watch?v=A1Q3XWMUlsA

The 89-second, 1920×1080 demo is published as Unlisted. Its reproducible source file remains at `docs/t3n-demo.mp4`.

Outline:

1. The problem: fragmented paid tasks and unsafe blind automation.
2. The audience: independent professionals and small operators.
3. Show a verified opportunity reaching `CLAIMED`.
4. Show a risky opportunity stopping at `REVIEW_REQUIRED`.
5. Show the policy result and valid audit chain.
6. Explain why deterministic approval beneath Strands matters.

## Screenshot Shot List

1. Repository README and setup instructions.
2. Passing six-test output.
3. Safe demo result: `CLAIMED` and `revolut_sepa`.
4. Risky demo result: `REVIEW_REQUIRED` with blockers.
5. Architecture diagram.

## Submission Readiness Notes

Working now: Strands SDK integration, typed tools, deterministic policy, standing approval, safe task workflow, audit chain, tests, CLI demo, public repository, and a configured public demo URL.

Still required before final Devpost submission: attach the architecture PNG to the Devpost file field and add the AWS Builder ID. The repository contains an MIT license and the required demo video is live as Unlisted.

## Known Limitations

- Marketplace-specific claiming remains adapter-dependent.
- CAPTCHA, credentials, KYC, purchases, and unclear legal terms always require a human or are denied.
- The default demo is deterministic; live model invocation requires AWS model credentials.
- No hosted UI or AgentCore deployment yet.

## TODO Official Form Fields

- Submitter Type (27729): Individual
- Country of Residence (27730): Bulgaria
- Organization (27731): not applicable
- Track (27732): Professional Agents
- Public repo (27733): https://github.com/Inkh95/t3n-trusted-approval-agent
- Architecture diagram (27734): ready at `docs/t3n-architecture.png`; TODO attach to Devpost
- AWS Builder ID (27735): TODO user-provided ID
- Demo video: https://www.youtube.com/watch?v=A1Q3XWMUlsA (Unlisted)
- Optional live demo (27736): https://t3n-trusted-approval-agent.kostovdobromir.chatgpt.site
- Testing instructions (28191): use the commands above
- Optional builder.aws.com post (27737): TODO if created
