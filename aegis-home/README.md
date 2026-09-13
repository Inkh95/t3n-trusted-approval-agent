# Aegis Home

Aegis Home is a simulated Alexa+ agentic experience for the **Build, Ship, Shape: Amazon Developer Hackathon**.

It turns natural-language household requests into transparent action plans, classifies consequential actions, and requires explicit user confirmation before security, safety, or financial state changes. Every decision is exposed in a concise audit trail.

## Why this exists

Agentic assistants become more useful when they can act, but actions increase the cost of silent mistakes. Aegis Home explores a simple interaction contract:

1. Understand the request.
2. Build a visible plan.
3. Classify every action by risk.
4. Require explicit approval for consequential actions.
5. Record why the system acted.

## Hackathon track

- Primary: **Alexa+**
- Path: **simulated Alexa+ experience in a web app**
- Mini challenge: **Open Source**

The project intentionally uses the simulated Alexa+ path allowed by the hackathon rules, so no physical Amazon device or private preview access is required for the demo.

## Run locally

Requires Node.js 20+.

```bash
cd aegis-home
npm start
```

Open `http://localhost:3000`.

## Test

```bash
cd aegis-home
npm test
```

The tests verify the policy layer, including security confirmation gates and low-risk reversible actions.

## Architecture

- `public/` — demo UI for the simulated Alexa+ interaction
- `server.mjs` — zero-dependency HTTP server and `/api/plan` endpoint
- `src/policy.mjs` — deterministic action planning and risk policy
- `tests/` — policy tests using Node's built-in test runner

## Demo flow

A user asks Aegis Home to prepare an evening routine. The agent proposes lighting, temperature, and door-lock actions. Comfort actions are marked low-risk, while locking the home is classified as consequential. Aegis pauses and asks for confirmation instead of silently executing the security change. After approval, the audit trail records the explicit user decision.

## Safety model

This is a hackathon simulation and does not control real devices. The policy is deterministic and intentionally conservative. The architecture separates planning from approval so a future Alexa+/MCP integration can map approved actions to real tools without removing the confirmation boundary.

## Open source

This contribution is part of the public `Inkh95/t3n-trusted-approval-agent` repository on the `amazon-aegis-home` branch. The repository is licensed under MIT.
