// Writes src/generated/templates.json (deployable bytecode, ABI, code hash, source, standard-JSON per template)
// and src/generated/registry.json (registry ABI).
// Run on the in-process network: `pnpm -C contracts export` (no --network flag).
import { mkdir, writeFile } from "node:fs/promises";
import hre from "hardhat";
import { SETTINGS, SOLC_LONG_VERSION, compileTemplate } from "./solc.js";
import { GENERATED_DIR, TEMPLATES } from "./templates.js";

const { ethers } = await hre.network.create();
const [deployer] = await ethers.getSigners();
if (!deployer) throw new Error("No signer available on the in-process network");

const templates = [];
for (const t of TEMPLATES) {
  const compiled = await compileTemplate(t.contractName);
  const runtimeCodeHash = ethers.keccak256(compiled.deployedBytecode);

  // Deploy once to measure gas and prove the on-chain code hash equals the compiled runtime code.
  const factory = new ethers.ContractFactory(compiled.abi as never, compiled.bytecode, deployer);
  const args = t.sampleArgs();
  const deployTx = await factory.getDeployTransaction(...args);
  const deployGas = await ethers.provider.estimateGas({ ...deployTx, from: deployer.address });
  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();
  const onChain = ethers.keccak256(await ethers.provider.getCode(await contract.getAddress()));
  if (onChain !== runtimeCodeHash) throw new Error(`${t.contractName}: on-chain code hash ${onChain} != compiled ${runtimeCodeHash}`);

  const abi = compiled.abi as { type: string; inputs?: { type: string }[]; stateMutability?: string }[];
  const constructorTypes = abi.find((x) => x.type === "constructor")?.inputs?.map((i) => i.type) ?? [];
  const functionsCount = abi.filter((x) => x.type === "function" && x.stateMutability !== "view" && x.stateMutability !== "pure").length;

  templates.push({
    id: t.id,
    slug: t.slug,
    contractName: t.contractName,
    fileName: `${t.contractName}.sol`,
    sourcePath: compiled.sourcePath,
    abi: compiled.abi,
    bytecode: compiled.bytecode,
    runtimeCodeHash,
    constructorTypes,
    functionsCount,
    deployGas: Number(deployGas),
    source: compiled.source,
    standardInput: compiled.standardInput,
  });
  console.log(`✓ ${t.contractName.padEnd(13)} gas ${deployGas.toString().padStart(8)}  ${runtimeCodeHash}`);
}

const compiler = {
  version: SOLC_LONG_VERSION,
  optimizer: SETTINGS.optimizer,
  evmVersion: SETTINGS.evmVersion,
  bytecodeHash: "ipfs",
  license: "MIT",
};

const registry = await hre.artifacts.readArtifact("LaunchpadRegistry");
await mkdir(GENERATED_DIR, { recursive: true });

// Templates (ABI + bytecode + source) are only needed by launch/contract/verify pages. The registry ABI is
// tiny and used everywhere (home stats, footer), so it ships as its own file.
const templatesFile = new URL("templates.json", GENERATED_DIR);
await writeFile(templatesFile, JSON.stringify({ version: 2, compiler, templates }, null, 2) + "\n");
const registryFile = new URL("registry.json", GENERATED_DIR);
await writeFile(registryFile, JSON.stringify({ version: 1, abi: registry.abi }, null, 2) + "\n");
console.log(`\nWrote ${templatesFile.pathname}\nWrote ${registryFile.pathname}`);
