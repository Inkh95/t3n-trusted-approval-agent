const requestEl = document.querySelector('#request');
const analyzeEl = document.querySelector('#analyze');
const planEl = document.querySelector('#plan');
const gateEl = document.querySelector('#gate');
const auditEl = document.querySelector('#audit');

function renderPlan(plan) {
  planEl.classList.remove('muted');
  planEl.innerHTML = plan.steps.map((step) => `
    <div class="step">
      <div>
        <strong>${step.label}</strong>
        <p>${step.rationale}</p>
      </div>
      <span class="risk ${step.requiresConfirmation ? 'high' : 'low'}">${step.level}</span>
    </div>
  `).join('');

  const consequential = plan.steps.filter((step) => step.requiresConfirmation).length;
  auditEl.innerHTML = `
    <div><span>Intent</span><strong>${plan.intent}</strong></div>
    <div><span>Policy check</span><strong>${consequential} consequential action${consequential === 1 ? '' : 's'} detected</strong></div>
    <div><span>User control</span><strong>${plan.requiresConfirmation ? 'Explicit approval required' : 'No approval gate required'}</strong></div>
    <div><span>Execution</span><strong>Simulated Alexa+ experience</strong></div>
  `;

  if (plan.requiresConfirmation) {
    gateEl.innerHTML = `
      <div class="gate warning">
        <strong>Confirmation required</strong>
        <p>Aegis will not silently execute a security, safety, or financial state change.</p>
        <button id="confirm">Confirm plan</button>
      </div>`;
    document.querySelector('#confirm').addEventListener('click', () => {
      gateEl.innerHTML = `<div class="gate success"><strong>Plan approved</strong><p>Explicit approval recorded in the audit trail.</p></div>`;
      auditEl.children[2].querySelector('strong').textContent = 'Explicit approval recorded';
    });
  } else {
    gateEl.innerHTML = `<div class="gate success"><strong>Ready to execute</strong><p>All actions are reversible and low risk.</p></div>`;
  }
}

analyzeEl.addEventListener('click', async () => {
  analyzeEl.disabled = true;
  analyzeEl.textContent = 'Analyzing…';
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
});
