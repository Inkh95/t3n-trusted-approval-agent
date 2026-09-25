# Aegis Home — Friction Log

Prepared during the Build, Ship, Shape: Amazon Developer Hackathon.

## 1. Choosing the Alexa+ simulation path

**Task attempted:** Determine the fastest standards-compliant way to prototype an Alexa+ agentic experience without private preview access or physical hardware.

**Steps taken:** Reviewed the Alexa+ track requirements, compared Agent Skill/MCP integration with the permitted simulated web-experience path, and implemented a browser-based interaction that exposes planning, risk classification, approval, and audit behavior.

**Expected:** A clear onboarding path for builders who do not yet have Amazon developer access.

**Actual:** The simulated-experience option is flexible and makes rapid prototyping possible, but builders must read the track language carefully to distinguish simulation requirements from the requirements for a production Agent Skill or self-hosted MCP server.

**Severity:** Medium.

**Workaround:** Documented the project explicitly as a simulated Alexa+ experience in both the UI and repository and kept the action layer separated so a future MCP adapter can be added without changing the approval boundary.

**Actionable suggestion:** Provide a short Alexa+ hackathon starter page with two explicit diagrams: “Production Agent Skill/MCP path” and “Simulated experience path,” each with a minimal reference repository and submission checklist.

## 2. Designing consequential-action confirmation

**Task attempted:** Make an agentic household flow useful without allowing a natural-language request to silently trigger security-sensitive actions.

**Steps taken:** Split request planning from execution, assigned deterministic risk classes to proposed actions, and inserted an explicit confirmation gate before consequential security, safety, or financial state changes.

**Expected:** A simple agent loop could treat every generated action uniformly.

**Actual:** Uniform execution makes the demo simpler but weakens user control. Separating planning, policy, approval, and audit produces a clearer and safer interaction contract.

**Severity:** High for real-world agent integrations.

**Workaround:** Implemented a deterministic policy layer and made confirmation state visible in the UI and tests.

**Actionable suggestion:** Alexa+ developer examples should include a first-class pattern for consequential-action approval, including recommended metadata for risk reason, reversibility, user confirmation, and audit events.

## 3. Making a simulated agent easy to judge and reproduce

**Task attempted:** Package the prototype so a judge can understand and run it quickly.

**Steps taken:** Kept the server zero-dependency, added Node built-in tests, documented local setup, created a public browser demo, and added CI for the policy tests.

**Expected:** A prototype would naturally be easy to reproduce once it worked locally.

**Actual:** Reproducibility requires deliberate work: explicit runtime requirements, concise commands, deterministic behavior, test coverage, and a clear statement of what is simulated versus integrated.

**Severity:** Medium.

**Workaround:** Added a focused README, deterministic policy tests, and a CI workflow.

**Actionable suggestion:** Provide a submission-readiness validator that checks public repository access, license visibility, runnable instructions, track-specific integration/simulation evidence, and demo-video requirements before final submission.
