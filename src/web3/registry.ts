import { Contract, Interface, type ContractRunner } from "ethers";
import { registryAddress } from "@/config/addresses";
import type { NetworkConfig } from "@/config/networks";
import registryJson from "@/generated/registry.json";
import { readProvider } from "./providers";

export const registryInterface = new Interface(registryJson.abi);

/** Friendly copy for LaunchpadRegistry custom errors. */
export const registryErrors: Record<string, string> = {
  UnknownTemplate: "That template isn't part of this Launchpad.",
  NotAContract: "There's no contract at that address on this network.",
  CodeMismatch: "This contract wasn't created from a Launchpad template, so it can't be listed.",
  NotOwner: "Only the contract's owner can list it. Switch to the wallet that launched it.",
  AlreadyRegistered: "This contract is already listed.",
  EmptyName: "Give it a name for the feed.",
  NameTooLong: "The feed name is too long (64 bytes max).",
};

export interface Launch {
  id: number;
  contractAddr: `0x${string}`;
  owner: `0x${string}`;
  templateId: number;
  name: string;
  /** unix seconds */
  at: number;
}

export interface RegistryStats {
  total: number;
  /** Index 0 = template id 1. */
  perTemplate: [number, number, number, number, number];
}

type RawLaunch = { contractAddr: string; owner: string; templateId: bigint; name: string; at: bigint };

function toLaunch(raw: RawLaunch, id: number): Launch {
  return {
    id,
    contractAddr: raw.contractAddr as `0x${string}`,
    owner: raw.owner as `0x${string}`,
    templateId: Number(raw.templateId),
    name: raw.name,
    at: Number(raw.at),
  };
}

export class RegistryNotDeployedError extends Error {
  constructor(network: Pick<NetworkConfig, "name">) {
    super(`The Launchpad registry isn't deployed on ${network.name} yet.`);
  }
}

/** Registry bound to a signer (writes) or the network's read provider. */
export function registryContract(network: NetworkConfig, runner?: ContractRunner): Contract {
  const address = registryAddress(network);
  if (!address) throw new RegistryNotDeployedError(network);
  return new Contract(address, registryInterface, runner ?? readProvider(network));
}

export function hasRegistry(network: NetworkConfig): boolean {
  return Boolean(registryAddress(network));
}

export async function getStats(network: NetworkConfig): Promise<RegistryStats> {
  const [total, per] = (await registryContract(network).getFunction("stats")()) as [bigint, bigint[]];
  return { total: Number(total), perTemplate: per.map(Number) as RegistryStats["perTemplate"] };
}

/** Newest first. */
export async function getRecentLaunches(network: NetworkConfig, count: number): Promise<Launch[]> {
  const registry = registryContract(network);
  const total = Number(await registry.getFunction("total")());
  const from = Math.max(0, total - count);
  const page = (await registry.getFunction("getLaunches")(from, count)) as RawLaunch[];
  return page.map((raw, i) => toLaunch(raw, from + i + 1)).reverse();
}

export async function getLaunchesOf(network: NetworkConfig, owner: string): Promise<Launch[]> {
  const registry = registryContract(network);
  const list = (await registry.getFunction("launchesOf")(owner)) as RawLaunch[];
  // launchesOf doesn't return ids; resolve them so rows can link and sort.
  const ids = await Promise.all(list.map((l) => registry.getFunction("idOf")(l.contractAddr) as Promise<bigint>));
  return list.map((raw, i) => toLaunch(raw, Number(ids[i]))).reverse();
}

export async function getLaunchByAddress(network: NetworkConfig, address: string): Promise<Launch | null> {
  const registry = registryContract(network);
  const id = Number(await registry.getFunction("idOf")(address));
  if (!id) return null;
  const raw = (await registry.getFunction("launchAt")(id)) as RawLaunch;
  return toLaunch(raw, id);
}
