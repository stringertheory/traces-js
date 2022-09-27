"use strict";

var assert = require("chai").assert;

import { Trace } from "../src/trace.js";

describe("testing methods", function () {
  it("should return first/last key/value/entry", function () {
    let trace = new Trace([], 0);
    trace.set(0, 1);
    trace.set(1, 0);
    trace.set(3, 1);
    trace.set(4, 0);

    assert.equal(trace.firstKey(), 0);
    assert.equal(trace.lastKey(), 4);

    assert.equal(trace.firstValue(), 1);
    assert.equal(trace.lastValue(), 0);

    assert.deepEqual(trace.firstEntry(), [0, 1]);
    assert.deepEqual(trace.lastEntry(), [4, 0]);
  });

  it("should return next/previous interval", function () {
    let trace = new Trace([], 0);
    trace.set(0, 1);
    trace.set(1, 0);
    trace.set(3, 1);
    trace.set(4, 0);

    assert.deepEqual(trace.getInterval(0.5), [0, 1, 1]);
    assert.deepEqual(trace.nextInterval(0.5), [1, 3, 0]);
    assert.deepEqual(trace.previousInterval(0.5), [-Infinity, 0, 0]);

    assert.deepEqual(trace.getInterval(1), [1, 3, 0]);
    assert.deepEqual(trace.nextInterval(1), [3, 4, 1]);
    assert.deepEqual(trace.previousInterval(1), [0, 1, 1]);

    assert.deepEqual(trace.getInterval(2), [1, 3, 0]);
    assert.deepEqual(trace.nextInterval(2), [3, 4, 1]);
    assert.deepEqual(trace.previousInterval(2), [0, 1, 1]);

    assert.deepEqual(trace.getInterval(3.5), [3, 4, 1]);
    assert.deepEqual(trace.nextInterval(3.5), [4, Infinity, 0]);
    assert.deepEqual(trace.previousInterval(3.5), [1, 3, 0]);

    assert.deepEqual(trace.getInterval(-1), [-Infinity, 0, 0]);
    assert.deepEqual(trace.nextInterval(-1), [0, 1, 1]);
    assert.deepEqual(trace.previousInterval(-1), undefined);

    assert.deepEqual(trace.getInterval(5), [4, Infinity, 0]);
    assert.deepEqual(trace.nextInterval(5), undefined);
    assert.deepEqual(trace.previousInterval(5), [3, 4, 1]);
  });
  it("should return next/previous interval with Dates", function () {
    let t0 = new Date(2042, 0, 1);
    let t1 = new Date(2042, 1, 1);
    let t2 = new Date(2042, 3, 1);
    let t3 = new Date(2042, 4, 1);

    let trace = new Trace([], 0);
    trace.set(t0, 1);
    trace.set(t1, 0);
    trace.set(t2, 1);
    trace.set(t3, 0);

    let t05 = new Date(2042, 0, 15);
    assert.deepEqual(trace.getInterval(t05), [t0, t1, 1]);
    assert.deepEqual(trace.nextInterval(t05), [t1, t2, 0]);
    assert.deepEqual(trace.previousInterval(t05), [-Infinity, t0, 0]);

    assert.deepEqual(trace.getInterval(t1), [t1, t2, 0]);
    assert.deepEqual(trace.nextInterval(t1), [t2, t3, 1]);
    assert.deepEqual(trace.previousInterval(t1), [t0, t1, 1]);

    let t35 = new Date(2042, 3, 15);
    assert.deepEqual(trace.getInterval(t35), [t2, t3, 1]);
    assert.deepEqual(trace.nextInterval(t35), [t3, Infinity, 0]);
    assert.deepEqual(trace.previousInterval(t35), [t1, t2, 0]);

    let tm = new Date(2041, 1, 1);
    assert.deepEqual(trace.getInterval(tm), [-Infinity, t0, 0]);
    assert.deepEqual(trace.nextInterval(tm), [t0, t1, 1]);
    assert.deepEqual(trace.previousInterval(tm), undefined);

    let tp = new Date(2043, 1, 1);
    assert.deepEqual(trace.getInterval(tp), [t3, Infinity, 0]);
    assert.deepEqual(trace.nextInterval(tp), undefined);
    assert.deepEqual(trace.previousInterval(tp), [t2, t3, 1]);
  });
  it("should slice correctly", function () {
    let trace = new Trace([], 0);
    trace.set(0, 1);
    trace.set(1, 0);
    trace.set(3, 1);
    trace.set(4, 0);

    let slice = trace.slice({ start: 0.5, end: 4.5 });
    assert.deepEqual(
      [...slice],
      [
        [0.5, 1],
        [1, 0],
        [3, 1],
        [4, 0],
        [4.5, 0],
      ]
    );

    // equal itself
    assert.deepEqual([...trace], [...trace.slice()]);
  });
  it("should group by value", function () {
    let trace = new Trace([], 0);
    trace.set(0, 1);
    trace.set(1, 0);
    trace.set(3, 1);
    trace.set(4, 0);

    assert.deepEqual(
      trace.group(),
      new Map([
        [0, [[1, 3]]],
        [
          1,
          [
            [0, 1],
            [3, 4],
          ],
        ],
      ])
    );

    assert.deepEqual(
      trace.group({ start: -2, end: 7 }),
      new Map([
        [
          0,
          [
            [-2, 0],
            [1, 3],
            [4, 7],
          ],
        ],
        [
          1,
          [
            [0, 1],
            [3, 4],
          ],
        ],
      ])
    );
  });
});
