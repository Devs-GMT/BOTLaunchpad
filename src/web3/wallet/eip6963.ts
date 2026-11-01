// EIP-6963 wallet discovery, with a window.ethereum fallback for older wallets and in-app browsers.

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, listener: (...args: never[]) => void): void;
  removeListener?(event: string, listener: (...args: never[]) => void): void;
}

export interface WalletInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface DiscoveredWallet {
  info: WalletInfo;
  provider: Eip1193Provider;
}

interface AnnounceEvent extends Event {
  detail: DiscoveredWallet;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & { isMetaMask?: boolean };
  }
}

const METAMASK_RDNS = "io.metamask";

/** Collects announced wallets for `waitMs`, then returns MetaMask if present, else the first, else window.ethereum. */
export function discoverWallet(waitMs = 400): Promise<DiscoveredWallet | null> {
  return new Promise((resolve) => {
    const found: DiscoveredWallet[] = [];
    const onAnnounce = (e: Event) => found.push((e as AnnounceEvent).detail);
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
      const pick = found.find((w) => w.info.rdns === METAMASK_RDNS) ?? found[0];
      if (pick) return resolve(pick);
      if (window.ethereum) {
        return resolve({
          info: { uuid: "injected", name: window.ethereum.isMetaMask ? "MetaMask" : "Browser wallet", icon: "", rdns: "injected" },
          provider: window.ethereum,
        });
      }
      resolve(null);
    }, waitMs);
  });
}
