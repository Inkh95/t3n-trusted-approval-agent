const requestEl = document.querySelector('#request');
const analyzeEl = document.querySelector('#analyze');
const planEl = document.querySelector('#plan');
const gateEl = document.querySelector('#gate');
const auditEl = document.querySelector('#audit');
const scenarioButtons = document.querySelectorAll('[data-scenario]');

const riskRank = { low: 0, medium: 1, high: 2, critical: 3 };

function renderPlan(plan) {
  planEl.classList.remove('muted');
  planEl.innerHTML = plan.steps.map((step) => `
    <div class="step">
      <div>
        <strong>${step.label}</strong>
        <p>${step.rationale}</p>
        <div class="meta"><span>${step.category}</span><span>${step.reversible ? 'reversible' : 'not automatically reversible'}</span></div>
      </div>
      <span class="risk ${step.level}">${step.level}</span>
    </div>
  `).join('');

  const consequential = plan.steps.filter((step) => step.requiresConfirmation).length;
  const highest = plan.steps.reduce((max, step) => riskRank[step.level] > riskRank[max] ? step.level : max, 'low');
  auditEl.innerHTML = `
    <div><span>Intent</span><strong>${plan.intent}</strong></div>
    <div><span>Policy</span><strong>${plan.policyVersion || 'aegis-policy'} · ${highest} max risk</strong></div>
    <div><span>Boundary</span><strong>${consequential ? `${consequential} action${consequential === 1 ? '' : 's'} held for approval` : 'Reversible actions only'}</strong></div>
    <div><span>Execution</span><strong>Simulation only · no device side effects</strong></div>
  `;

  if (plan.requiresConfirmation) {
    gateEl.innerHTML = `
      <div class="gate warning">
        <span class="gate-kicker">HUMAN-IN-THE-LOOP BOUNDARY</span>
        <strong>Explicit approval required</strong>
        <p>Aegis prepared the plan but will not cross a security, safety, physical-access, or financial boundary silently.</p>
        <button id="confirm">Approve consequential actions</button>
      </div>`;
    document.querySelector('#confirm').addEventListener('click', () => {
      gateEl.innerHTML = `<div class="gate success"><span class="gate-kicker">APPROVAL RECORDED</span><strong>Plan approved</strong><p>The audit trail now records an explicit human decision. Device execution remains simulated.</p></div>`;
      auditEl.children[2].querySelector('strong').textContent = 'Explicit human approval recorded';
    });
  } else {
    gateEl.innerHTML = `<div class="gate success"><span class="gate-kicker">LOW-RISK PATH</span><strong>Ready in principle</strong><p>Only reversible comfort actions are proposed. Device execution remains simulated.</p></div>`;
  }
}

async function analyze() {
  analyzeEl.disabled = true;
  analyzeEl.textContent = 'Running policy…';
  try {
    const response = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ request: requestEl.value })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Request failed');
    renderPlan(payload);
  } catch (error) {
    gateEl.innerHTML = `<div class="gate warning"><strong>Could not analyze request</strong><p>${error.message}</p></div>`;
  } finally {
    analyzeEl.disabled = false;
    analyzeEl.textContent = 'Analyze & prepare actions';
  }
}

scenarioButtons.forEach((button) => button.addEventListener('click', () => {
  requestEl.value = button.dataset.scenario;
  analyze();
}));
analyzeEl.addEventListener('click', analyze);
