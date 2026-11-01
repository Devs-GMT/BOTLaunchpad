"use client";

import { BrowserProvider, getAddress, type JsonRpcSigner } from "ethers";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { addChainParams, networkByChainId, type NetworkConfig } from "@/config/networks";
import { discoverWallet, type DiscoveredWallet } from "./eip6963";

export type WalletStatus = "detecting" | "unavailable" | "disconnected" | "connecting" | "connected";

export interface WalletState {
  status: WalletStatus;
  address: `0x${string}` | null;
  chainId: number | null;
  /** The BOT Chain network the wallet is on, if any. */
  network: NetworkConfig | undefined;
  walletName: string | null;
  connect: () => Promise<void>;
  /** Switch (adding the chain if needed). Resolves once the wallet reports the new chain. */
  switchTo: (network: NetworkConfig) => Promise<void>;
  getSigner: () => Promise<JsonRpcSigner>;
  error: string | null;
}

const WalletContext = createContext<WalletState | null>(null);

function errorCode(err: unknown): number | undefined {
  const e = err as { code?: unknown; data?: { originalError?: { code?: unknown } } };
  const code = e?.data?.originalError?.code ?? e?.code;
  return typeof code === "number" ? code : undefined;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<DiscoveredWallet | null>(null);
  const [status, setStatus] = useState<WalletStatus>("detecting");
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const browserProvider = useRef<BrowserProvider | null>(null);

  const applyAccounts = useCallback((accounts: unknown) => {
    const first = Array.isArray(accounts) ? accounts[0] : undefined;
    if (typeof first === "string") {
      setAddress(getAddress(first) as `0x${string}`);
      setStatus("connected");
    } else {
      setAddress(null);
      setStatus("disconnected");
    }
  }, []);

  // Discover the wallet and silently restore an existing connection.
  useEffect(() => {
    let cancelled = false;
    discoverWallet().then(async (found) => {
      if (cancelled) return;
      if (!found) return setStatus("unavailable");
      setWallet(found);
      browserProvider.current = new BrowserProvider(found.provider, "any");
      const [accounts, chain] = await Promise.all([
        found.provider.request({ method: "eth_accounts" }).catch(() => []),
        found.provider.request({ method: "eth_chainId" }).catch(() => null),
      ]);
      if (cancelled) return;
      if (typeof chain === "string") setChainId(Number.parseInt(chain, 16));
      applyAccounts(accounts);
    });
    return () => {
      cancelled = true;
    };
  }, [applyAccounts]);

  useEffect(() => {
    const p = wallet?.provider;
    if (!p?.on) return;
    const onAccounts = (accounts: unknown) => applyAccounts(accounts);
    const onChain = (chain: unknown) => {
      if (typeof chain === "string") setChainId(Number.parseInt(chain, 16));
      // A fresh BrowserProvider avoids ethers' "network changed" errors on the old instance.
      browserProvider.current = new BrowserProvider(p, "any");
    };
    p.on("accountsChanged", onAccounts as never);
    p.on("chainChanged", onChain as never);
    return () => {
      p.removeListener?.("accountsChanged", onAccounts as never);
      p.removeListener?.("chainChanged", onChain as never);
    };
  }, [wallet, applyAccounts]);

  const connect = useCallback(async () => {
    if (!wallet) return;
    setError(null);
    setStatus("connecting");
    try {
      const accounts = await wallet.provider.request({ method: "eth_requestAccounts" });
      applyAccounts(accounts);
    } catch (err) {
      setStatus("disconnected");
      setError(errorCode(err) === 4001 ? "Connection was cancelled in the wallet." : "Couldn't connect to the wallet.");
    }
  }, [wallet, applyAccounts]);

  const switchTo = useCallback(
    async (network: NetworkConfig) => {
      if (!wallet) throw new Error("No wallet");
      const params = addChainParams(network);
      try {
        await wallet.provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: params.chainId }] });
      } catch (err) {
        const code = errorCode(err);
        // 4902 = unknown chain. Some mobile wallets report it as -32603.
        if (code !== 4902 && code !== -32603) throw err;
        await wallet.provider.request({ method: "wallet_addEthereumChain", params: [params] });
      }
      setChainId(network.chainId);
    },
    [wallet],
  );

  const getSigner = useCallback(async () => {
    if (!browserProvider.current) throw new Error("No wallet");
    return browserProvider.current.getSigner();
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      status,
      address,
      chainId,
      network: networkByChainId(chainId),
      walletName: wallet?.info.name ?? null,
      connect,
      switchTo,
      getSigner,
      error,
    }),
    [status, address, chainId, wallet, connect, switchTo, getSigner, error],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
