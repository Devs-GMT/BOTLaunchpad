"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CloseIcon } from "./icons";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Native <dialog>: focus trap, Esc and backdrop come for free. */
export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        "m-auto w-11/12 max-w-lg border border-ink-900/12 bg-paper-50 p-0 text-ink-900 backdrop:bg-ink-900/40",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-3">
        <h2 className="text-body font-medium">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-8 cursor-pointer items-center justify-center text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
