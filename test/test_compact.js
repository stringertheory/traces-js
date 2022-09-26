var assert = require("chai").assert;

import { Trace } from "../src/trace.js";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeRandomTrace(n, min = 0, max = 2) {
  let trace = new Trace([]);
  for (let i = 0; i < n; i++) {
    trace.set(i, getRandomInt(min, max));
  }
  return trace;
}

describe("testing compact", function () {
  it("should not have consective equal values", function () {
    let trace = new Trace([]);
    trace.set(0, "A");
    trace.set(1, "B");
    trace.set(2, "B");
    trace.set(3, "C");

    assert.equal(trace.size, 4);
    assert.equal(trace.compact().size, 3);
    assert.deepEqual(
      [...trace.compact()],
      [
        [0, "A"],
        [1, "B"],
        [3, "C"],
      ]
    );

    let traceB = new Trace([], "A");
    traceB.set(0, "A");
    traceB.set(1, "B");
    traceB.set(2, "B");
    traceB.set(3, "C");

    assert.equal(traceB.size, 4);
    assert.equal(traceB.compact().size, 2);
    assert.deepEqual(
      [...traceB.compact()],
      [
        [1, "B"],
        [3, "C"],
      ]
    );
  });

  it("should be equal everywhere", function () {
    const nTrials = 20;
    const traceLength = 50;

    for (let j = 0; j < nTrials; j++) {
      const trace = makeRandomTrace(traceLength, 0, j);
      const compact = trace.compact();

      for (let i = 0; i < traceLength / 5; i++) {
        let t = getRandomInt(-5, traceLength + 5);
        assert.equal(trace.get(t), compact.get(t));
      }
    }
  });
});
