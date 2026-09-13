import json, os, re, subprocess, sys, time
from pathlib import Path

MODEL = os.environ.get("MODEL_PATH", "model.gguf")
LLAMA = os.environ.get("LLAMA_CLI", "./llama.cpp/build/bin/llama-cli")
OUT = Path("spark_eval/results")
OUT.mkdir(parents=True, exist_ok=True)

CASES = [
    {"id":"tank_base","group":"tank","prompt":"A tank is 3/5 full. After adding 24 liters, it is 9/10 full. What is the tank's total capacity in liters?","answer":"80"},
    {"id":"tank_perturbed","group":"tank","prompt":"A tank is 3/5 full. After adding 18 liters, it is 9/10 full. What is the tank's total capacity in liters?","answer":"60"},
    {"id":"polygon_base","group":"polygon","prompt":"The sum of the interior angles of a convex polygon is 1980 degrees. How many sides does the polygon have?","answer":"13"},
    {"id":"polygon_perturbed","group":"polygon","prompt":"The sum of the interior angles of a convex polygon is 2340 degrees. How many sides does the polygon have?","answer":"15"},
    {"id":"percent_base","group":"percent","prompt":"A price is increased by 20% and then decreased by 20%. The final price is 96 dollars. What was the original price in dollars?","answer":"100"},
    {"id":"percent_perturbed","group":"percent","prompt":"A price is increased by 20% and then decreased by 20%. The final price is 144 dollars. What was the original price in dollars?","answer":"150"}
]

SYSTEM = "Solve the math problem carefully. Show concise reasoning. End with exactly one line in the form FINAL: <number>."

def run_case(case):
    prompt = f"{SYSTEM}\n\nProblem: {case['prompt']}"
    cmd = [LLAMA, "-m", MODEL, "--jinja", "-p", prompt, "-n", "256", "-c", "2048", "--temp", "0", "--seed", "42", "--no-display-prompt"]
    start = time.time()
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=900)
    elapsed = round(time.time()-start, 3)
    raw = p.stdout
    m = re.findall(r"FINAL:\s*([-+]?\d+(?:\.\d+)?)", raw, re.I)
    pred = m[-1] if m else None
    def norm(x):
        try:
            f=float(x)
            return str(int(f)) if f.is_integer() else str(f)
        except Exception:
            return str(x).strip()
    correct = pred is not None and norm(pred)==norm(case["answer"])
    result = {**case, "prediction":pred, "correct":correct, "elapsed_seconds":elapsed, "command":cmd, "raw_output":raw}
    (OUT / f"{case['id']}.json").write_text(json.dumps(result, indent=2, ensure_ascii=False))
    return result

results=[]
for c in CASES:
    print(f"RUN {c['id']}", flush=True)
    results.append(run_case(c))

acc=sum(r['correct'] for r in results)/len(results)
pairs={}
for g in sorted({r['group'] for r in results}):
    rr=[r for r in results if r['group']==g]
    pairs[g]=all(r['correct'] for r in rr)
summary={
    "model":"XHToken/Spark-X2.5-1.7B-GGUF Q4_K_M",
    "seed":42,
    "temperature":0,
    "max_tokens":256,
    "context":2048,
    "n_cases":len(results),
    "accuracy":acc,
    "robust_pairs_both_correct":pairs,
    "results":[{k:v for k,v in r.items() if k!="raw_output"} for r in results]
}
(OUT/"summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False))
print(json.dumps(summary, indent=2, ensure_ascii=False))
