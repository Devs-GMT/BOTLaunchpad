"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Field, Kicker, TextInput } from "@/components/ui";
import { ActionButton } from "@/components/web3";
import type { NetworkConfig } from "@/config/networks";
import { byteLength } from "@/lib/format";
import { getPending } from "@/lib/storage";
import { clampBytes, type Template } from "@/templates";
import { useRegister } from "@/web3";

const MAX = 64;

/** Shown to the owner of an unlisted contract: list it in the feed now. */
export function RegisterNow({ address, network, template, name }: { address: string; network: NetworkConfig; template: Template; name: string }) {
  const pendingName = getPending(network.chainId).find((p) => p.address.toLowerCase() === address.toLowerCase())?.name;
  const [feedName, setFeedName] = useState(clampBytes(pendingName || name, MAX));
  const register = useRegister(network);
  const queryClient = useQueryClient();
  const bytes = byteLength(feedName.trim());

  return (
    <div className="flex flex-col gap-5 border border-dashed border-paper-500 p-6 md:p-8">
      <div className="flex flex-col gap-2">
        <Kicker bullet>Not listed yet</Kicker>
        <p className="text-body text-ink-700">
          You own this contract. List it in the Launchpad feed so others can find it. One small transaction; the registry checks the code and that you&apos;re the owner.
        </p>
      </div>
      <Field label="Name in the feed" counter={{ value: bytes, max: MAX }} error={bytes > MAX ? `Keep it under ${MAX} bytes.` : undefined}>
        {({ id, describedBy, invalid }) => (
          <TextInput id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} value={feedName} onChange={(e) => setFeedName(e.target.value)} />
        )}
      </Field>
      <ActionButton
        network={network}
        state={register.state}
        disabled={bytes === 0 || bytes > MAX}
        doneLabel="Listed"
        trailingArrow
        onAction={async () => {
          if (await register.register(address, template.id, feedName.trim())) {
            queryClient.invalidateQueries({ queryKey: ["resolve", network.chainId, address.toLowerCase()] });
          }
        }}
      >
        List in the Launchpad feed
      </ActionButton>
    </div>
  );
}
