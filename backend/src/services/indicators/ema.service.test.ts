// backend/src/services/indicators/ema.service.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { calculateEma } from "./ema.service.js";

describe("calculateEma", () => {
  it("calculates EMA correctly", () => {
    const result = calculateEma(
      [10, 20, 30, 40],
      2
    );

    assert.deepEqual(result, [
      null,
      15,
      25,
      35
    ]);
  });

  it("returns null values when there is insufficient data", () => {
    const result = calculateEma(
      [10, 20],
      3
    );

    assert.deepEqual(result, [
      null,
      null
    ]);
  });

  it("supports period 1", () => {
    const result = calculateEma(
      [10, 20, 30],
      1
    );

    assert.deepEqual(result, [
      10,
      20,
      30
    ]);
  });

  it("rejects a non-positive period", () => {
    assert.throws(
      () => calculateEma([10, 20, 30], 0),
      /positive integer/
    );
  });

  it("rejects a non-integer period", () => {
    assert.throws(
      () => calculateEma([10, 20, 30], 2.5),
      /positive integer/
    );
  });
});