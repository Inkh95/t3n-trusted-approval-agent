# Agents for Humans: Building T3N, a Guarded Strands Agent for Paid Work

Independent professionals increasingly use AI to discover freelance work, open-source bounties, contests, and other paid opportunities. The obvious next step is automation: let an agent find a task, verify it, and start working.

The problem is that blind automation is dangerous.

A task can look legitimate while hiding an entry fee, an unsupported payout method, unclear legal terms, a KYC requirement, or a rule that forbids AI-generated work. A model can also sound more certain than the evidence deserves. For real-world actions, that is not good enough.

That is the problem T3N is designed to solve.

## What T3N does

T3N is a guarded professional agent built with the Strands Agents SDK. It helps evaluate paid online work while keeping a deterministic policy layer underneath the model.

Instead of allowing the LLM to decide everything directly, the system normalizes each opportunity into explicit evidence fields such as:

- reward amount and official confirmation
- Bulgaria eligibility
- AI/automation policy
- zero-cost participation
- payout route
- KYC or CAPTCHA requirements
- legal clarity and scope

The Strands agent can reason about the listing, but it cannot bypass the hard safety gates.

If all required evidence is present, the task can proceed under a narrow standing approval. If anything important is missing or risky, T3N fails closed and returns REVIEW_REQUIRED.

## Why Strands Agents fits this architecture

Strands gives the agent a clean tool boundary. In the current implementation, the model works through two typed tools:

1. `evaluate_paid_task`
2. `start_eligible_task`

The first tool validates the evidence. The second can only start a task if the same evidence still satisfies the deterministic policy.

This separation matters because the model is useful for interpretation, but policy should remain explicit, testable, and auditable.

## The safety boundary

T3N blocks or escalates actions involving:

- fabricated reward claims
- CAPTCHA bypass
- credential collection
- KYC handling
- payments or deposits
- unclear contracts
- tasks with missing eligibility evidence

The system also writes every decision into a tamper-evident hash-chained audit log.

That means the agent is not just useful; it is inspectable.

## A simple working demo

The demo shows two contrasting cases.

The first is a fully verified zero-cost task with confirmed SEPA payout, AI permission, Bulgarian eligibility, and no KYC requirement. That case passes every gate and reaches CLAIMED in the local simulation.

The second task has an unconfirmed reward, crypto payout, and KYC requirement. It stops at REVIEW_REQUIRED before any external action is allowed.

This behavior is intentional. The goal is not to maximize automation at all costs. The goal is to automate the repetitive parts while preserving human authority over ambiguous or consequential decisions.

## Why this matters for professionals

Independent workers spend a surprising amount of time not doing the actual paid work. They search, compare, verify, read rules, inspect payout terms, and decide whether an opportunity is worth pursuing.

A good agent can reduce that overhead dramatically. But if it is allowed to overreach, the productivity gain can quickly turn into financial or legal risk.

T3N is an attempt to find the useful middle ground: autonomous research and preparation, deterministic approval gates, and explicit escalation when evidence is incomplete.

## Current implementation

The public MVP includes:

- TypeScript and Node.js
- Strands Agents SDK
- typed evaluation and guarded-start tools
- deterministic standing-approval policy
- HMAC-SHA256 approval binding
- append-only SHA-256 audit chain
- runnable tests and demo commands
- a public live demo

The repository is MIT licensed and includes setup instructions, architecture assets, and a demo script.

## What I would improve next

The production version should add transactional persistence for pending actions, stronger external identity verification, richer marketplace adapters, and deployment of sensitive execution paths inside a trusted execution environment.

The important principle would stay the same: the model can reason, but it should not be able to silently override explicit safety policy.

## Links

- Project: https://devpost.com/software/t3n-trusted-approval-agent
- Live demo: https://t3n-trusted-approval-agent.kostovdobromir.chatgpt.site
- Source: https://github.com/Inkh95/t3n-trusted-approval-agent
