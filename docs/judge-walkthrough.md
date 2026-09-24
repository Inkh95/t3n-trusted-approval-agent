# Judge Walkthrough — T3N Nebius Edition

## 90-second path

1. Open the live dashboard.
2. Click **Run judge demo**.
3. Observe the verified task route to **GO** with a positive economic score.
4. Observe the risky task route to **REVIEW_REQUIRED** even though the reasoning layer can still analyze it.
5. Open the raw output to inspect Nemotron-style reasoning fields, policy blockers, economics and the final route.
6. Check `/api/audit` to verify the SHA-256 hash chain remains valid.

## What this proves

- Nebius-hosted NVIDIA Nemotron is used as a reasoning layer, not as the authority to execute actions.
- The deterministic T3N policy gate independently enforces AI permission, Bulgaria eligibility, zero upfront cost, verified payout and legal clarity.
- Economic scoring prefers high expected-value, fast-payout, low-competition work.
- Missing payout evidence, KYC, unclear terms or forbidden AI use fail closed.
- The model cannot override the policy gate.
- Decisions are written into a tamper-evident audit trail.

## Demo scenarios

### Verified opportunity

A €150 AI-assisted documentation bounty with Bulgaria eligibility, SEPA payout, zero upfront cost, no KYC/CAPTCHA and clear legal terms.

Expected route: **GO**.

### Risky opportunity

A higher-reward task with unverified payout, KYC requirements and unclear terms.

Expected route: **REVIEW_REQUIRED**.

The point is intentional: T3N does not chase the largest nominal reward. It maximizes expected value only after hard safety constraints are satisfied.

## Live Nebius mode

Mock inference is the default so judges can run the project with zero credentials and zero spend.

For live Nebius Token Factory inference:

```bash
export NEBIUS_API_KEY='<key>'
export RUN_NEBIUS_MODEL=1
npm run demo:nebius
```

No API key is ever committed to the repository or written to the audit log.

## Architecture

See `docs/nebius-architecture.svg`.

Core path:

`Opportunity -> T3N policy gate -> Nebius/Nemotron reasoning -> Economic scorer -> Route -> Audit log`
