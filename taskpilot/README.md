# TaskPilot

TaskPilot is a **Strands Agents** professional-work agent built for the **Agents for Humans Hackathon**.

It handles repetitive professional preparation in the background, completes safe reversible work autonomously, and surfaces only decisions that could create a meaningful external consequence.

## Problem

Knowledge workers lose time to repetitive coordination: turning notes into next steps, preparing follow-ups, organizing tasks, and deciding whether an action is safe to execute automatically. Most assistants either stop at chat or act too aggressively.

TaskPilot uses a simple contract: **prepare automatically, pause before consequences**.

## What it does

1. Receives a professional task and optional context.
2. Uses a Strands Agent to plan the work.
3. Creates a reviewable draft/checklist for safe preparatory work.
4. Classifies proposed actions with a deterministic consequence policy.
5. Continues automatically for low-risk reversible work.
6. Surfaces a clear human decision for external, financial, legal, privacy-sensitive, or irreversible actions.
7. Returns an audit-style summary rather than pretending an action happened.

## Required technology

- **Strands Agents SDK** — agent orchestration and tool use.
- **Ollama** — local model provider for the zero-paid-runtime reference path.
- Python 3.11+.

The default configuration uses `llama3.1:8b`, but any compatible Ollama model can be selected with `TASKPILOT_MODEL`.

## Quick start

Install Ollama and start it, then:

```bash
ollama pull llama3.1:8b
cd taskpilot
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python agent.py "Turn these meeting notes into a follow-up plan" --context "Client wants revised timeline by Friday"
```

To use another Ollama host/model:

```bash
export OLLAMA_HOST=http://localhost:11434
export TASKPILOT_MODEL=mistral
```

## Example behavior

A request to organize notes or prepare a checklist is completed as safe background work. A proposal to send an email is classified as a meaningful external action and is surfaced for review. A payment, purchase, cancellation, signature, or deletion is classified high-risk and requires explicit approval.

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the diagram.

Core files:

- `agent.py` — Strands Agent, Ollama model configuration, tools, CLI.
- `test_policy.py` — tests for the approval boundary.
- `ARCHITECTURE.md` — architecture and consequence-control design.

## Testing

```bash
cd taskpilot
pytest -q
```

The policy layer is deterministic so consequential-action behavior is testable independently of model output.

## Why it matters

Useful agents should remove repetitive work without forcing a human to supervise every harmless step. At the same time, an agent should not silently cross a financial, legal, privacy, communication, or irreversible boundary. TaskPilot makes that boundary explicit and inspectable.

## Hackathon track

**Professional Agents** — TaskPilot is designed for professionals who need routine drafting, organization, and follow-up preparation handled automatically while retaining control of consequential actions.

## Cost and deployment note

The reference path runs with a local Ollama model and does not require a paid AWS runtime. The hackathon rules state that AgentCore deployment can strengthen Technical Implementation but is not required. This repository does not claim an AgentCore deployment.

## License

This new hackathon project is contributed under the repository's MIT license.

## Optional paid policy lab

The TaskPilot source above is free under MIT. An [optional €35 TaskPilot Approval Policy Lab](https://payhip.com/b/I3hHo) adds a separate dependency-free Python checker, 12 fictional typed-action scenarios and tests. It never performs external actions, runs no AI model, and is not required to use this repository.
