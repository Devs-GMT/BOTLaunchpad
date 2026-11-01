// Template catalogue shared by the export and deploy scripts.
// `sampleArgs` are realistic values used only to measure deploy gas on the in-process network.

const now = () => Math.floor(Date.now() / 1000);

export const TEMPLATES = [
  { id: 1, slug: "guestbook", contractName: "Guestbook", sampleArgs: () => ["Devcon booth guestbook"] },
  {
    id: 2,
    slug: "poll",
    contractName: "Poll",
    sampleArgs: () => ["What should we build next?", ["Wallet", "Explorer", "Game", "DEX"], now() + 7 * 86_400],
  },
  { id: 3, slug: "todo", contractName: "TodoBoard", sampleArgs: () => ["Hackathon team board", true] },
  { id: 4, slug: "tip-jar", contractName: "TipJar", sampleArgs: () => ["Ayu's pixel art", "Thank you for the support!"] },
  {
    id: 5,
    slug: "check-in",
    contractName: "EventCheckIn",
    sampleArgs: () => ["BOT Chain Jakarta Meetup", now() + 3_600, now() + 4 * 3_600, 200],
  },
] as const;

export const GENERATED_DIR = new URL("../../src/generated/", import.meta.url);
