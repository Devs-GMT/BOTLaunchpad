import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge our custom type scale so `text-h2` and `text-ink-900` don't collide.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      tracking: [{ tracking: ["button", "kicker"] }],
      "font-size": [{ text: ["hero-sm", "hero", "h1", "h2-sm", "h2", "h3", "body-lg", "body", "small", "mono", "micro"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
