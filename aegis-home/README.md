# Aegis Home

**The trust layer between household intent and agentic action.**

Aegis Home is a simulated Alexa+ agentic experience for the **Build, Ship, Shape: Amazon Developer Hackathon**. It turns a natural-language household request into an inspectable plan, evaluates each proposed action with a deterministic policy, stops at an explicit human boundary for consequential actions, and exposes the decision in an audit-friendly interface.

> A useful home agent should be able to act. A trustworthy one should also know when it must stop and ask.

## The problem

As assistants move from answering questions to changing the physical world, a wrong answer becomes a wrong action. Unlocking a door, changing a security state, turning on a heat-producing appliance, or placing an order has a different consequence profile from dimming a light.

Aegis makes that difference visible and enforceable.

## Interaction contract

`Intent → Plan → Policy → Approval → Audit`

1. **Intent** — accept a natural household request.
2. **Plan** — translate it into concrete proposed actions.
3. **Policy** — classify every action independently by category, risk, reversibility, and confirmation requirement.
4. **Approval** — block consequential actions until an explicit human decision is recorded.
5. **Audit** — show what was proposed, why it was classified that way, and where execution stopped.

## What makes Aegis different

The safety boundary is not delegated to the same generative system proposing an action. A deterministic policy sits between planning and execution. That separation creates a least-authority architecture: an agent can prepare useful work without silently gaining permission to perform consequential side effects.

Current policy examples:

| Action | Category | Risk | Human approval |
| --- | --- | --- | --- |
| Adjust lights / thermostat | Comfort | Low risk | No |
| Lock or alter security state | Security | High impact | Yes |
| Turn on oven / heater | Safety | High impact | Yes |
| Place a purchase | Financial | High impact | Yes |
| Unlock exterior access | Security | Critical | Yes |

## Judge demo — 60 seconds

1. Start the app and choose **Evening routine**. Aegis creates a mixed plan and visibly holds the security action for approval.
2. Choose **Physical access**. Unlocking the exterior door is elevated to **critical** and cannot silently cross the execution boundary.
3. Choose **Purchase + comfort**. The financial action is gated while reversible comfort automation remains separately classified.
4. Approve a consequential plan and observe the explicit human decision reflected in the audit state.

The demo intentionally performs **no real device side effects**. It demonstrates the control architecture and the permitted simulated Alexa+ experience.

## Hackathon fit

- **Primary track:** Alexa+
- **Implementation path:** simulated Alexa+ experience in a web app
- **Mini challenge:** Open Source
- **Core idea:** human-in-the-loop control for agentic household workflows

The project uses the simulated Alexa+ path permitted by the hackathon, so the public demo does not require a physical Amazon device or private preview access.

## Architecture

```text
Natural-language request
        ↓
   Action planner
        ↓
Deterministic policy engine
        ↓
 ┌──── low-risk / reversible ────→ simulated safe path
 │
 └──── consequential ────────────→ explicit approval gate
                                      ↓
                                  audit evidence
```

Repository components:

- `public/` — judge-facing simulated Alexa+ interaction and audit UI
- `server.mjs` — zero-dependency HTTP server and `/api/plan` endpoint
- `src/policy.mjs` — deterministic action planning and policy contract
- `tests/` — policy and boundary tests using Node's built-in test runner

## Safety properties demonstrated

- **Deterministic guardrails:** consequential classification does not depend on a model self-evaluating its own safety.
- **Least authority:** planning permission is not execution permission.
- **Explicit consent:** security, safety, physical-access, and financial changes require a human boundary crossing.
- **Action-level classification:** mixed plans do not receive one blanket risk label.
- **Reversibility awareness:** reversible comfort actions are distinguished from actions that cannot be automatically undone.
- **Auditability:** the UI exposes intent, policy version, maximum risk, held actions, and approval state.
- **Fail-safe demo:** this hackathon build never controls real household devices.

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

The test suite covers security, critical physical access, reversible comfort automation, financial commitments, safety-sensitive appliances, mixed evening routines, and execution-boundary behavior.

## Production evolution

The demo deliberately separates policy from device execution. A production Alexa+/MCP implementation can replace the simulated execution adapter with real tools while preserving the same contract:

`proposed action → deterministic policy → required approval → authorized tool call → durable audit event`

That keeps the core safety mechanism independent of any particular device provider or model.

## Open source

Aegis Home is developed publicly in `Inkh95/t3n-trusted-approval-agent` and the repository is MIT licensed. The hackathon upgrade is isolated in the `aegis-home-10x` release-candidate branch until final validation, so the currently submitted version remains protected from accidental regressions.
