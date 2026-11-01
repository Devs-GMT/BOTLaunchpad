export const site = {
  name: "BOT Launchpad",
  tagline: "Launch your first BOT Chain smart contract in two minutes.",
  description:
    "Pick a template, fill a short form, confirm in MetaMask. A real smart contract on BOT Chain, owned by you. No code, no Remix.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const navLinks = [
  { label: "Why Launchpad", href: "/#why" },
  { label: "Templates", href: "/launch" },
  { label: "How it works", href: "/#how" },
  { label: "My launches", href: "/my" },
] as const;

export const external = {
  botchain: "https://botchain.ai",
  docs: "https://dev-docs.botchain.ai/docs/intro/",
  faucet: "https://faucet.botchain.ai",
  metamask: "https://metamask.io/download/",
  remix: "https://remix.ethereum.org",
  github: "https://github.com/",
  x: "https://x.com/BOTChain_ai",
} as const;

export const safetyNote = "Templates are provided as-is. Start on Testnet. Don't use Tip Jar for large amounts.";
