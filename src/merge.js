import { Trace } from "./trace";

export function merge(traceList, operation = (d) => d) {
  let keys = new Set(traceList.map((d) => d.list).flat());
  let result = new Trace([], operation(traceList.map((d) => d.defaultValue)));
  for (let k of keys) {
    result.set(k, operation(traceList.map((d) => d.get(k))));
  }
  return result;
}
