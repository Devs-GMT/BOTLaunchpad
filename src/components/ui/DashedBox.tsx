import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type DashedBoxProps = ComponentProps<"div"> & { size?: "chip" | "slot" };

/** Dashed "slot": logo cells, empty states, neutral badges. */
export function DashedBox({ size = "slot", className, ...props }: DashedBoxProps) {
  return (
    <div
      className={cn(
        "dashed-slot transition-colors duration-300 hover:border-ink-500/50",
        size === "chip" ? "inline-flex h-15 min-w-0 flex-1 basis-40 items-center justify-center gap-2 px-4" : "p-6",
        className,
      )}
      {...props}
    />
  );
}
