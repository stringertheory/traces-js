'use strict'

var assert = require('chai').assert;

import {Trace} from "../src/trace.js";

describe('testing basics', function () {

  let traceA = new Trace();
  traceA.set(1.2, 1)
  traceA.set(3, 0)
  traceA.set(6, 2)

  it('should initialize like a Map', function () {

    let traceB = new Trace([
      [1.2, 1],
      [3, 0],
      [6, 2],
    ]);
    
    assert.deepEqual([...traceA], [...traceB]);
    
  });
  
  it('should be OK with using Dates as keys', function () {
    
    let trace = new Trace([
      [new Date(2012, 1, 1), 1],
      [new Date(2012, 1, 3, 4, 0, 0), -1],
      [new Date(2012, 1, 3, 8, 0, 0), -2],
      [new Date(2012, 1, 2), 5]
    ]);
    
    assert.equal(trace.get(new Date(2011, 1, 1)), undefined);
    assert.equal(trace.get(new Date(2012, 1, 1, 5)), 1);
    assert.equal(trace.get(new Date(2012, 1, 2, 5)), 5);
    assert.equal(trace.get(new Date(2012, 1, 3, 6)), -1);
    assert.equal(trace.get(new Date(2012, 1, 4)), -2);
    
  });

  it('should not allow duplicate keys', function () {

    let trace = new Trace()
    trace.set(1, "red")
    trace.set(1, "green")
    
    assert.equal(trace.map.size, 1)
        
  });

  it('should not allow duplicate keys (even for Dates)', function () {

    let trace = new Trace()
    trace.set(new Date(Date.UTC(2001, 0, 1)), "red")
    trace.set(new Date(Date.UTC(2001, 0, 1)), "green")
    
    assert.equal(trace.map.size, 1)
    
  });
  
  
  it('should not depend on order of setting values', function () {
    
    let traceB = new Trace();
    traceB.set(3, 0)
    traceB.set(6, 2)
    traceB.set(1.2, 1)

    assert.deepEqual([...traceA], [...traceB]);
    assert.equal(traceA.defaultValue, traceB.defaultValue);
    
  });
  
  it('should return the right values when using get', function () {
    
    assert.equal(traceA.get(-1), undefined);
    assert.equal(traceA.get(3), 0);
    assert.equal(traceA.get(5.5), 0);
    assert.equal(traceA.get(7), 2)
    
  });

  it('should allow a default value', function () {

    let trace = new Trace([], 0);
    trace.set(3, 1)
    trace.set(6, 2)
    trace.set(1.2, 3)
    
    assert.equal(trace.get(-1), 0);
    assert.equal(trace.get(1), 0);
    assert.equal(trace.get(1.2), 3);
    assert.equal(trace.get(1.5), 3);
    assert.equal(trace.get(3), 1);
    assert.equal(trace.get(5.5), 1);
    assert.equal(trace.get(7), 2)

    let traceB = new Trace([[5, 10]], 0);
    
    assert.equal(traceB.get(2), 0);
    assert.equal(traceB.get(6), 10);
    
  });

  it('should be able to delete items', function () {

    let trace = new Trace([], 0);
    trace.set(3, 1)
    trace.set(6, 2)
    trace.set(1.2, 3)

    trace.delete(1.2)
    assert.deepEqual([...trace], [[3, 1], [6, 2]])
    
    trace.delete(6)
    assert.deepEqual([...trace], [[3, 1]])

    trace.delete(9)
    assert.deepEqual([...trace], [[3, 1]])

    trace.delete(3)
    assert.deepEqual([...trace], [])

    trace.delete(3)
    assert.deepEqual([...trace], [])

    trace = new Trace([
      [new Date(2012, 1, 1), 1],
      [new Date(2012, 1, 2), 5]
    ], 0);

    assert.deepEqual([...trace], [
      [new Date(2012, 1, 1), 1],
      [new Date(2012, 1, 2), 5]
    ])

    trace.delete(new Date(2012, 1, 1))
    assert.deepEqual([...trace], [[new Date(2012, 1, 2), 5]]);

    trace.delete(new Date(2012, 8, 1))
    assert.deepEqual([...trace], [[new Date(2012, 1, 2), 5]]);
    
    trace.delete(new Date(2012, 1, 2))
    assert.deepEqual([...trace], []);
    
  });
  
  
});
