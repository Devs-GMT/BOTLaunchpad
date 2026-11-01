import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type KickerProps = ComponentProps<"span"> & {
  bullet?: boolean;
  tone?: "light" | "dark";
};

/** Tiny uppercase mono label: section kickers, dates, stats. */
export function Kicker({ bullet, tone = "light", className, children, ...props }: KickerProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-mono uppercase",
        tone === "light" ? "text-ink-500" : "text-paper-500",
        className,
      )}
      {...props}
    >
      {bullet && <span aria-hidden className="size-1.5 bg-current" />}
      {children}
    </span>
  );
}
