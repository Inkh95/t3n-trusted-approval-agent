import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, classifyAction } from '../src/policy.mjs';

test('security actions require explicit confirmation', () => {
  const result = classifyAction('Lock exterior doors');
  assert.equal(result.level, 'high-impact');
  assert.equal(result.category, 'security');
  assert.equal(result.requiresConfirmation, true);
});

test('unlock is treated as critical physical-access risk', () => {
  const result = classifyAction('Unlock exterior door');
  assert.equal(result.level, 'critical');
  assert.equal(result.requiresConfirmation, true);
  assert.equal(result.reversible, false);
});

test('natural open-door phrasing cannot bypass physical-access policy', () => {
  for (const request of ['Open the front door', 'Open exterior door', 'Open my garage gate']) {
    const plan = buildPlan(request);
    assert.equal(plan.policy.highestRisk, 'critical');
    assert.equal(plan.requiresConfirmation, true);
    assert.equal(plan.executionBoundary, 'blocked-until-explicit-approval');
  }
});

test('comfort actions remain low risk', () => {
  const result = classifyAction('Set living room lights to warm 35%');
  assert.equal(result.level, 'low-risk');
  assert.equal(result.requiresConfirmation, false);
  assert.equal(result.reversible, true);
});

test('evening routine includes a confirmation gate', () => {
  const plan = buildPlan('Start my evening routine and make the house comfortable.');
  assert.ok(plan.steps.length >= 3);
  assert.equal(plan.requiresConfirmation, true);
  assert.equal(plan.executionBoundary, 'blocked-until-explicit-approval');
  assert.ok(plan.steps.some((step) => step.label.includes('Lock exterior doors')));
});

test('pure comfort request can proceed without a confirmation gate', () => {
  const plan = buildPlan('Set the thermostat to a comfortable temperature.');
  assert.equal(plan.requiresConfirmation, false);
  assert.equal(plan.policy.highestRisk, 'low-risk');
  assert.equal(plan.executionBoundary, 'safe-to-simulate');
});

test('financial actions cannot silently execute', () => {
  for (const request of ['Buy household supplies', 'Order more filters', 'Pay for household supplies']) {
    const plan = buildPlan(request);
    assert.equal(plan.requiresConfirmation, true);
    assert.ok(plan.steps.some((step) => step.category === 'financial'));
  }
});

test('safety-sensitive appliance actions cannot silently execute', () => {
  for (const request of ['Turn on the oven', 'Start the heater', 'Turn on the fireplace']) {
    const plan = buildPlan(request);
    assert.equal(plan.requiresConfirmation, true);
    assert.ok(plan.steps.some((step) => step.category === 'safety'));
  }
});

test('mixed critical and comfort request keeps critical boundary', () => {
  const plan = buildPlan('Open the front door and make the lights comfortable');
  assert.equal(plan.policy.highestRisk, 'critical');
  assert.equal(plan.requiresConfirmation, true);
  assert.ok(plan.steps.some((step) => step.category === 'comfort'));
  assert.ok(plan.steps.some((step) => step.level === 'critical'));
});
