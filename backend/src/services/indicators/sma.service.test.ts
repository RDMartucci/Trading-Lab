// backend/src/services/indicators/sma.service.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { calculateSma } from "./sma.service.js";

describe("calculateSma", () => {
  it("calculates SMA correctly", () => {
    const result = calculateSma(
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

  it("returns null values until enough data exists", () => {
    const result = calculateSma(
      [10, 20],
      3
    );

    assert.deepEqual(result, [
      null,
      null
    ]);
  });

  it("supports period 1", () => {
    const result = calculateSma(
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
      () => calculateSma([10, 20, 30], 0),
      /positive integer/
    );
  });

  it("rejects a non-integer period", () => {
    assert.throws(
      () => calculateSma([10, 20, 30], 1.5),
      /positive integer/
    );
  });
});