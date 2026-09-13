# [HER Hack-Astron #6] Spark-X2.5-1.7B paired numerical-perturbation math case study

## Summary

I ran a real, reproducible CPU evaluation of the official `XHToken/Spark-X2.5-1.7B-GGUF` Q4_K_M model on a small custom paired numerical-perturbation math suite. The goal is not to claim benchmark-level performance; it is a transparent case study of whether correct reasoning survives simple numeric perturbations across three independent problem families.

**Result:** 6/6 exact-match final answers (100% on this six-case mini-suite), 0 timeouts, and all 3 base/perturbed pairs were jointly correct.

The suite contains three base problems and one numerical perturbation of each: tank capacity / linear equation, polygon interior angles, and sequential percentage change. Prompts were created specifically for this evaluation and are released as **CC0-1.0**.

## AI-assistance disclosure

Evaluation design, automation, analysis drafting, and workflow preparation were AI-assisted / AI-operated by ChatGPT. The reported model outputs come from real Spark-X2.5 runs on GitHub Actions and were not fabricated. No AI persona is presented as a human participant.

## Model and runtime

- Model: `XHToken/Spark-X2.5-1.7B-GGUF`
- Quantization: `Spark-X2.5-1.7B-Q4_K_M.gguf` / Q4_K_M
- Pinned model revision: `23e1fcac55e7dd71e4c12a23723cc228ba0e5e85`
- Model file SHA256: `902bde2522394954ac17821b3e5fd0df02defbc6944f122253f2580acf0503f4`
- Runtime: official upstream `llama.cpp` prebuilt Ubuntu x64 release `b10900`
- llama.cpp revision: `50182a53fa2c26bd2a7fc31d855231effdc2f4ad`
- Execution environment: GitHub-hosted Ubuntu 24.04 runner, AMD EPYC 7763, 4 vCPU visible, ~15 GiB RAM
- Cost: free hosted GitHub Actions run; no paid GPU/API/hosting used
- GitHub Actions run: https://github.com/Inkh95/t3n-trusted-approval-agent/actions/runs/34751858030
- Reproducibility branch: https://github.com/Inkh95/t3n-trusted-approval-agent/tree/spark-x25-eval
- Evaluation script: https://github.com/Inkh95/t3n-trusted-approval-agent/blob/spark-x25-eval/spark_eval/eval.py
- Workflow: https://github.com/Inkh95/t3n-trusted-approval-agent/blob/spark-x25-eval/.github/workflows/spark-x25-eval.yml

The GitHub Actions run uploaded the sanitized raw-output/result artifact `spark-x25-evaluation-results` (artifact ID `10316346535`, artifact digest `sha256:44c6b7b6810f8946b722e9825dbcc8e3f8c149bdaa5a59806bcf69d4c4b15e54`). No model weights are uploaded to this repository or report.

## Decoding and scoring

Each case used one deterministic generation (`sampling_count = 1`) with:

```text
temperature = 0
seed = 42
max_tokens = 256
context = 512
reasoning_budget = 0
single-turn = true
chat template = jinja
```

System instruction:

```text
Solve the math problem briefly. End with exactly one line: FINAL: <number>.
```

Scoring is exact match on the numeric value parsed from `FINAL: <number>`. Unparseable output or timeout counts as incorrect. This is therefore pass@1 / one deterministic sample, not pass@k or self-consistency.

## Dataset / cases

This is **Spark-X2.5 custom paired numerical-perturbation mini-suite v1**, 6 total cases, created for this experiment and licensed CC0-1.0.

| Pair | Variant | Expected | Prediction | Correct |
|---|---|---:|---:|---|
| tank | base: +24 L | 80 | 80 | yes |
| tank | perturbed: +18 L | 60 | 60 | yes |
| polygon | base: 1980° | 13 | 13 | yes |
| polygon | perturbed: 2340° | 15 | 15 | yes |
| percent | base: final $96 | 100 | 100 | yes |
| percent | perturbed: final $144 | 150 | 150 | yes |

Overall exact-match accuracy: **6/6 = 100%**.

Pair robustness: tank = both correct; polygon = both correct; percent = both correct.

## Representative raw reasoning traces

### Tank — base

Prompt:

> A tank is 3/5 full. After adding 24 liters, it is 9/10 full. What is the tank's total capacity in liters?

Model output (content portion):

```text
Let the total capacity be C liters.
Since the tank is 3/5 full initially, the amount added is:
3/5 C + 24 = 9/10 C
Multiply through by 10:
6C + 240 = 9C
240 = 3C
C = 80

FINAL: 80
```

### Tank — numerical perturbation

Prompt:

> A tank is 3/5 full. After adding 18 liters, it is 9/10 full. What is the tank's total capacity in liters?

Model output (content portion):

```text
Let the total capacity be C liters.
Initial amount: 3/5 C
After adding 18 liters: 3/5 C + 18 = 9/10 C
18 = 9/10 C - 3/5 C = 3/10 C
C = 18 * 10 / 3 = 60

FINAL: 60
```

### Polygon — perturbation

Prompt:

> The sum of the interior angles of a convex polygon is 2340 degrees. How many sides does the polygon have?

Model output (content portion):

```text
Sum = (n - 2) * 180
(n - 2) * 180 = 2340
n - 2 = 2340 / 180 = 13
n = 15

FINAL: 15
```

### Percentage — perturbation

Prompt:

> A price is increased by 20% and then decreased by 20%. The final price is 144 dollars. What was the original price in dollars?

Model output (content portion):

```text
Let the original price be x.
After a 20% increase: 1.2x
After a 20% decrease: 1.2x * 0.8 = 0.96x
Given: 0.96x = 144
x = 144 / 0.96 = 150

FINAL: 150
```

The complete raw outputs for all six cases are retained in the workflow artifact, together with runner environment details, exact commands, model/runtime revisions and hashes, run log, manifest, and machine-readable summary.

## Reasoning-integrity / failure analysis

All six **final** cases were correct, and manual inspection of the full traces found the arithmetic and equations consistent with the correct answers; I did not observe a wrong-reasoning/right-answer case in this small suite.

There were, however, important reproducibility failures during development that I am reporting rather than hiding:

1. An initial run used the CLI in an interactive/conversation mode and hit per-case timeouts. Those outputs were rejected and never counted as model accuracy results.
2. A later run used too-small generation budgets (48/128 tokens), truncating responses before the required `FINAL:` line. Those were also rejected rather than scored as math failures.
3. The final protocol fixes the runtime invocation with `--jinja --single-turn` and uses a 256-token output budget. `--reasoning-budget 0` was chosen to avoid spending the entire small output budget in a separate thinking phase; the visible concise solution is still evaluated for reasoning consistency.

These configuration failures illustrate why a superficially successful workflow is not sufficient evidence: raw outputs must be inspected before metrics are reported.

## Interpretation and limitations

This **does not** establish 100% general math accuracy. Six custom elementary cases are far too small and too easy for that. The meaningful observation is narrower: under one deterministic CPU configuration, Spark-X2.5-1.7B produced correct, internally consistent visible solutions on all three problem families and remained correct under one numerical perturbation of each.

A stronger follow-up should use a larger preregistered benchmark split, include substantially harder items and failures, compare reasoning-on/off settings, and test multiple seeds / sampling regimes. The present experiment is intentionally small enough to be reproducible on a free CPU runner while still preserving the raw evidence.

## Reproduction

Clone the branch and run the workflow, or reproduce the core invocation with the pinned GGUF/runtime. The repository contains the exact scoring script and GitHub Actions workflow. The workflow records CPU/RAM/Python/runtime metadata, the model revision and SHA256, and uploads the raw JSON outputs and summary as an artifact.

Repository branch: https://github.com/Inkh95/t3n-trusted-approval-agent/tree/spark-x25-eval

---

This report is submitted as a solo entry. AI assistance is disclosed above.