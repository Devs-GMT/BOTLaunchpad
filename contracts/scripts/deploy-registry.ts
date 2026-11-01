// Deploys LaunchpadRegistry with the code hashes from src/generated/templates.json
// and records the address in src/generated/deployments.json.
//   pnpm -C contracts deploy:registry --network botTestnet
import { readFile, writeFile } from "node:fs/promises";
import hre from "hardhat";
import { GENERATED_DIR, TEMPLATES } from "./templates.js";

const { ethers, networkName } = await hre.network.create();
const { chainId } = await ethers.provider.getNetwork();
if (chainId !== 968n && chainId !== 677n) {
  throw new Error(`Refusing to deploy to chain ${chainId}: use --network botTestnet or botMainnet`);
}

const generated = JSON.parse(await readFile(new URL("templates.json", GENERATED_DIR), "utf8"));

// Guard against a stale templates.json: hashes must match the freshly compiled artifacts.
const hashes: string[] = [];
for (const t of TEMPLATES) {
  const artifact = await hre.artifacts.readArtifact(t.contractName);
  const fresh = ethers.keccak256(artifact.deployedBytecode);
  const exported = generated.templates.find((x: { id: number }) => x.id === t.id)?.runtimeCodeHash;
  if (fresh !== exported) throw new Error(`${t.contractName}: templates.json is stale. Run \`pnpm -C contracts export\`.`);
  hashes.push(fresh);
}

const [deployer] = await ethers.getSigners();
if (!deployer) throw new Error("No deployer: set DEPLOYER_KEY (env var or `hardhat keystore set DEPLOYER_KEY`)");
const balance = await ethers.provider.getBalance(deployer.address);
console.log(`Network   ${networkName} (${chainId})`);
console.log(`Deployer  ${deployer.address}  balance ${ethers.formatEther(balance)} BOT`);

const factory = new ethers.ContractFactory(generated.registry.abi, generated.registry.bytecode, deployer);
const registry = await factory.deploy(hashes);
const tx = registry.deploymentTransaction();
console.log(`Tx        ${tx?.hash}`);
const receipt = await tx?.wait();
const address = await registry.getAddress();
console.log(`Registry  ${address}  (block ${receipt?.blockNumber})`);

const deploymentsUrl = new URL("deployments.json", GENERATED_DIR);
const deployments = JSON.parse(await readFile(deploymentsUrl, "utf8").catch(() => "{}"));
deployments[chainId.toString()] = {
  registry: address,
  blockNumber: receipt?.blockNumber ?? null,
  txHash: tx?.hash ?? null,
  deployedAt: new Date().toISOString(),
};
await writeFile(deploymentsUrl, JSON.stringify(deployments, null, 2) + "\n");
console.log(`Saved to ${deploymentsUrl.pathname}`);
