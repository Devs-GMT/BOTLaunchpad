// Writes src/generated/templates.json: ABI, bytecode, runtime code hash, source and settings per template.
// Run on the in-process network: `pnpm -C contracts export` (no --network flag).
import { readFile, writeFile, mkdir } from "node:fs/promises";
import hre from "hardhat";
import { GENERATED_DIR, TEMPLATES } from "./templates.js";

const { ethers } = await hre.network.create();
const [deployer] = await ethers.getSigners();
if (!deployer) throw new Error("No signer available on the in-process network");

async function compilerInfo(contractName: string) {
  const id = await hre.artifacts.getBuildInfoId(contractName);
  const path = id && (await hre.artifacts.getBuildInfoPath(id));
  if (!path) throw new Error(`No build info for ${contractName}. Run \`hardhat build\` first.`);
  const info = JSON.parse(await readFile(path, "utf8"));
  const settings = info.input.settings;
  return {
    version: info.solcLongVersion as string,
    optimizer: settings.optimizer as { enabled: boolean; runs: number },
    evmVersion: settings.evmVersion as string,
    bytecodeHash: (settings.metadata?.bytecodeHash ?? "ipfs") as string,
    license: "MIT",
  };
}

const templates = [];
let compiler: Awaited<ReturnType<typeof compilerInfo>> | undefined;

for (const t of TEMPLATES) {
  const artifact = await hre.artifacts.readArtifact(t.contractName);
  const info = await compilerInfo(t.contractName);
  if (compiler && JSON.stringify(compiler) !== JSON.stringify(info)) {
    throw new Error(`${t.contractName} was compiled with different settings`);
  }
  compiler = info;

  const runtimeCodeHash = ethers.keccak256(artifact.deployedBytecode);

  // Deploy once to measure gas and prove the on-chain code hash equals the artifact's.
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  const args = t.sampleArgs();
  const deployTx = await factory.getDeployTransaction(...args);
  const deployGas = await ethers.provider.estimateGas({ ...deployTx, from: deployer.address });
  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();
  const onChain = ethers.keccak256(await ethers.provider.getCode(await contract.getAddress()));
  if (onChain !== runtimeCodeHash) {
    throw new Error(`${t.contractName}: on-chain code hash ${onChain} != artifact ${runtimeCodeHash}`);
  }

  const ctor = artifact.abi.find((x) => x.type === "constructor");
  const constructorTypes = ctor && "inputs" in ctor ? ctor.inputs.map((i) => i.type) : [];
  const functionsCount = artifact.abi.filter(
    (x) => x.type === "function" && x.stateMutability !== "view" && x.stateMutability !== "pure",
  ).length;

  const fileName = `${t.contractName}.sol`;
  const source = await readFile(new URL(`../contracts/templates/${fileName}`, import.meta.url), "utf8");

  templates.push({
    id: t.id,
    slug: t.slug,
    contractName: t.contractName,
    fileName,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    runtimeCodeHash,
    constructorTypes,
    functionsCount,
    deployGas: Number(deployGas),
    source: source.replace(/\r\n/g, "\n"),
  });
  console.log(`✓ ${t.contractName.padEnd(13)} gas ${deployGas.toString().padStart(8)}  ${runtimeCodeHash}`);
}

const registry = await hre.artifacts.readArtifact("LaunchpadRegistry");
const out = {
  version: 1,
  compiler,
  templates,
  registry: { abi: registry.abi, bytecode: registry.bytecode },
};

await mkdir(GENERATED_DIR, { recursive: true });
const target = new URL("templates.json", GENERATED_DIR);
await writeFile(target, JSON.stringify(out, null, 2) + "\n");
console.log(`\nWrote ${target.pathname}`);
