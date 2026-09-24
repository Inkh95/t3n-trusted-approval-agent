# T3N Nebius Edition — Demo Flow

## Demo objective

Show that T3N can use Nebius-hosted NVIDIA Nemotron for reasoning while keeping the final action decision deterministic, auditable, and safe.

## Scenario A — GO

Input: a €150 documentation bounty with:
- Bulgaria explicitly eligible
- AI assistance explicitly allowed
- SEPA payout confirmed
- zero upfront cost
- clear legal/IP terms

Expected flow:
1. Nebius/Nemotron summarizes the opportunity and estimates acceptance probability and effort.
2. T3N computes expected value/hour and applies payout/competition multipliers.
3. The deterministic policy gate confirms all standing-approval requirements.
4. Route becomes `GO`.
5. A hash-chained audit event records the decision without secrets or personal data.

## Scenario B — REVIEW_REQUIRED

Input: a €500 task with:
- country eligibility unknown
- payout method unverified
- reward not officially confirmed
- KYC required
- legal/IP terms unclear

Expected flow:
1. Nebius/Nemotron may still identify potentially attractive economics.
2. Deterministic policy refuses autonomous action because evidence is incomplete.
3. Economic score is forced to zero because payout is unverified.
4. Route becomes `REVIEW_REQUIRED`.
5. A second audit event is appended and the audit chain remains valid.

## Commands

Mock/offline demo (no external API required):

```bash
npm ci
npm run check
npm run demo:nebius
```

Live Nebius demo:

```bash
export NEBIUS_API_KEY=...
export RUN_NEBIUS_MODEL=1
npm run demo:nebius
```

Optional overrides:

```bash
export NEBIUS_BASE_URL=https://api.tokenfactory.us-central1.nebius.com/v1
export NEBIUS_MODEL=nvidia/nemotron-3-super-120b-a12b
```

## What judges should look for

- Model reasoning cannot override hard policy.
- Missing payout or eligibility evidence fails closed.
- Economic ranking is explicit and inspectable.
- Audit hashes prove event ordering and tamper evidence.
- The same orchestration runs in mock mode for reproducibility and live Nebius mode for the competition demo.
