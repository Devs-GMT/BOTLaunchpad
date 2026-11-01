import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  coal: { tab: "bg-coal-900 text-paper-500", body: "bg-coal-900 text-paper-50" },
  paper: { tab: "bg-paper-0 text-ink-500", body: "bg-paper-0 text-ink-900 border border-ink-900/12" },
  soft: { tab: "bg-paper-200 text-ink-500", body: "bg-paper-200 text-ink-900" },
} as const;

export interface NotchCardProps {
  label: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** Card with a trapezoid label tab sitting on its top-left edge. */
export function NotchCard({ label, tone = "coal", className, bodyClassName, children }: NotchCardProps) {
  const t = tones[tone];
  return (
    <div className={cn("flex flex-col", className)}>
      <div className={cn("notch-clip inline-flex h-9 items-center self-start pl-4 pr-10 font-mono text-mono uppercase", t.tab)}>
        {label}
      </div>
      <div className={cn("relative min-w-0 flex-1 p-6 md:p-10", t.body, bodyClassName)}>{children}</div>
    </div>
  );
}
