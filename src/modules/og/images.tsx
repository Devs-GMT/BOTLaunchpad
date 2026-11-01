import { site } from "@/config/site";
import { allTemplates, templateBySlug } from "@/templates";
import { ogCard } from "./OgCard";

export { ogContentType, ogSize } from "./OgCard";
export const ogAlt = `${site.name}: launch a smart contract on BOT Chain without writing code`;

export function SiteOgImage() {
  return ogCard({
    kicker: "No-code contracts on BOT Chain",
    lines: ["Your first contract", "is one click away."],
    footer: "Guestbook · Poll · To-do Board · Tip Jar · Event Check-in",
  });
}

export async function TemplateOgImage({ params }: { params: Promise<{ template: string }> }) {
  const { template: slug } = await params;
  const t = templateBySlug(slug);
  if (!t) return SiteOgImage();
  return ogCard({
    kicker: `Template · ${t.artifact.fileName}`,
    lines: [`Launch a ${t.title}.`, "Owned by your wallet."],
    footer: t.useCase,
  });
}

export function templateOgParams() {
  return allTemplates.map((t) => ({ template: t.slug }));
}
