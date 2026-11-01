"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

/** Native share sheet on mobile, copy link elsewhere. */
export function ShareButton({ title, variant = "secondary" }: { title: string; variant?: "secondary" | "ghost" | "primary" }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={async () => {
        const url = window.location.href.replace(/[?&]new=1/, "").replace(/\?$/, "");
        if (navigator.share) {
          await navigator.share({ title, url }).catch(() => {});
          return;
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </Button>
  );
}
