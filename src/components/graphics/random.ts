/** Deterministic 0..1 hash so server and client render identical art. */
export function hash01(...n: number[]): number {
  let h = 2166136261;
  for (const v of n) {
    h ^= v + 0x9e3779b9 + (h << 6) + (h >>> 2);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10_000) / 10_000;
}
