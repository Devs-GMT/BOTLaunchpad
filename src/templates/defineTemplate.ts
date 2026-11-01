import type { z } from "zod";
import generated from "@/generated/templates.json";
import type { Template, TemplateArtifact, TemplateDefinition } from "./types";

/** Joins a definition with its compiled artifact (by id) and keeps the schema's types. */
export function defineTemplate<S extends z.ZodType>(definition: TemplateDefinition<S>): Template<S> {
  const artifact = generated.templates.find((t) => t.id === definition.id);
  if (!artifact) throw new Error(`No compiled artifact for template #${definition.id}. Run \`pnpm -C contracts export\`.`);
  return { ...definition, artifact: artifact as unknown as TemplateArtifact };
}

export const compilerSettings = generated.compiler;
