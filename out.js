(() => {
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

  // node_modules/internmap/src/index.js
  var InternMap = class extends Map {
    constructor(entries, key = keyof) {
      super();
      Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
      if (entries != null)
        for (const [key2, value] of entries)
          this.set(key2, value);
    }
    get(key) {
      return super.get(intern_get(this, key));
    }
    has(key) {
      return super.has(intern_get(this, key));
    }
    set(key, value) {
      return super.set(intern_set(this, key), value);
    }
    delete(key) {
      return super.delete(intern_delete(this, key));
    }
  };
  function intern_get({ _intern, _key }, value) {
    const key = _key(value);
    return _intern.has(key) ? _intern.get(key) : value;
  }
  function intern_set({ _intern, _key }, value) {
    const key = _key(value);
    if (_intern.has(key))
      return _intern.get(key);
    _intern.set(key, value);
    return value;
  }
  function intern_delete({ _intern, _key }, value) {
    const key = _key(value);
    if (_intern.has(key)) {
      value = _intern.get(key);
      _intern.delete(key);
    }
    return value;
  }
  function keyof(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }

  // src/trace.js
  function keyof2(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }
  var Trace = class {
    constructor(items, defaultValue) {
      this.map = new InternMap(items);
      this.list = [...this.map.keys()].sort((a, b) => keyof2(a) - keyof2(b));
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
    set = (key, value) => {
      if (!this.map.has(key)) {
        this.list.splice(bisectRight(this.list, key), 0, key);
      }
      return this.map.set(key, value);
    };
    has = (key) => {
      return this.map.has(key);
    };
    delete = (key) => {
      const hadKey = this.map.delete(key);
      if (hadKey) {
        this.list.splice(bisectRight(this.list, key) - 1, 1);
      }
    };
    entries() {
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
    get size() {
      return this.map.size;
    }
    distribution(start, end, normalize = true, durationFunction = (a, b) => b - a) {
      let result = /* @__PURE__ */ new Map();
      let total = 0;
      for (let [t0, t1, value] of this.iterperiods(start, end)) {
        let duration = durationFunction(t0, t1);
        total += duration;
        result.set(value, (result.get(value) ?? 0) + duration);
      }
      if (normalize) {
        for (let v of result.keys()) {
          result.set(v, result.get(v) / total);
        }
      }
      return result;
    }
    *iterperiods(start, end) {
      const left = start ?? this.list[0];
      const right = end ?? this.list[this.list.length - 1];
      const start_index = bisectRight(this.list, left);
      const end_index = bisectRight(this.list, right);
      let start_value;
      if (start_index > 0) {
        start_value = this.get(this.list[start_index - 1]);
      } else {
        start_value = this.defaultValue;
      }
      let interval_t0 = left;
      let interval_value = start_value;
      for (let index = start_index; index < end_index; index++) {
        let interval_t1 = this.list[index];
        yield [interval_t0, interval_t1, interval_value];
        interval_t0 = interval_t1;
        interval_value = this.get(interval_t0);
      }
      if (interval_t0 < end) {
        yield [interval_t0, end, interval_value];
      }
    }
  };

  // src/merge.js
  function merge(traceList, operation = (d) => d) {
    let keys = new Set(traceList.map((d) => d.list).flat());
    let result = new Trace([], operation(traceList.map((d) => d.defaultValue)));
    for (let k of keys) {
      result.set(k, operation(traceList.map((d) => d.get(k))));
    }
    return result;
  }
})();
