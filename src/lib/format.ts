import { formatUnits } from "ethers";

const encoder = new TextEncoder();

/** UTF-8 byte length, the unit every on-chain string cap uses. */
export function byteLength(s: string): number {
  return encoder.encode(s).length;
}

/** 0x12ab…9f3c */
export function shortAddress(address: string, head = 4, tail = 4): string {
  if (address.length <= 2 + head + tail) return address;
  return `${address.slice(0, 2 + head)}…${address.slice(-tail)}`;
}

/** Format a wei amount as BOT with at most `digits` significant decimals. */
export function formatBOT(wei: bigint, digits = 4): string {
  const value = Number(formatUnits(wei, 18));
  if (value === 0) return "0 BOT";
  if (value < 10 ** -digits) return `<${(10 ** -digits).toFixed(digits)} BOT`;
  return `${value.toLocaleString("en-US", { maximumFractionDigits: digits })} BOT`;
}

export function formatNumber(n: number | bigint): string {
  return n.toLocaleString("en-US");
}

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" });

/** "just now", "3m ago", "in 2h". `unixSeconds` is a block timestamp. */
export function relativeTime(unixSeconds: number | bigint, nowMs = Date.now()): string {
  const diff = Number(unixSeconds) - Math.floor(nowMs / 1000);
  const abs = Math.abs(diff);
  if (abs < 45) return "just now";
  for (const [unit, secs] of units) {
    if (abs >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return rtf.format(Math.round(diff / 60), "minute");
}
