import type { Result } from "ethers";

/**
 * ethers v6 returns structs as `Result`, which extends Array. A field named `at` (or `length`, `map`…)
 * is shadowed by the Array method, so always convert to plain objects before reading fields.
 */
export function structs<T>(value: unknown): T[] {
  return Array.from(value as Result, (item) => (item as Result).toObject(true) as T);
}

export function struct<T>(value: unknown): T {
  return (value as Result).toObject(true) as T;
}
