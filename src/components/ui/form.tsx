"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CloseIcon, PlusIcon } from "./icons";

const control =
  "w-full border border-paper-400 bg-paper-0 px-3 text-body text-ink-900 transition-colors duration-150 placeholder:text-paper-600 hover:border-ink-500/50 focus:border-ink-900 focus-visible:outline-offset-0 aria-invalid:border-danger-600 disabled:cursor-not-allowed disabled:bg-paper-200 disabled:text-ink-500";

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Live counter, e.g. bytes used vs. the on-chain cap. */
  counter?: { value: number; max: number };
  /** Render-prop receives the ids to wire label/hint/error to the control. */
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}

export function Field({ label, hint, error, counter, children, className }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;
  const over = counter && counter.value > counter.max;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-small font-medium text-ink-900">
          {label}
        </label>
        {counter && (
          <span className={cn("font-mono text-micro tabular-nums", over ? "text-danger-600" : "text-ink-500")}>
            {counter.value}/{counter.max}
          </span>
        )}
      </div>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-small text-ink-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-small text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input type="text" className={cn(control, "h-11", className)} {...props} />;
}

export function NumberInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return <input type="number" inputMode="decimal" className={cn(control, "h-11 font-mono tabular-nums", className)} {...props} />;
}

export function DateTimeInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return <input type="datetime-local" className={cn(control, "h-11 font-mono", className)} {...props} />;
}

export function TextArea({ className, rows = 3, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(control, "resize-y py-2.5", className)} {...props} />;
}

export interface ListInputProps {
  id?: string;
  values: string[];
  onChange: (values: string[]) => void;
  min: number;
  max: number;
  addLabel?: string;
  placeholder?: (index: number) => string;
  /** Per-item error messages, by index. */
  errors?: (string | undefined)[];
  describedBy?: string;
}

/** Growable list of short text inputs (Poll options). */
export function ListInput({ id, values, onChange, min, max, addLabel = "Add option", placeholder, errors, describedBy }: ListInputProps) {
  const update = (i: number, v: string) => onChange(values.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));
  return (
    <div className="flex flex-col gap-2">
      {values.map((value, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-6 shrink-0 font-mono text-mono text-ink-500 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <TextInput
              id={i === 0 ? id : undefined}
              value={value}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder?.(i)}
              aria-invalid={Boolean(errors?.[i]) || undefined}
              aria-describedby={describedBy}
              aria-label={`Option ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={values.length <= min}
              aria-label={`Remove option ${i + 1}`}
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <CloseIcon />
            </button>
          </div>
          {errors?.[i] && <p className="pl-8 text-small text-danger-600">{errors[i]}</p>}
        </div>
      ))}
      {values.length < max && (
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="dashed-slot ml-8 flex h-11 cursor-pointer items-center justify-center gap-2 text-small text-ink-700 transition-colors hover:border-ink-500/50 hover:text-ink-900"
        >
          <PlusIcon /> {addLabel}
          <span className="font-mono text-micro text-ink-500">
            {values.length}/{max}
          </span>
        </button>
      )}
    </div>
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  hint?: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  id?: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label"?: string;
  tone?: "light" | "dark";
}

export function SegmentedControl<T extends string>({ id, options, value, onChange, tone = "light", ...aria }: SegmentedControlProps<T>) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={aria["aria-label"]}
      className={cn("inline-flex w-full border p-0.5", tone === "light" ? "border-paper-400 bg-paper-0" : "border-paper-0/15 bg-coal-800")}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex min-h-10 flex-1 cursor-pointer flex-col items-center justify-center px-3 py-1.5 text-small transition-colors",
              selected
                ? tone === "light"
                  ? "bg-ink-900 text-paper-50"
                  : "bg-paper-50 text-ink-900"
                : tone === "light"
                  ? "text-ink-700 hover:bg-ink-900/5"
                  : "text-paper-500 hover:bg-paper-0/5",
            )}
          >
            <span>{o.label}</span>
            {o.hint && <span className={cn("font-mono text-micro uppercase", selected ? "opacity-70" : "text-ink-500")}>{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

export interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
}

export function Toggle({ id, checked, onChange, label }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex cursor-pointer items-center gap-3 text-small text-ink-900"
    >
      <span className={cn("relative block h-5 w-9 shrink-0 border transition-colors", checked ? "border-ink-900 bg-ink-900" : "border-paper-500 bg-paper-0")}>
        <span
          className={cn(
            "absolute top-0.5 left-0 size-3.5 transition-transform duration-150 ease-std",
            checked ? "translate-x-4.5 bg-lilac-200" : "translate-x-0.5 bg-paper-500",
          )}
        />
      </span>
      {label}
    </button>
  );
}
