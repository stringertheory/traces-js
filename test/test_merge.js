"use strict";

var assert = require("chai").assert;

import { merge } from "../src/merge.js";
import { Trace } from "../src/trace.js";

describe("testing merge", function () {
  let traceA = new Trace(
    [
      [3, 5],
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    0
  );

  let traceB = new Trace(
    [
      [-1, 2],
      [4, 9],
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 10],
      [10, 0],
    ],
    -10
  );

  let traceC = new Trace([
    [-10, 1],
    [0, 2],
    [10, 3],
  ]);

  it("should merge multiple traces", function () {
    let trace = merge([traceA, traceB, traceC]);

    assert.deepEqual(trace.get(-15), [0, -10, undefined]);
    assert.deepEqual(trace.get(-10), [0, -10, 1]);
    assert.deepEqual(trace.get(-5), [0, -10, 1]);
    assert.deepEqual(trace.get(0), [0, 0, 2]);
    assert.deepEqual(trace.get(5), [5, 9, 2]);
    assert.deepEqual(trace.get(10), [5, 0, 3]);
    assert.deepEqual(trace.get(15), [5, 0, 3]);
  });

  it("should deal with merge defaults", function () {
    let trace = merge([traceA, traceB]);

    assert.deepEqual(trace.get(0), [0, 0]);
    assert.deepEqual(trace.get(-5), [0, -10]);
  });

  it("should allow merge operations", function () {
    let trace = merge([traceA, traceB], (d) => d.reduce((a, b) => a + b, 0));

    assert.equal(trace.get(-5), -10);
    assert.equal(trace.get(0), 0);
    assert.equal(trace.get(1.5), 2);
    assert.equal(trace.get(2), 4);
    assert.equal(trace.get(3), 15);
    assert.equal(trace.get(4), 14);
    assert.equal(trace.get(20), 5);
  });
});
