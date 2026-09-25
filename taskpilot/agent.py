from __future__ import annotations

import json
import os
from dataclasses import dataclass, asdict
from typing import Literal

from strands import Agent, tool
from strands.models.ollama import OllamaModel

Risk = Literal["low", "medium", "high"]


@dataclass
class ActionPlan:
    task: str
    action: str
    risk: Risk
    requires_approval: bool
    reason: str


@tool
def classify_action(task: str, action: str) -> str:
    """Classify a proposed task action by consequence and approval need."""
    text = f"{task} {action}".lower()
    high_markers = [
        "pay", "purchase", "send money", "delete", "cancel", "sign", "submit",
        "publish", "book", "password", "credential", "bank", "medical", "legal",
    ]
    medium_markers = ["email", "message", "reschedule", "share", "upload", "edit"]

    if any(marker in text for marker in high_markers):
        plan = ActionPlan(task, action, "high", True, "Irreversible, financial, legal, privacy, or external side effect.")
    elif any(marker in text for marker in medium_markers):
        plan = ActionPlan(task, action, "medium", True, "External communication or meaningful state change should be reviewed.")
    else:
        plan = ActionPlan(task, action, "low", False, "Reversible preparation or organization with no external side effect.")
    return json.dumps(asdict(plan))


@tool
def draft_work_product(task: str, context: str = "") -> str:
    """Create a concise draft/checklist for a repetitive professional task without sending anything externally."""
    return (
        "DRAFT WORK PRODUCT\n"
        f"Task: {task}\n"
        f"Context: {context or 'None provided'}\n"
        "1. Confirm the desired outcome and deadline.\n"
        "2. Gather only the information needed for the task.\n"
        "3. Prepare the output in a reviewable form.\n"
        "4. Stop before any consequential external action unless approval is explicit.\n"
    )


SYSTEM_PROMPT = """You are TaskPilot, a professional background-work agent.
Your job is to reduce repetitive work while preserving human control.
For every request:
1. break the work into a concrete next action,
2. use draft_work_product for safe preparatory work,
3. use classify_action before any proposed external/state-changing action,
4. if approval is required, surface exactly what needs a human decision and stop,
5. otherwise complete the safe work and return a concise audit summary.
Never claim an external action was completed unless a tool actually performed it.
"""


def build_agent(model_id: str | None = None) -> Agent:
    model = OllamaModel(
        host=os.getenv("OLLAMA_HOST", "http://localhost:11434"),
        model_id=model_id or os.getenv("TASKPILOT_MODEL", "llama3.1:8b"),
        temperature=0.2,
    )
    return Agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
        tools=[classify_action, draft_work_product],
    )


def run(task: str, context: str = "") -> str:
    agent = build_agent()
    return str(agent(f"Task: {task}\nContext: {context}"))


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="TaskPilot — Strands background-work agent")
    parser.add_argument("task")
    parser.add_argument("--context", default="")
    args = parser.parse_args()
    print(run(args.task, args.context))
