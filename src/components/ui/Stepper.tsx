import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CheckIcon } from "./icons";

export type StepStatus = "done" | "current" | "upcoming" | "error";

export interface StepItem {
  label: ReactNode;
  /** Mono detail under the label: tx link, address, error reason. */
  detail?: ReactNode;
  status: StepStatus;
}

export interface StepperProps {
  steps: readonly StepItem[];
  orientation?: "vertical" | "horizontal";
  className?: string;
}

/** Numbered progress list: wizard steps and transaction progress. */
export function Stepper({ steps, orientation = "vertical", className }: StepperProps) {
  return (
    <ol className={cn("flex", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap gap-x-6 gap-y-3", className)}>
      {steps.map((step, i) => (
        <li
          key={i}
          aria-current={step.status === "current" ? "step" : undefined}
          className={cn("relative flex gap-3", orientation === "vertical" && "pb-6 last:pb-0")}
        >
          {orientation === "vertical" && i < steps.length - 1 && (
            <span aria-hidden className={cn("absolute top-7 bottom-1 left-3 w-px", step.status === "done" ? "bg-ink-900" : "bg-paper-400")} />
          )}
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center font-mono text-micro tabular-nums",
              step.status === "done" && "bg-ink-900 text-paper-50",
              step.status === "current" && "border border-ink-900 bg-lilac-200 text-ink-900",
              step.status === "upcoming" && "dashed-slot text-ink-500",
              step.status === "error" && "border border-danger-600 text-danger-600",
            )}
          >
            {step.status === "done" ? <CheckIcon size={11} /> : String(i + 1).padStart(2, "0")}
          </span>
          <span className="flex min-w-0 flex-col pt-0.5">
            <span className={cn("text-small", step.status === "upcoming" ? "text-ink-500" : "text-ink-900", step.status === "current" && "font-medium")}>
              {step.label}
            </span>
            {step.detail && <span className="mt-1 font-mono text-micro uppercase text-ink-500">{step.detail}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
