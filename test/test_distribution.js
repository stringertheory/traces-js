"use strict";

var assert = require("chai").assert;

import { Trace } from "../src/trace.js";
import { timeDay } from "d3-time";

describe("testing distribution", function () {
  it("should work with numbers as keys", function () {
    let trace = new Trace([], 0);
    trace.set(0, 1);
    trace.set(1, 0);
    trace.set(3, 1);
    trace.set(4, 0);

    let distribution = trace.distribution();
    assert.equal(distribution.get(0), 2 / 4);
    assert.equal(distribution.get(1), 2 / 4);

    distribution = trace.distribution(0, 6);

    assert.equal(distribution.get(0), 4 / 6);
    assert.equal(distribution.get(1), 2 / 6);

    distribution = trace.distribution(0, 6, false);

    assert.equal(distribution.get(0), 4);
    assert.equal(distribution.get(1), 2);

    distribution = trace.distribution(-1, 6, false);

    assert.equal(distribution.get(0), 5);
    assert.equal(distribution.get(1), 2);
  });

  it("should work with Dates as keys", function () {
    let trace = new Trace([], 0);
    trace.set(new Date(2042, 0, 0), 1);
    trace.set(new Date(2042, 0, 1), 0);
    trace.set(new Date(2042, 0, 3), 1);
    trace.set(new Date(2042, 0, 4), 0);

    let distribution = trace.distribution();
    assert.equal(distribution.get(0), 2 / 4);
    assert.equal(distribution.get(1), 2 / 4);

    distribution = trace.distribution(
      new Date(2042, 0, 0),
      new Date(2042, 0, 6)
    );
    assert.equal(distribution.get(0), 4 / 6);
    assert.equal(distribution.get(1), 2 / 6);

    distribution = trace.distribution(
      new Date(2042, 0, 0),
      new Date(2042, 0, 6),
      false
    );
    assert.equal(distribution.get(0), 345600000);
    assert.equal(distribution.get(1), 172800000);

    distribution = trace.distribution(
      new Date(2042, 0, 0),
      new Date(2042, 0, 7),
      true
    );
    assert.equal(distribution.get(0), 5 / 7);
    assert.equal(distribution.get(1), 2 / 7);

    distribution = trace.distribution(
      new Date(2042, 0, 0),
      new Date(2042, 0, 6),
      false,
      timeDay.count
    );
    assert.equal(distribution.get(0), 4);
    assert.equal(distribution.get(1), 2);
  });
});
