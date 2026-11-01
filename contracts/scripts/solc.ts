// Deterministic, isolated compilation of each template with solc-js 0.8.20.
// The deployable bytecode AND the Verify helper's standard-JSON come from this one input, so explorers
// reproduce the exact bytecode (full match, including the metadata IPFS hash).
// Hardhat artifacts are only used by the tests: Hardhat compiles templates together with test files and
// injects remappings into the settings, which would change the metadata hash.
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const solc = require("solc") as { compile(input: string): string; version(): string };

export const SOLC_LONG_VERSION = "0.8.20+commit.a1b79de6";

export const SETTINGS = {
  optimizer: { enabled: true, runs: 200 },
  evmVersion: "paris",
} as const;

export interface CompiledTemplate {
  sourcePath: string;
  source: string;
  standardInput: {
    language: "Solidity";
    sources: Record<string, { content: string }>;
    settings: typeof SETTINGS & { outputSelection: Record<string, Record<string, string[]>> };
  };
  abi: unknown[];
  bytecode: `0x${string}`;
  deployedBytecode: `0x${string}`;
}

export async function compileTemplate(contractName: string): Promise<CompiledTemplate> {
  if (!solc.version().startsWith(SOLC_LONG_VERSION)) throw new Error(`solc-js is ${solc.version()}, expected ${SOLC_LONG_VERSION}`);
  const sourcePath = `contracts/templates/${contractName}.sol`;
  const raw = await readFile(new URL(`../${sourcePath}`, import.meta.url), "utf8");
  const source = raw.replace(/\r\n/g, "\n");
  const standardInput = {
    language: "Solidity" as const,
    sources: { [sourcePath]: { content: source } },
    settings: { ...SETTINGS, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(standardInput)));
  const errors = (output.errors ?? []).filter((e: { severity: string }) => e.severity === "error");
  if (errors.length) throw new Error(`${contractName}: ${errors.map((e: { formattedMessage: string }) => e.formattedMessage).join("\n")}`);
  const c = output.contracts[sourcePath][contractName];
  return {
    sourcePath,
    source,
    standardInput,
    abi: c.abi,
    bytecode: `0x${c.evm.bytecode.object}`,
    deployedBytecode: `0x${c.evm.deployedBytecode.object}`,
  };
}
