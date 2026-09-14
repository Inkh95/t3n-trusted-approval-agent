const POLICY_RULES = [
  { pattern: /unlock|open (the )?(door|garage)/i, level: 'critical', category: 'security', confirmation: true, rationale: 'This action can grant physical access and always requires explicit approval.' },
  { pattern: /lock|alarm|security/i, level: 'high-impact', category: 'security', confirmation: true, rationale: 'This action changes home security state and requires explicit approval.' },
  { pattern: /oven|stove|heater/i, level: 'high-impact', category: 'safety', confirmation: true, rationale: 'This action can affect physical safety and requires explicit approval.' },
  { pattern: /purchase|buy|order/i, level: 'high-impact', category: 'financial', confirmation: true, rationale: 'This action can create a financial commitment and requires explicit approval.' }
];

export function classifyAction(label) {
  const rule = POLICY_RULES.find(({ pattern }) => pattern.test(label));
  if (rule) {
    return {
      level: rule.level,
      category: rule.category,
      requiresConfirmation: rule.confirmation,
      rationale: rule.rationale,
      reversible: false
    };
  }

  return {
    level: 'low-risk',
    category: 'comfort',
    requiresConfirmation: false,
    rationale: 'This action is reversible and falls within normal comfort automation.',
    reversible: true
  };
}

export function buildPlan(request) {
  const normalized = request.trim().toLowerCase();
  const actions = [];

  if (normalized.includes('unlock')) actions.push('Unlock exterior door');
  else if (normalized.includes('lock') || normalized.includes('evening') || normalized.includes('night')) actions.push('Lock exterior doors');

  if (normalized.includes('light') || normalized.includes('comfortable') || normalized.includes('evening')) actions.push('Set living room lights to warm 35%');
  if (normalized.includes('thermostat') || normalized.includes('comfortable') || normalized.includes('temperature')) actions.push('Set thermostat to 20°C');
  if (normalized.includes('downstairs') || normalized.includes('turn off everything')) actions.push('Turn off downstairs devices except hallway light');
  if (normalized.includes('oven')) actions.push('Turn on oven');
  if (normalized.includes('buy') || normalized.includes('purchase') || normalized.includes('order')) actions.push('Place household purchase');

  if (actions.length === 0) actions.push('Prepare a safe household routine from the request');

  const steps = actions.map((label, index) => ({ id: index + 1, label, ...classifyAction(label) }));
  const consequential = steps.filter((step) => step.requiresConfirmation);

  return {
    request,
    intent: 'Prepare requested household state',
    steps,
    policy: {
      version: 'aegis-home-v2',
      consequentialActions: consequential.length,
      highestRisk: steps.some((s) => s.level === 'critical') ? 'critical' : consequential.length ? 'high-impact' : 'low-risk'
    },
    requiresConfirmation: consequential.length > 0,
    executionBoundary: consequential.length > 0 ? 'blocked-until-explicit-approval' : 'safe-to-simulate'
  };
}
