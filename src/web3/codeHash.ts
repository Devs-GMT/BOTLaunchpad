import { keccak256 } from "ethers";
import type { NetworkConfig } from "@/config/networks";
import { readProvider } from "./providers";

export type CodeLookup = { kind: "no-code" } | { kind: "match"; templateId: number } | { kind: "unknown-code" };

/**
 * Identify a deployed template by its runtime code hash.
 * @param hashes templateId → runtimeCodeHash (from generated/templates.json)
 */
export async function lookupCode(network: NetworkConfig, address: string, hashes: ReadonlyMap<number, string>): Promise<CodeLookup> {
  const code = await readProvider(network).getCode(address);
  if (!code || code === "0x") return { kind: "no-code" };
  const hash = keccak256(code).toLowerCase();
  for (const [templateId, h] of hashes) if (h.toLowerCase() === hash) return { kind: "match", templateId };
  return { kind: "unknown-code" };
}
