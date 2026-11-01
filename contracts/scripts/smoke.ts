// End-to-end check against a live network with two wallets:
// deploy every template, register each, prove the registry rejects bad listings, interact from wallet #2.
//   pnpm -C contracts smoke --network botTestnet
import { readFile } from "node:fs/promises";
import hre from "hardhat";
import { GENERATED_DIR, TEMPLATES } from "./templates.js";

const { ethers } = await hre.network.create();
const { chainId } = await ethers.provider.getNetwork();
if (chainId !== 968n) throw new Error("Smoke test runs on testnet (968) only");

const deployments = JSON.parse(await readFile(new URL("deployments.json", GENERATED_DIR), "utf8"));
const registryAddress: string | undefined = deployments[chainId.toString()]?.registry;
if (!registryAddress) throw new Error("No registry deployed on this network");

const [owner] = await ethers.getSigners();
if (!owner) throw new Error("No deployer");
const registryArtifact = await hre.artifacts.readArtifact("LaunchpadRegistry");
const registry = new ethers.Contract(registryAddress, registryArtifact.abi, owner);

// Wallet #2: a throwaway key funded with a little gas money.
const second = ethers.Wallet.createRandom().connect(ethers.provider);
await (await owner.sendTransaction({ to: second.address, value: ethers.parseEther("0.05") })).wait();
console.log(`wallet #1 ${owner.address}\nwallet #2 ${second.address} (funded 0.05 BOT)\n`);

async function expectRevert(label: string, errorName: string, run: () => Promise<unknown>) {
  try {
    await run();
    throw new Error(`${label}: expected ${errorName}, but it succeeded`);
  } catch (err) {
    const data = (err as { data?: string }).data ?? (err as { info?: { error?: { data?: string } } }).info?.error?.data;
    const parsed = typeof data === "string" ? registry.interface.parseError(data) : null;
    const name = parsed?.name ?? (err as { revert?: { name?: string } }).revert?.name;
    if (name !== errorName) throw new Error(`${label}: expected ${errorName}, got ${name ?? String(err)}`);
    console.log(`  ✓ ${label} → ${errorName}`);
  }
}

// Deploy exactly what the website deploys: the exported bytecode.
const exported = JSON.parse(await readFile(new URL("templates.json", GENERATED_DIR), "utf8")).templates as { id: number; abi: never; bytecode: string }[];
const artifactOf = (id: number) => exported.find((x) => x.id === id)!;

const deployed: Record<string, string> = {};
for (const t of TEMPLATES) {
  const artifact = artifactOf(t.id);
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, owner);
  const contract = await factory.deploy(...t.sampleArgs());
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  deployed[t.slug] = address;
  const rx = await (await registry.getFunction("register")(address, t.id, `Smoke ${t.contractName}`)).wait();
  console.log(`✓ ${t.contractName.padEnd(13)} ${address}  registered (gas ${rx?.gasUsed})`);
}

console.log("\nRegistry rejections");
await expectRevert("wrong template id", "CodeMismatch", () => registry.getFunction("register").staticCall(deployed["todo"], 1, "x"));
await expectRevert("already registered", "AlreadyRegistered", () => registry.getFunction("register").staticCall(deployed["poll"], 2, "x"));
await expectRevert("EOA", "NotAContract", () => registry.getFunction("register").staticCall(second.address, 1, "x"));

const extra = await new ethers.ContractFactory(artifactOf(1).abi, artifactOf(1).bytecode, owner).deploy("Not yours");
await extra.waitForDeployment();
await expectRevert("non-owner lists it", "NotOwner", () =>
  (registry.connect(second) as typeof registry).getFunction("register").staticCall(extra.target, 1, "mine?"),
);

console.log("\nWallet #2 interacts");
const poll = new ethers.Contract(deployed["poll"]!, artifactOf(2).abi, second);
await (await poll.getFunction("vote")(1)).wait();
console.log(`  ✓ voted, results = ${(await poll.getFunction("results")()).join(",")}`);
const book = new ethers.Contract(deployed["guestbook"]!, artifactOf(1).abi, second);
await (await book.getFunction("sign")("gm from wallet #2")).wait();
console.log(`  ✓ signed guestbook, entries = ${await book.getFunction("entryCount")()}`);

const [total, per] = await registry.getFunction("stats")();
console.log(`\nstats(): total ${total}, per template [${per.join(", ")}]`);
console.log(`isLaunchpad(poll) = ${await registry.getFunction("isLaunchpad")(deployed["poll"])}`);
console.log(`isLaunchpad(unlisted guestbook) = ${await registry.getFunction("isLaunchpad")(extra.target)}`);
console.log(`\nwallet #1 balance left: ${ethers.formatEther(await ethers.provider.getBalance(owner.address))} BOT`);
