'use strict'

var assert = require('chai').assert;

import hello from "../src/hello.js";

describe('getting started with testing', function () {
  it('should always return "hello world"', function () {
    assert.equal("hello world", hello());
    assert.equal("hello world", hello(42));
  });
});
