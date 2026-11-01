import { AbiCoder } from "ethers";
import { compilerSettings } from "./defineTemplate";
import type { TemplateArtifact } from "./types";

/** Solidity standard-JSON input that reproduces the deployed bytecode exactly (incl. `bytecodeHash: none`). */
export function standardInput(artifact: TemplateArtifact) {
  return {
    language: "Solidity",
    sources: { [artifact.fileName]: { content: artifact.source } },
    settings: {
      optimizer: compilerSettings.optimizer,
      evmVersion: compilerSettings.evmVersion,
      metadata: { bytecodeHash: compilerSettings.bytecodeHash },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode", "evm.deployedBytecode", "metadata"] } },
    },
  };
}

/** ABI-encoded constructor arguments, without the 0x prefix (what explorers expect). */
export function encodeConstructorArgs(artifact: TemplateArtifact, args: unknown[]): string {
  return AbiCoder.defaultAbiCoder().encode(artifact.constructorTypes, args).slice(2);
}

export const compiler = {
  version: `v${compilerSettings.version}`,
  optimizer: compilerSettings.optimizer,
  evmVersion: compilerSettings.evmVersion,
  bytecodeHash: compilerSettings.bytecodeHash,
  license: compilerSettings.license,
};
