import Link from "next/link";
import { DotWorldMap, Watermark } from "@/components/graphics";
import { Container } from "@/components/ui";
import { liveNetwork } from "@/config/addresses";
import { external } from "@/config/site";
import { BotChainHex } from "./BotChainHex";
import { FooterStatus } from "./FooterStatus";

type FooterLink = { label: string; href: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Launch", href: "/launch" },
      { label: "Templates", href: "/#templates" },
      { label: "My launches", href: "/my" },
      { label: "How it works", href: "/#how" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "BOT Chain docs", href: external.docs, external: true },
      { label: "Testnet faucet", href: external.faucet, external: true },
      { label: "Explorer", href: liveNetwork.explorerUrl, external: true },
      { label: "Template source", href: external.templateSource, external: true },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Report an issue", href: `${external.github}/issues`, external: true },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "X", href: external.x, external: true },
      { label: "GitHub", href: external.github, external: true },
    ],
  },
];

/** PRD §12: charcoal footer with a live status row, link columns and the cropped watermark. */
export function Footer() {
  return (
    <footer className="pixel-grid-dark relative overflow-hidden bg-coal-900 text-paper-50">
      <DotWorldMap className="pointer-events-none absolute -top-10 -right-1/4 w-3/4 opacity-30 md:w-1/2" />
      <Container rail="wide" className="relative flex flex-col gap-12 pt-16 md:pt-20">
        <FooterStatus />

        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <nav aria-label="Footer" className="grid flex-1 grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:max-w-3xl">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <h2 className="text-small font-medium text-paper-50">{col.title}</h2>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.external ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-small text-paper-500 transition-colors hover:text-paper-50">
                          {l.label} <span aria-hidden>↗</span>
                        </a>
                      ) : (
                        <Link href={l.href} className="text-small text-paper-500 transition-colors hover:text-paper-50">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <a
            href={external.botchain}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 self-start text-paper-500 transition-colors hover:text-teal-300"
          >
            <BotChainHex className="size-14" />
            <span className="flex flex-col font-mono text-micro uppercase">
              <span>Built on</span>
              <span className="text-paper-50 group-hover:text-teal-300">BOT Chain</span>
            </span>
          </a>
        </div>

        <div className="flex flex-col gap-2 font-mono text-micro uppercase text-paper-500 md:flex-row md:justify-between">
          <span>© 2026 BOT Launchpad · Templates provided as-is · Start on Testnet</span>
          <span>No accounts · No fees · No tracking</span>
        </div>
      </Container>
      <Watermark className="mt-10 px-4 md:px-8" />
    </footer>
  );
}
