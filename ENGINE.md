# T3N approval engine — integration contract

The reusable core is `src/policy.ts`, `src/gateway.ts`, `src/crypto.ts`, `src/audit.ts`, and `src/types.ts`. `src/task-hunter.ts`, Strands orchestration and the public UI are examples, not dependencies of the core gateway.

```ts
import {AuditLog} from "./src/audit.ts";
import {ApprovalGateway} from "./src/gateway.ts";

const audit = new AuditLog();
const gateway = new ApprovalGateway("local-demo-secret", audit);
const request = await gateway.request({
  agentDid: "did:t3n:demo-agent", type: "message.send", target: "example",
  summary: "Send a draft", payload: {message: "Hello"}
});
// For approval_required, a human reviews the exact payload and calls approve.
// execute returns a SIMULATED receipt; wire real execution only after adding
// durable storage, a trusted verifier, destination authorization and reconciliation.
```

Decisions: `allow`, `approval_required`, `deny`. Unknown action types require review. Payments require a positive finite EUR amount no greater than EUR 50 plus explicit approval. Requests and approvals are in memory; restart loses pending state. The gateway does **not** send a message or payment. Its MIT-licensed public code may be reused under the existing license; the commercial offer is an integration, an implementation, and support, not an exclusive sale of this published source.

Run `npm test` to check the core and demo. Never put live identity keys in source control.
