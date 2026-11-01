import { cn } from "@/lib/cn";

const colors = {
  live: "bg-mint-500",
  old: "bg-ember-500",
  idle: "bg-paper-500",
  error: "bg-danger-600",
  yours: "bg-lilac-600",
} as const;

export interface StatusDotProps {
  status: keyof typeof colors;
  pulse?: boolean;
  className?: string;
  /** Screen-reader label. Omit when adjacent text already says it. */
  label?: string;
}

export function StatusDot({ status, pulse, className, label }: StatusDotProps) {
  return (
    <span
      className={cn("relative inline-flex size-2 shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {pulse && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", colors[status])} />}
      <span className={cn("relative size-2 rounded-full", colors[status])} />
    </span>
  );
}
