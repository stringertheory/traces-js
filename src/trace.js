import { bisectRight } from "d3-array";
import { InternMap } from "internmap";

// same keyof function used by internmap
function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}

export class Trace {
  constructor(entries, defaultValue) {
    this.map = new InternMap(entries);
    this.list = [...this.map.keys()].sort((a, b) => keyof(a) - keyof(b));
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
  distribution({
    start = undefined,
    end = undefined,
    normalize = true,
    durationFunction = (a, b) => b - a,
  } = {}) {
    let result = new Map();
    let total = 0;
    for (let [t0, t1, value] of this.iterperiods({ start: start, end: end })) {
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
  *iterperiods({ start = undefined, end = undefined } = {}) {
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
  firstKey() {
    return this.list[0];
  }
  lastKey() {
    return this.list[this.list.length - 1];
  }
  firstValue() {
    return this.get(this.firstKey());
  }
  lastValue() {
    return this.get(this.lastKey());
  }
  firstEntry() {
    let key = this.firstKey();
    return [key, this.get(key)];
  }
  lastEntry() {
    let key = this.lastKey();
    return [key, this.get(key)];
  }
  getInterval(t) {
    const index = bisectRight(this.list, t);
    const t0 = this.list[index - 1] ?? -Infinity;
    const t1 = this.list[index] ?? Infinity;
    return [t0, t1, this.get(t0)];
  }
  nextInterval(t) {
    const index = bisectRight(this.list, t);
    if (index === this.list.length) {
      return undefined;
    } else {
      return this.getInterval(this.list[index]);
    }
  }
  previousInterval(t) {
    const index = bisectRight(this.list, t);
    const t0 = this.list[index - 2] ?? -Infinity;
    if (index === 0) {
      return undefined;
    } else {
      return this.getInterval(t0);
    }
  }
}
