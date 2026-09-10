# T3N Trusted Approval Agent

[Live interactive demo](https://t3n-trusted-approval-agent.kostovdobromir.chatgpt.site)

A zero-cost, runnable MVP that puts a human approval boundary between an AI agent and sensitive real-world actions.

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
npm start
```

Open `http://localhost:3000`. Local mode uses a labelled mock identity and simulated external actions, so it cannot accidentally submit or pay anything.

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
