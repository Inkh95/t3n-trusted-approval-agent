import json, os, re, subprocess, time
from pathlib import Path

MODEL = os.environ.get("MODEL_PATH", "model.gguf")
LLAMA = os.environ.get("LLAMA_CLI", "./llama-bin/llama-cli")
OUT = Path("spark_eval/results")
OUT.mkdir(parents=True, exist_ok=True)

# Three independent math categories. The short generation budget keeps the
# evaluation reproducible on free hosted CPU while preserving reasoning traces.
CASES = [
    {"id":"tank","group":"linear","prompt":"A tank is 3/5 full. After adding 24 liters, it is 9/10 full. What is the tank's total capacity in liters?","answer":"80"},
    {"id":"polygon","group":"geometry","prompt":"The sum of the interior angles of a convex polygon is 1980 degrees. How many sides does the polygon have?","answer":"13"},
    {"id":"percent","group":"percent","prompt":"A price is increased by 20% and then decreased by 20%. The final price is 96 dollars. What was the original price in dollars?","answer":"100"}
]

SYSTEM = "Solve using one compact equation or calculation. Then end with exactly: FINAL: <number>."
MAX_TOKENS = 48

def run_case(case):
    prompt = f"{SYSTEM}\n\nProblem: {case['prompt']}"
    cmd = [LLAMA, "-m", MODEL, "-p", prompt, "-n", str(MAX_TOKENS), "-c", "512", "--temp", "0", "--seed", "42", "--no-display-prompt"]
    start = time.time()
    try:
        p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=240)
        raw = p.stdout
        exit_code = p.returncode
        timed_out = False
    except subprocess.TimeoutExpired as e:
        raw = (e.stdout or "") if isinstance(e.stdout, str) else ((e.stdout or b"").decode("utf-8", "replace"))
        exit_code = None
        timed_out = True
    elapsed = round(time.time()-start, 3)
    m = re.findall(r"FINAL:\s*([-+]?\d+(?:\.\d+)?)", raw, re.I)
    pred = m[-1] if m else None
    def norm(x):
        try:
            f=float(x)
            return str(int(f)) if f.is_integer() else str(f)
        except Exception:
            return str(x).strip()
    correct = pred is not None and norm(pred)==norm(case["answer"])
    result = {**case, "prediction":pred, "correct":correct, "elapsed_seconds":elapsed, "exit_code":exit_code, "timed_out":timed_out, "command":cmd, "raw_output":raw}
    (OUT / f"{case['id']}.json").write_text(json.dumps(result, indent=2, ensure_ascii=False))
    return result

results=[]
for c in CASES:
    print(f"RUN {c['id']}", flush=True)
    results.append(run_case(c))

acc=sum(r['correct'] for r in results)/len(results)
summary={
    "model":"XHToken/Spark-X2.5-1.7B-GGUF Q4_K_M",
    "seed":42,
    "temperature":0,
    "max_tokens":MAX_TOKENS,
    "context":512,
    "n_cases":len(results),
    "accuracy":acc,
    "results":[{k:v for k,v in r.items() if k!="raw_output"} for r in results]
}
(OUT/"summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False))
print(json.dumps(summary, indent=2, ensure_ascii=False))
