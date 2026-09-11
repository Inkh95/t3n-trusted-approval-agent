import test from "node:test";
import assert from "node:assert/strict";
import { runNebiusDemo } from "../src/nebius/demo.ts";

test("Nebius demo shows GO vs REVIEW_REQUIRED with a valid audit chain", async () => {
  const result = await runNebiusDemo();
  assert.equal(result.safe.route, "GO");
  assert.equal(result.unsafe.route, "REVIEW_REQUIRED");
  assert.equal(result.audit.valid, true);
  assert.equal(result.audit.events.length, 2);
  assert.equal(result.audit.events[0].event, "nebius.opportunity_decision");
  assert.equal(result.audit.events[1].event, "nebius.opportunity_decision");
});
