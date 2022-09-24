(() => {
  // src/hello.js
  function hello() {
    return "hello world";
  }

  // node_modules/d3-array/src/ascending.js
  function ascending(a, b) {
    return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // node_modules/d3-array/src/descending.js
  function descending(a, b) {
    return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  }

  // node_modules/d3-array/src/bisector.js
  function bisector(f) {
    let compare1, compare2, delta;
    if (f.length !== 2) {
      compare1 = ascending;
      compare2 = (d, x) => ascending(f(d), x);
      delta = (d, x) => f(d) - x;
    } else {
      compare1 = f === ascending || f === descending ? f : zero;
      compare2 = f;
      delta = f;
    }
    function left(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0)
          return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x) < 0)
            lo = mid + 1;
          else
            hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function right(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0)
          return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x) <= 0)
            lo = mid + 1;
          else
            hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function center(a, x, lo = 0, hi = a.length) {
      const i = left(a, x, lo, hi - 1);
      return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
    }
    return { left, center, right };
  }
  function zero() {
    return 0;
  }

  // node_modules/d3-array/src/number.js
  function number(x) {
    return x === null ? NaN : +x;
  }

  // node_modules/d3-array/src/bisect.js
  var ascendingBisect = bisector(ascending);
  var bisectRight = ascendingBisect.right;
  var bisectLeft = ascendingBisect.left;
  var bisectCenter = bisector(number).center;

  // src/trace.js
  var Trace = class {
    constructor(items, defaultValue) {
      this.map = new Map(items);
      this.list = [...this.map.keys()].sort((a, b) => a - b);
      this.defaultValue = defaultValue;
    }
    get = (key) => {
      if (this.map.has(key)) {
        return this.map.get(key);
      } else {
        const i = bisectRight(this.list, key);
        if (i === 0) {
          return this.defaultValue;
        } else {
          const previousKey = this.list[i - 1];
          return this.map.get(previousKey);
        }
      }
    };
    set = (key, value, compact = false) => {
      if (compact) {
        throw "not implemented";
      }
      if (!this.map.has(key)) {
        this.list.splice(bisectRight(this.list, key), 0, key);
      }
      return this.map.set(key, value);
    };
    items() {
      return [...this];
    }
    *[Symbol.iterator]() {
      for (let key of this.list) {
        yield [key, this.map.get(key)];
      }
    }
    compact() {
      let result = new Trace([], this.defaultValue);
      let previousValue = this.defaultValue;
      for (let [t, value] of this) {
        if (value !== previousValue) {
          result.set(t, value);
        }
        previousValue = value;
      }
      return result;
    }
  };
})();
