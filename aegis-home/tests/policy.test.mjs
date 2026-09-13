import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, classifyAction } from '../src/policy.mjs';

test('security actions require explicit confirmation', () => {
  const result = classifyAction('Lock exterior doors');
  assert.equal(result.level, 'high-impact');
  assert.equal(result.requiresConfirmation, true);
});

test('comfort actions remain low risk', () => {
  const result = classifyAction('Set living room lights to warm 35%');
  assert.equal(result.level, 'low-risk');
  assert.equal(result.requiresConfirmation, false);
});

test('evening routine includes a confirmation gate', () => {
  const plan = buildPlan('Start my evening routine and make the house comfortable.');
  assert.ok(plan.steps.length >= 3);
  assert.equal(plan.requiresConfirmation, true);
  assert.ok(plan.steps.some((step) => step.label.includes('Lock exterior doors')));
});

test('pure comfort request can proceed without a confirmation gate', () => {
  const plan = buildPlan('Set the thermostat to a comfortable temperature.');
  assert.equal(plan.requiresConfirmation, false);
});
