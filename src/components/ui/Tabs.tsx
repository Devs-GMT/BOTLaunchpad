"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  items: readonly TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (id: string) => void;
  className?: string;
  panelClassName?: string;
}

export function Tabs({ items, defaultValue, value, onValueChange, className, panelClassName }: TabsProps) {
  const base = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const active = value ?? internal;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: string) => {
    setInternal(id);
    onValueChange?.(id);
  };

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (index + dir + items.length) % items.length;
    const item = items[next];
    if (!item) return;
    select(item.id);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-6 border-b border-ink-900/10">
        {items.map((item, i) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${base}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "-mb-px cursor-pointer border-b-2 pb-3 font-mono text-mono uppercase transition-colors",
                selected ? "border-ink-900 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-900",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${base}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={item.id !== active}
          className={cn("pt-6", panelClassName)}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
