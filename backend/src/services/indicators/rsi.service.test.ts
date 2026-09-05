// backend/src/services/indicators/rsi.service.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { calculateRsi } from "./rsi.service.js";

describe("calculateRsi", () => {
  it("calculates RSI correctly", () => {
    const result = calculateRsi(
      [1, 2, 3, 2, 2, 3],
      3
    );

    assert.deepEqual(result, [
      null,
      null,
      null,
      66.666667,
      66.666667,
      80.952381
    ]);
  });

  it("returns null values when there is insufficient data", () => {
    const result = calculateRsi(
      [1, 2, 3],
      3
    );

    assert.deepEqual(result, [
      null,
      null,
      null
    ]);
  });

  it("supports period 1", () => {
    const result = calculateRsi(
      [10, 11, 10],
      1
    );

    assert.equal(result[0], null);
    assert.equal(result[1], 100);
    assert.equal(result[2], 0);
  });

  it("rejects a non-positive period", () => {
    assert.throws(
      () => calculateRsi([10, 20, 30], 0),
      /positive integer/
    );
  });

  it("rejects a non-integer period", () => {
    assert.throws(
      () => calculateRsi([10, 20, 30], 1.5),
      /positive integer/
    );
  });
});