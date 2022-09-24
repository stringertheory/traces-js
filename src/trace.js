import {bisectRight} from "d3-array";

export class Trace {
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
}
