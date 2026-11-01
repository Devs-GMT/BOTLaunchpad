import { checkIn } from "./check-in/definition";
import { guestbook } from "./guestbook/definition";
import { poll } from "./poll/definition";
import { tipJar } from "./tip-jar/definition";
import { todo } from "./todo/definition";
import type { Template, TemplateSlug } from "./types";

/** Display order everywhere (picker, showcase, stats). */
export const allTemplates: readonly Template[] = [guestbook, poll, todo, tipJar, checkIn] as unknown as Template[];

export function templateBySlug(slug: string): Template | undefined {
  return allTemplates.find((t) => t.slug === slug);
}

export function templateById(id: number): Template | undefined {
  return allTemplates.find((t) => t.id === id);
}

export const templateSlugs: readonly TemplateSlug[] = allTemplates.map((t) => t.slug);

/** templateId → runtime code hash, for identifying deployed contracts. */
export const codeHashes: ReadonlyMap<number, string> = new Map(allTemplates.map((t) => [t.id, t.artifact.runtimeCodeHash]));

export { compilerSettings } from "./defineTemplate";
export { clampBytes, formatLocal, toUnix } from "./fields";
export type * from "./types";
