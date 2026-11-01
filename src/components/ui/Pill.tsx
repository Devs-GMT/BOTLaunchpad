import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const tones = {
  lilac: "bg-lilac-400 text-ink-900",
  dashed: "border border-dashed border-paper-500 text-ink-700",
  ink: "bg-ink-900 text-paper-50",
  mint: "bg-mint-500/20 text-ink-900",
  ember: "bg-ember-500/15 text-ink-900",
} as const;

export type PillProps = ComponentProps<"span"> & { tone?: keyof typeof tones };

/** The only rounded-full element besides StatusDot. */
export function Pill({ tone = "dashed", className, ...props }: PillProps) {
  return (
    <span
      className={cn("inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 font-mono text-micro uppercase", tones[tone], className)}
      {...props}
    />
  );
}
