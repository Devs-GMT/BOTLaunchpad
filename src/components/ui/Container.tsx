import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ContainerProps = ComponentProps<"div"> & { rail?: "default" | "wide" };

export function Container({ rail = "default", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 md:px-8 lg:px-16", rail === "wide" ? "max-w-rail-wide" : "max-w-rail", className)}
      {...props}
    />
  );
}
