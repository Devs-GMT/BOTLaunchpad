import { ArrowUpRight } from "@/components/ui";
import type { NetworkConfig } from "@/config/networks";
import { txUrl } from "@/lib/explorer";
import { shortAddress } from "@/lib/format";

/** Mono "tx 0x9a3f…11be ↗" link to the explorer. */
export function TxLink({ hash, network }: { hash: string; network: NetworkConfig }) {
  return (
    <a
      href={txUrl(network, hash)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-micro uppercase text-ink-500 underline decoration-ink-900/20 underline-offset-4 hover:text-ink-900"
    >
      tx {shortAddress(hash, 4, 4)} <ArrowUpRight size={10} />
    </a>
  );
}
