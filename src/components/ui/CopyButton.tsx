"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { CheckIcon, CopyIcon } from "./icons";

export interface CopyButtonProps {
  value: string;
  label?: string;
  tone?: "light" | "dark";
  className?: string;
}

export function CopyButton({ value, label = "Copy", tone = "light", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
      className={cn(
        "inline-flex h-7 cursor-pointer items-center gap-1.5 px-2 font-mono text-micro uppercase transition-colors",
        tone === "light"
          ? "text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
          : "text-paper-500 hover:bg-paper-0/5 hover:text-paper-50",
        className,
      )}
    >
      {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
