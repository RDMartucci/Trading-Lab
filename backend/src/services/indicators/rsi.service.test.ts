import test from "node:test";
import assert from "node:assert/strict";

import { calculateRsi } from "./rsi.service.js";

test("calculateRsi returns values after the initial period", () => {
  const values = calculateRsi([1, 2, 3, 2, 2, 3], 3);

  assert.deepEqual(values, [null, null, null, 66.666667, 66.666667, 80.952381]);
});