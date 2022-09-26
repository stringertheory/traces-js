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
});
