import type { InterfaceAbi } from "ethers";
import type { ComponentType } from "react";
import type { z } from "zod";
import type { NetworkConfig } from "@/config/networks";

export type TemplateSlug = "guestbook" | "poll" | "todo" | "tip-jar" | "check-in";
export type TemplateId = 1 | 2 | 3 | 4 | 5;
export type TemplateCategory = "COMMUNITY" | "TEAMS" | "CREATORS" | "EVENTS";

/** Joined from src/generated/templates.json. */
export interface TemplateArtifact {
  contractName: string;
  fileName: string;
  abi: InterfaceAbi;
  bytecode: `0x${string}`;
  runtimeCodeHash: `0x${string}`;
  constructorTypes: string[];
  functionsCount: number;
  deployGas: number;
  source: string;
}

interface BaseField {
  name: string;
  label: string;
  hint?: string;
}

export type FieldConfig =
  | (BaseField & { kind: "text"; placeholder?: string; maxBytes: number })
  | (BaseField & { kind: "textarea"; placeholder?: string; maxBytes: number })
  | (BaseField & { kind: "datetime" })
  | (BaseField & { kind: "number"; min: number; max: number; placeholder?: string })
  | (BaseField & { kind: "list"; min: number; max: number; maxBytes: number; addLabel: string; placeholder?: (i: number) => string })
  | (BaseField & { kind: "segmented"; options: { value: string; label: string; hint?: string }[] });

export interface InteractProps {
  address: `0x${string}`;
  network: NetworkConfig;
  /** Registry name, when listed. */
  feedName?: string;
}

/** A row in the Review summary. */
export interface SummaryRow {
  label: string;
  value: string;
}

export interface TemplateDefinition<S extends z.ZodType = z.ZodType> {
  id: TemplateId;
  slug: TemplateSlug;
  title: string;
  category: TemplateCategory;
  /** PixelIcon name for cards. */
  icon: "book" | "bars" | "list" | "coin" | "pin";
  /** One line for cards. */
  useCase: string;
  /** Short paragraph for the form step. */
  description: string;
  schema: S;
  fields: readonly FieldConfig[];
  defaults: () => z.input<S>;
  /** Form values → constructor args, in order. */
  toArgs: (values: z.output<S>) => unknown[];
  /** Constructor parameter names shown in the "constructor call" preview. */
  argNames: readonly string[];
  /** Human-readable summary for the Review step. */
  summary: (values: z.output<S>) => SummaryRow[];
  /** Default name in the Launchpad feed. */
  feedName: (values: z.output<S>) => string;
  /** Custom error name → friendly copy. */
  errors: Record<string, string>;
}

export type Template<S extends z.ZodType = z.ZodType> = TemplateDefinition<S> & {
  artifact: TemplateArtifact;
};

export type InteractComponent = ComponentType<InteractProps>;
