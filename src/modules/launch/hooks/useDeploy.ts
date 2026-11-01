"use client";

import { ContractFactory, Interface } from "ethers";
import { useCallback, useMemo } from "react";
import type { NetworkConfig } from "@/config/networks";
import { savePending } from "@/lib/storage";
import type { Template } from "@/templates";
import { useTxFlow, useWallet } from "@/web3";

/** Deploys a template from the connected wallet and remembers it locally until it's listed. */
export function useDeploy(template: Template, network: NetworkConfig) {
  const { getSigner, address } = useWallet();
  const abi = useMemo(() => [new Interface(template.artifact.abi)], [template]);
  const flow = useTxFlow({ abi, errors: template.errors });
  const { send } = flow;

  const deploy = useCallback(
    async (args: unknown[], feedName: string) => {
      const receipt = await send(async () => {
        const signer = await getSigner();
        const factory = new ContractFactory(template.artifact.abi, template.artifact.bytecode, signer);
        const contract = await factory.deploy(...args);
        return contract.deploymentTransaction();
      });
      const contractAddress = receipt?.contractAddress as `0x${string}` | undefined;
      if (!receipt || !contractAddress) return null;
      savePending(network.chainId, {
        address: contractAddress,
        templateId: template.id,
        name: feedName,
        txHash: receipt.hash as `0x${string}`,
        owner: (address ?? receipt.from) as `0x${string}`,
        at: Date.now(),
      });
      return { address: contractAddress, txHash: receipt.hash as `0x${string}` };
    },
    [send, getSigner, template, network.chainId, address],
  );

  return { ...flow, deploy };
}
