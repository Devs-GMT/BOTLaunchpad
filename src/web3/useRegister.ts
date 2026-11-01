"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ContractTransactionResponse } from "ethers";
import { useCallback } from "react";
import type { NetworkConfig } from "@/config/networks";
import { removePending } from "@/lib/storage";
import { queryKeys } from "./queries";
import { registryContract, registryErrors, registryInterface } from "./registry";
import { useTxFlow } from "./useTxFlow";
import { useWallet } from "./wallet/WalletProvider";

const abi = [registryInterface];

/** Lists a deployed contract in the LaunchpadRegistry (the second, optional transaction). */
export function useRegister(network: NetworkConfig) {
  const { getSigner } = useWallet();
  const queryClient = useQueryClient();
  const flow = useTxFlow({ abi, errors: registryErrors });
  const { send } = flow;

  const register = useCallback(
    async (address: string, templateId: number, name: string) => {
      const receipt = await send(async () => {
        const registry = registryContract(network, await getSigner());
        return (await registry.getFunction("register")(address, templateId, name)) as ContractTransactionResponse;
      });
      if (!receipt) return false;
      removePending(network.chainId, address);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.launchesPrefix(network.chainId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stats(network.chainId) }),
      ]);
      return true;
    },
    [send, getSigner, network, queryClient],
  );

  return { ...flow, register };
}
