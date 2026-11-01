import { AbiCoder } from "ethers";
import { compilerSettings } from "./defineTemplate";
import type { TemplateArtifact } from "./types";

/** The exact solc input that produced the deployed bytecode (from the export script). */
export function standardInput(artifact: TemplateArtifact) {
  return artifact.standardInput;
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
