const POLICY_RULES = [
  { pattern: /\b(unlock|open)\b.*\b(door|garage|gate)\b/i, level: 'critical', category: 'security', confirmation: true, rationale: 'This action can grant physical access and always requires explicit approval.' },
  { pattern: /\b(lock|arm|disarm|alarm|security)\b/i, level: 'high-impact', category: 'security', confirmation: true, rationale: 'This action changes home security state and requires explicit approval.' },
  { pattern: /\b(oven|stove|heater|fireplace|heat-producing appliance)\b/i, level: 'high-impact', category: 'safety', confirmation: true, rationale: 'This action can affect physical safety and requires explicit approval.' },
  { pattern: /\b(purchase|buy|order|checkout|pay)\b/i, level: 'high-impact', category: 'financial', confirmation: true, rationale: 'This action can create a financial commitment and requires explicit approval.' }
];

export function classifyAction(label) {
  const rule = POLICY_RULES.find(({ pattern }) => pattern.test(label));
  if (rule) return { level: rule.level, category: rule.category, requiresConfirmation: rule.confirmation, rationale: rule.rationale, reversible: false };
  return { level: 'low-risk', category: 'comfort', requiresConfirmation: false, rationale: 'This action is reversible and falls within normal comfort automation.', reversible: true };
}

export function buildPlan(request) {
  const normalized = request.trim().toLowerCase();
  const actions = [];
  const asksToOpenAccess = /\b(unlock|open)\b.*\b(door|garage|gate)\b/i.test(normalized);

  if (asksToOpenAccess) actions.push('Unlock exterior door');
  else if (/\block\b|\bevening\b|\bnight\b/i.test(normalized)) actions.push('Lock exterior doors');

  if (/\blight|comfortable|evening\b/i.test(normalized)) actions.push('Set living room lights to warm 35%');
  if (/thermostat|comfortable|temperature/i.test(normalized)) actions.push('Set thermostat to 20°C');
  if (/downstairs|turn off everything/i.test(normalized)) actions.push('Turn off downstairs devices except hallway light');
  if (/oven|stove|heater|fireplace/i.test(normalized)) actions.push('Turn on heat-producing appliance');
  if (/\b(buy|purchase|order|checkout|pay)\b/i.test(normalized)) actions.push('Place household purchase');

  if (actions.length === 0) actions.push('Prepare a safe household routine from the request');

  const steps = actions.map((label, index) => ({ id: index + 1, label, ...classifyAction(label) }));
  const consequential = steps.filter((step) => step.requiresConfirmation);
  return {
    request,
    intent: 'Prepare requested household state',
    steps,
    policy: { version: 'aegis-home-v2', consequentialActions: consequential.length, highestRisk: steps.some((s) => s.level === 'critical') ? 'critical' : consequential.length ? 'high-impact' : 'low-risk' },
    requiresConfirmation: consequential.length > 0,
    executionBoundary: consequential.length > 0 ? 'blocked-until-explicit-approval' : 'safe-to-simulate'
  };
}
