"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type RevealProps = ComponentProps<"div"> & {
  /** Stagger index: each step adds 60ms. */
  index?: number;
};

/**
 * Fades + lifts its content in once, when it scrolls into view.
 * Content already on screen at mount, no-JS and reduced-motion visitors see it immediately (no flash).
 * Classes are toggled on the node directly so the effect never re-renders the tree.
 */
export function Reveal({ index = 0, className, style, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("opacity-0");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.classList.remove("opacity-0");
        el.classList.add("animate-enter");
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={index ? { animationDelay: `${index * 60}ms`, ...style } : style}
      {...props}
    />
  );
}
