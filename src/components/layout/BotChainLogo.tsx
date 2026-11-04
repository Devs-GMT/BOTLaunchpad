import Image from "next/image";
import { cn } from "@/lib/cn";

/** Decorative: every use sits next to the words "BOT Chain". */
export function BotChainLogo({ className }: { className?: string }) {
  return <Image src="/botchain-logo.svg" alt="" width={28} height={32} className={cn("w-auto shrink-0", className)} />;
}
