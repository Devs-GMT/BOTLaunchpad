import { Kicker } from "@/components/ui";
import type { Template } from "@/templates";

function literal(value: unknown, type: string): string {
  if (Array.isArray(value)) return `[${value.map((v) => literal(v, type.replace("[]", ""))).join(", ")}]`;
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "bigint") return value.toString();
  return String(value);
}

function timestampNote(value: unknown, type: string): string | null {
  if (type !== "uint64" || typeof value !== "bigint") return null;
  return new Date(Number(value) * 1000).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

/** The exact constructor call that will be sent, with the user's values in lilac. */
export function ConstructorCall({ template, args }: { template: Template; args: unknown[] }) {
  const types = template.artifact.constructorTypes;
  return (
    <div className="flex flex-col gap-3">
      <Kicker>Your values → constructor</Kicker>
      <pre className="overflow-x-auto border border-ink-900/12 bg-paper-0 p-4 font-mono text-mono leading-relaxed text-ink-700">
        <span className="text-ink-900">new {template.artifact.contractName}(</span>
        {"\n"}
        {args.map((arg, i) => {
          const type = types[i] ?? "";
          const note = timestampNote(arg, type);
          return (
            <span key={i}>
              {"  "}
              <span className="text-ink-500">
                {type} {template.argNames[i]} ={" "}
              </span>
              <mark className="bg-lilac-200 px-0.5 text-ink-900">{literal(arg, type)}</mark>
              {i < args.length - 1 ? "," : ""}
              {note && <span className="text-ink-500">{`  // ${note}`}</span>}
              {"\n"}
            </span>
          );
        })}
        <span className="text-ink-900">)</span>
      </pre>
    </div>
  );
}
