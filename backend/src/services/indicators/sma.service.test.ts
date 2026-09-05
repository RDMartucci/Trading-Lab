// backend/src/services/indicators/sma.service.test.ts

import test from "node:test";
import assert from "node:assert/strict";

import { calculateSma } from "./sma.service.js";

test("calculateSma returns a moving average for each valid window", () => {
  const values = calculateSma([10, 20, 30, 40], 2);

  assert.deepEqual(values, [null, 15, 25, 35]);
});
