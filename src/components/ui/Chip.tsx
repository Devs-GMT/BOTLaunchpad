import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ChipProps {
  icon?: ReactNode;
  label: ReactNode;
  /** Mono value on the right (date, size, status). */
  meta?: ReactNode;
  tone?: "paper" | "lilac" | "coal";
  className?: string;
}

/** Filename-style chip: icon + label + optional mono meta. */
export function Chip({ icon, label, meta, tone = "paper", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-8 max-w-full items-center gap-2 border px-2.5 text-small",
        tone === "paper" && "border-ink-900/12 bg-paper-0 text-ink-900",
        tone === "lilac" && "border-lilac-400 bg-lilac-100 text-ink-900",
        tone === "coal" && "border-paper-0/12 bg-coal-800 text-paper-50",
        className,
      )}
    >
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      <span className="truncate">{label}</span>
      {meta && (
        <span className={cn("ml-1 font-mono text-micro uppercase", tone === "coal" ? "text-paper-500" : "text-ink-500")}>
          {meta}
        </span>
      )}
    </span>
  );
}
