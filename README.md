# T3N Trusted Approval Agent

[Live interactive demo](https://t3n-trusted-approval-agent.kostovdobromir.chatgpt.site)

A zero-cost, runnable MVP that puts a human approval boundary between an AI agent and sensitive real-world actions.

Built for the **AWS Agents for Humans Hackathon** Professional Agents track. The orchestration layer uses the official Strands Agents TypeScript SDK and exposes two narrow tools: task evaluation and guarded task start.

Tailored to **Task Hunter**: research and drafting can run autonomously, while applications, messages, account creation, and payments require explicit approval. Credential disclosure and CAPTCHA circumvention are denied.

## How it works

1. An agent requests an action with its `did:t3n` identity.
2. Policy returns `allow`, `approval_required`, or `deny`.
3. A human approves the exact payload; any change invalidates approval.
4. The gateway consumes the approval once and returns a receipt.
5. Every step is written to a tamper-evident audit chain.

## Run locally

Requires Node.js 22.18+ (Node 24 recommended).

```bash
cp .env.example .env
npm test
npm run demo
npm run demo:strands
npm start
```

Open `http://localhost:3000`. Local mode uses a labelled mock identity and simulated external actions, so it cannot accidentally submit or pay anything.

`npm run demo:strands` proves the end-to-end workflow without cloud spend: a fully verified SEPA task reaches `CLAIMED`, while an unverified crypto/KYC task stops at `REVIEW_REQUIRED`. To exercise the conversational Strands model loop, configure an authorized model provider and set `RUN_STRANDS_MODEL=1`.

## CALL-E bounty verification

The `src/calle-bounty-verifier.ts` integration adds a focused, verification-only phone workflow for public bounty listings. Before a task is claimed, it can ask the official organizer to confirm the reward, AI-use policy, geographic eligibility, deadline, payout route, and submission URL. The result is structured evidence; it never claims the task, asks for credentials, or handles payment details.

The default demo is a no-network preview and uses a fictional reserved number:

```bash
npm run demo:calle
```

Live mode is deliberately opt-in. It requires an API key and a phone number owned by or authorized to the operator; it can consume a CALL-E call credit and may create a real outbound call:

```bash
export CALLE_API_KEY='...'
export CALLE_RECIPIENT_PHONE='+15550101000'
npm run demo:calle -- --live
```

Never put the API key or a real phone number in source, logs, screenshots, or pull requests. The call result only becomes eligible input for the existing deterministic approval gateway; it does not bypass human approval for an external claim or submission.

## Strands workflow

1. `evaluate_paid_task` validates official reward evidence, Bulgaria eligibility, AI permission, zero upfront cost, payout route, KYC/CAPTCHA and legal clarity.
2. `start_eligible_task` receives the same typed evidence and cannot bypass validation.
3. Only a complete match receives the narrow `task.claim.standing-approval` policy decision.
4. The gateway emits a one-time simulated receipt and a tamper-evident audit event.
5. Missing or risky evidence fails closed as `REVIEW_REQUIRED`.

## Real T3N sandbox identity

Terminal 3 provides free sandbox credits. The optional adapter follows the official order: verified trust manifest, WASM crypto, encrypted handshake, then DID authentication.

```bash
npm install
export T3N_MODE=t3n
export T3N_API_KEY='<agent-key>'
npm start
```

Never commit keys. A tenant and its agent need separate keys and balances.

## Security properties

- Fail-closed unknown actions
- HMAC-SHA256 approvals bound to a canonical action digest
- Constant-time signature comparison
- Five-minute, single-use approvals
- EUR 50 payment cap
- Append-only SHA-256 audit hash chain
- No secrets exposed to the dashboard or audit detail
- Mock execution by default

## Current scope

The MVP proves the approval and audit boundary. Production should replace the demo signer with an organization-owned verifier, persist pending actions transactionally, register the agent/contract in T3N, and execute destination calls inside an authorized TEE contract.

## Official references

- [Terminal 3 Agent Developer Kit](https://terminal3.io/products/agent-developer-kit)
- [T3N ADK docs](https://docs.terminal3.io/developers/adk/overview/what-is-adk)
- [SDK reference](https://docs.terminal3.io/developers/adk/reference)
- [Member delegation](https://docs.terminal3.io/developers/adk/get-started/member-delegation)

## License

MIT
