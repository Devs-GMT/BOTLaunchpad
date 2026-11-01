export const site = {
  name: "BOT Launchpad",
  tagline: "Launch your first BOT Chain smart contract in two minutes.",
  description:
    "Pick a template, fill a short form, confirm in MetaMask. A real smart contract on BOT Chain, owned by you. No code, no Remix.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
