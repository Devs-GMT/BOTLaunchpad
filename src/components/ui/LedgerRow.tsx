import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface LedgerRowProps {
  left: ReactNode;
  right?: ReactNode;
  href?: string;
  tone?: "light" | "dark";
  className?: string;
}

/** One line of a ledger: label on the left, mono value on the right, hairline below. */
export function LedgerRow({ left, right, href, tone = "light", className }: LedgerRowProps) {
  const classes = cn(
    "flex min-h-11 items-center justify-between gap-4 border-b py-2.5 text-small",
    tone === "light" ? "border-ink-900/10" : "border-paper-0/10",
    href && "transition-colors",
    href && (tone === "light" ? "hover:bg-ink-900/3" : "hover:bg-paper-0/3"),
    className,
  );
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-2">{left}</span>
      {right != null && (
        <span className={cn("shrink-0 font-mono text-mono tabular-nums", tone === "light" ? "text-ink-500" : "text-paper-500")}>
          {right}
        </span>
      )}
    </>
  );
  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
