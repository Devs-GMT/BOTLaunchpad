import { z } from "zod";
import { byteLength } from "@/lib/format";

// Shared zod building blocks. Every cap is in UTF-8 bytes, exactly like the contracts check.

export function text(label: string, maxBytes: number, { optional = false } = {}) {
  const base = z.string().transform((s) => s.trim());
  return base
    .refine((s) => optional || s.length > 0, { message: `${label} can't be empty.` })
    .refine((s) => byteLength(s) <= maxBytes, { message: `${label} is too long (${maxBytes} bytes max).` });
}

/** Value of <input type="datetime-local"> in the user's timezone. */
export function futureDateTime(label: string) {
  return z
    .string()
    .min(1, { message: `Pick ${label.toLowerCase()}.` })
    .refine((v) => !Number.isNaN(new Date(v).getTime()), { message: "That date isn't valid." })
    .refine((v) => new Date(v).getTime() > Date.now() + 60_000, { message: `${label} must be in the future.` });
}

export function toUnix(local: string): bigint {
  return BigInt(Math.floor(new Date(local).getTime() / 1000));
}

/** "YYYY-MM-DDTHH:mm" in local time, `offsetMs` from now. */
export function localDateTime(offsetMs: number): string {
  const d = new Date(Date.now() + offsetMs);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatLocal(local: string): string {
  return new Date(local).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

/** Trim a string to at most `maxBytes` UTF-8 bytes without splitting a character. */
export function clampBytes(s: string, maxBytes: number): string {
  let out = "";
  for (const ch of s) {
    if (byteLength(out + ch) > maxBytes) break;
    out += ch;
  }
  return out;
}

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;
