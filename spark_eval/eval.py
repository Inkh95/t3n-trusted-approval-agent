import json, os, re, subprocess, time
from pathlib import Path

MODEL = os.environ.get("MODEL_PATH", "model.gguf")
LLAMA = os.environ.get("LLAMA_CLI", "./llama-bin/llama-cli")
OUT = Path("spark_eval/results")
OUT.mkdir(parents=True, exist_ok=True)

# Three base/perturbed pairs across independent math categories. The paired
# numerical perturbations provide a tiny robustness/contamination-oriented
# case study rather than a benchmark claim.
CASES = [
    {"id":"tank_base","group":"tank","variant":"base","prompt":"A tank is 3/5 full. After adding 24 liters, it is 9/10 full. What is the tank's total capacity in liters?","answer":"80"},
    {"id":"tank_perturbed","group":"tank","variant":"perturbed","prompt":"A tank is 3/5 full. After adding 18 liters, it is 9/10 full. What is the tank's total capacity in liters?","answer":"60"},
    {"id":"polygon_base","group":"polygon","variant":"base","prompt":"The sum of the interior angles of a convex polygon is 1980 degrees. How many sides does the polygon have?","answer":"13"},
    {"id":"polygon_perturbed","group":"polygon","variant":"perturbed","prompt":"The sum of the interior angles of a convex polygon is 2340 degrees. How many sides does the polygon have?","answer":"15"},
    {"id":"percent_base","group":"percent","variant":"base","prompt":"A price is increased by 20% and then decreased by 20%. The final price is 96 dollars. What was the original price in dollars?","answer":"100"},
    {"id":"percent_perturbed","group":"percent","variant":"perturbed","prompt":"A price is increased by 20% and then decreased by 20%. The final price is 144 dollars. What was the original price in dollars?","answer":"150"}
]

SYSTEM = "Solve the math problem briefly. End with exactly one line: FINAL: <number>."
MAX_TOKENS = 256

def norm(x):
    try:
        f = float(x)
        return str(int(f)) if f.is_integer() else str(f)
    except Exception:
        return str(x).strip()

def run_case(case):
    cmd = [
        LLAMA, "-m", MODEL,
        "--jinja", "--single-turn",
        "--reasoning-budget", "0",
        "-sys", SYSTEM,
        "-p", case["prompt"],
        "-n", str(MAX_TOKENS),
        "-c", "512",
        "--temp", "0",
        "--seed", "42",
        "--no-display-prompt",
    ]
    start = time.time()
    try:
        p = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            stdin=subprocess.DEVNULL,
            text=True,
            timeout=180,
        )
        raw = p.stdout
        exit_code = p.returncode
        timed_out = False
    except subprocess.TimeoutExpired as e:
        raw = (e.stdout or "") if isinstance(e.stdout, str) else ((e.stdout or b"").decode("utf-8", "replace"))
        exit_code = None
        timed_out = True

    elapsed = round(time.time() - start, 3)
    matches = re.findall(r"FINAL:\s*([-+]?\d+(?:\.\d+)?)", raw, re.I)
    pred = matches[-1] if matches else None
    correct = pred is not None and norm(pred) == norm(case["answer"])
    result = {
        **case,
        "prediction": pred,
        "correct": correct,
        "elapsed_seconds": elapsed,
        "exit_code": exit_code,
        "timed_out": timed_out,
        "command": cmd,
        "raw_output": raw,
    }
    (OUT / f"{case['id']}.json").write_text(json.dumps(result, indent=2, ensure_ascii=False))
    return result

results = []
for case in CASES:
    print(f"RUN {case['id']}", flush=True)
    results.append(run_case(case))

pairs = {}
for group in sorted({r["group"] for r in results}):
    members = [r for r in results if r["group"] == group]
    pairs[group] = {
        "both_correct": all(r["correct"] for r in members),
        "base_correct": next(r["correct"] for r in members if r["variant"] == "base"),
        "perturbed_correct": next(r["correct"] for r in members if r["variant"] == "perturbed"),
    }

summary = {
    "suite": "Spark-X2.5 custom paired numerical-perturbation mini-suite v1",
    "data_license": "CC0-1.0; prompts created for this evaluation",
    "model": "XHToken/Spark-X2.5-1.7B-GGUF Q4_K_M",
    "seed": 42,
    "temperature": 0,
    "reasoning_budget": 0,
    "max_tokens": MAX_TOKENS,
    "context": 512,
    "sampling_count": 1,
    "scoring": "exact match on parsed FINAL numeric answer; unparseable output counts incorrect",
    "n_cases": len(results),
    "accuracy": sum(r["correct"] for r in results) / len(results),
    "timeouts": sum(r["timed_out"] for r in results),
    "pair_robustness": pairs,
    "results": [{k:v for k,v in r.items() if k != "raw_output"} for r in results],
}
(OUT / "summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False))
print(json.dumps(summary, indent=2, ensure_ascii=False))
