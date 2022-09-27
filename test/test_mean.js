"use strict";

var assert = require("chai").assert;

import { Trace } from "../src/trace.js";

describe("testing mean", function () {
  it("should get the correct mean over an interval", function () {
    let trace = new Trace([], 0);
    trace.set(0, 1);
    trace.set(1, 0);
    trace.set(3, 1);
    trace.set(4, 0);

    assert.equal(trace.mean(), 0.5);
    assert.equal(trace.mean({ start: 0, end: 4 }), 0.5);
    assert.equal(trace.mean({ start: -4, end: 4 }), 0.25);
    assert.equal(trace.mean({ start: 1, end: 3 }), 0);
    assert.equal(trace.mean({ start: 3, end: 5 }), 0.5);

    trace = new Trace([]);
    trace.set(0, 1);
    trace.set(1, 0);
    trace.set(3, 1);
    trace.set(4, 0);

    assert.equal(trace.mean(), 0.5);
    assert.equal(trace.mean({ start: 0, end: 4 }), 0.5);
    assert.equal(trace.mean({ start: -4, end: 4 }), 0.5);
    assert.equal(trace.mean({ start: -1, end: 1 }), 1);

    trace = new Trace([]);
    trace.set(0, 1);
    trace.set(1, 0);
    trace.set(3, 1);
    trace.set(4, 0);
    trace.set(5, null);
    trace.set(7, 1);
    trace.set(8, 0);

    assert.equal(trace.mean(), 0.5);
    assert.equal(trace.mean({ start: 0, end: 6 }), 0.4);
    assert.equal(trace.mean({ start: -4, end: 10 }), 0.375);
  });
});
