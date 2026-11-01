"use client";

import { useCallback, useEffect, useState } from "react";
import type { Template } from "@/templates";

export type WizardStep = "form" | "review" | "launch";

export interface WizardData {
  step: WizardStep;
  /** Parsed form values (zod output). */
  values: Record<string, unknown> | null;
  feedName: string;
  /** Set once the deploy tx confirms, so a refresh lands on the "list it" step. */
  deployed: { address: `0x${string}`; chainId: number; txHash: `0x${string}` } | null;
}

const empty: WizardData = { step: "form", values: null, feedName: "", deployed: null };
const key = (slug: string) => `botlaunchpad:v1:wizard:${slug}`;

/** Wizard state persisted in sessionStorage so a refresh mid-launch keeps the values. */
export function useWizard(template: Template) {
  const [data, setData] = useState<WizardData>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key(template.slug));
      // Restoring client-only storage after mount is the intended pattern here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setData({ ...empty, ...(JSON.parse(raw) as WizardData) });
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, [template.slug]);

  useEffect(() => {
    if (hydrated) sessionStorage.setItem(key(template.slug), JSON.stringify(data));
  }, [data, hydrated, template.slug]);

  const update = useCallback((patch: Partial<WizardData>) => setData((d) => ({ ...d, ...patch })), []);
  const reset = useCallback(() => {
    sessionStorage.removeItem(key(template.slug));
    setData(empty);
  }, [template.slug]);

  return { ...data, hydrated, update, reset };
}
