import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight, ArrowUpRight } from "./icons";

export const buttonVariants = cva(
  "group inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap font-medium tracking-button transition-colors duration-150 ease-std disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-ink-900 text-paper-50 hover:bg-ink-800",
        secondary: "border border-ink-500 text-ink-900 hover:border-ink-900 hover:bg-ink-900/5",
        ghost: "text-ink-900 hover:bg-ink-900/5",
        teal: "bg-teal-500 text-coal-900 hover:bg-teal-300",
        "outline-light": "border border-paper-0/40 text-paper-50 hover:border-paper-0 hover:bg-paper-0/5",
        lilac: "bg-lilac-400 text-ink-900 hover:bg-lilac-200",
      },
      size: {
        sm: "h-9 px-3 text-small",
        md: "h-10 px-4 text-small",
        lg: "h-10 px-4 text-small md:h-12 md:px-6 md:text-body",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

interface ArrowProps {
  /** Trailing → that nudges right on hover. */
  trailingArrow?: boolean;
}

function Content({ children, trailingArrow, external }: { children: ReactNode; trailingArrow?: boolean; external?: boolean }) {
  return (
    <>
      {children}
      {external ? (
        <ArrowUpRight className="transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px" />
      ) : trailingArrow ? (
        <ArrowRight className="transition-transform duration-150 group-hover:translate-x-0.5" />
      ) : null}
    </>
  );
}

export type ButtonProps = ComponentProps<"button"> & Variants & ArrowProps;

export function Button({ variant, size, trailingArrow, className, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      <Content trailingArrow={trailingArrow}>{children}</Content>
    </button>
  );
}

export type LinkButtonProps = Omit<ComponentProps<typeof Link>, "href"> &
  Variants &
  ArrowProps & {
    href: string;
    /** Opens in a new tab with ↗. */
    external?: boolean;
  };

export function LinkButton({ variant, size, trailingArrow, external, className, children, href, ...props }: LinkButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        <Content external>{children}</Content>
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      <Content trailingArrow={trailingArrow}>{children}</Content>
    </Link>
  );
}
