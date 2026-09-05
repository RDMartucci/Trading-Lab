// backend/src/services/indicators/ema.service.test.ts

import test from "node:test";
import assert from "node:assert/strict";

import { calculateEma } from "./ema.service.js";

test("calculateEma returns smoothed values after the first complete window", () => {
  assert.deepEqual(calculateEma([10, 20, 30, 40], 2), [null, 15, 25, 35]);
});