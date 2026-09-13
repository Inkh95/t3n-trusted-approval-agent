const HIGH_IMPACT_PATTERNS = [
  /lock|unlock/i,
  /alarm|security/i,
  /door|garage/i,
  /oven|stove|heater/i,
  /purchase|buy|order/i
];

export function classifyAction(label) {
  const highImpact = HIGH_IMPACT_PATTERNS.some((pattern) => pattern.test(label));
  return {
    level: highImpact ? 'high-impact' : 'low-risk',
    requiresConfirmation: highImpact,
    rationale: highImpact
      ? 'This action changes security, safety, or financial state and requires explicit approval.'
      : 'This action is reversible and falls within normal comfort automation.'
  };
}

export function buildPlan(request) {
  const normalized = request.toLowerCase();
  const actions = [];

  if (normalized.includes('lock') || normalized.includes('evening') || normalized.includes('night')) {
    actions.push('Lock exterior doors');
  }
  if (normalized.includes('light') || normalized.includes('comfortable') || normalized.includes('evening')) {
    actions.push('Set living room lights to warm 35%');
  }
  if (normalized.includes('thermostat') || normalized.includes('comfortable') || normalized.includes('temperature')) {
    actions.push('Set thermostat to 20°C');
  }
  if (normalized.includes('downstairs') || normalized.includes('turn off everything')) {
    actions.push('Turn off downstairs devices except hallway light');
  }

  if (actions.length === 0) {
    actions.push('Prepare a safe household routine from the request');
  }

  const steps = actions.map((label, index) => ({
    id: index + 1,
    label,
    ...classifyAction(label)
  }));

  return {
    request,
    intent: 'Prepare requested household state',
    steps,
    requiresConfirmation: steps.some((step) => step.requiresConfirmation)
  };
}
