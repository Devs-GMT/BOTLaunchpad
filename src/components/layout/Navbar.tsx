"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/graphics";
import { CloseIcon, LinkButton, MenuIcon } from "@/components/ui";
import { ConnectButton } from "@/components/web3";
import { navLinks } from "@/config/site";
import { cn } from "@/lib/cn";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-2 pt-3 md:px-4 md:pt-5 lg:px-12">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-rail-wide items-center gap-6 border px-4 transition-colors duration-150",
          scrolled || open ? "border-ink-900/12 bg-paper-50" : "border-transparent bg-transparent",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 text-ink-900" onClick={() => setOpen(false)}>
          <LogoMark size={20} />
          <span className="text-body font-medium">Launchpad</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-2 text-small text-ink-700 transition-colors hover:text-ink-900">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ConnectButton />
          <LinkButton href="/launch" size="sm" trailingArrow>
            Launch a contract
          </LinkButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto flex size-10 cursor-pointer items-center justify-center text-ink-900 hover:bg-ink-900/5 md:ml-0 lg:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="mx-auto mt-2 flex max-w-rail-wide flex-col border border-ink-900/12 bg-paper-50 p-4 lg:hidden">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-ink-900/10 py-3 text-body text-ink-900">
              {l.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-wrap items-center gap-3 md:hidden">
            <ConnectButton />
            <LinkButton href="/launch" size="md" trailingArrow onClick={() => setOpen(false)}>
              Launch a contract
            </LinkButton>
          </div>
        </div>
      )}
    </header>
  );
}
