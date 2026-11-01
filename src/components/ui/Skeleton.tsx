import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("skeleton inline-block h-4 w-24 align-middle", className)} />;
}
