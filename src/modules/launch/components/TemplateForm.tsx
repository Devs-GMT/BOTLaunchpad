"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import type { z } from "zod";
import { Button, DateTimeInput, Field, ListInput, NumberInput, SegmentedControl, TextArea, TextInput } from "@/components/ui";
import { byteLength } from "@/lib/format";
import type { FieldConfig, Template } from "@/templates";

type Values = Record<string, unknown>;

function messageOf(errors: FieldErrors<Values>, name: string): string | undefined {
  const e = errors[name] as { message?: unknown; root?: { message?: unknown } } | undefined;
  const msg = e?.message ?? e?.root?.message;
  return typeof msg === "string" ? msg : undefined;
}

function itemMessages(errors: FieldErrors<Values>, name: string): (string | undefined)[] | undefined {
  const e = errors[name];
  if (!Array.isArray(e)) return undefined;
  return e.map((x) => (typeof x?.message === "string" ? x.message : undefined));
}

export interface TemplateFormProps {
  template: Template;
  initial: Values | null;
  onSubmit: (values: Values) => void;
}

/** Renders any template's form from its `fields` config, validated by its zod schema. */
export function TemplateForm({ template, initial, onSubmit }: TemplateFormProps) {
  const schema = template.schema as unknown as z.ZodType<Values, Values>;
  const { register, control, handleSubmit, formState } = useForm<Values, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: (initial ?? template.defaults()) as Values,
    mode: "onTouched",
  });
  const { errors } = formState;
  const watched = useWatch({ control }) as Values;

  const renderField = (f: FieldConfig) => {
    const error = messageOf(errors, f.name);
    switch (f.kind) {
      case "text":
      case "textarea": {
        const value = String(watched[f.name] ?? "");
        const Control = f.kind === "text" ? TextInput : TextArea;
        return (
          <Field key={f.name} label={f.label} hint={f.hint} error={error} counter={{ value: byteLength(value), max: f.maxBytes }}>
            {({ id, describedBy, invalid }) => (
              <Control id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} placeholder={f.placeholder} {...register(f.name)} />
            )}
          </Field>
        );
      }
      case "datetime":
        return (
          <Field key={f.name} label={f.label} hint={f.hint} error={error}>
            {({ id, describedBy, invalid }) => (
              <DateTimeInput id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} {...register(f.name)} />
            )}
          </Field>
        );
      case "number":
        return (
          <Field key={f.name} label={f.label} hint={f.hint} error={error}>
            {({ id, describedBy, invalid }) => (
              <NumberInput id={id} min={f.min} max={f.max} step={1} placeholder={f.placeholder} aria-describedby={describedBy} aria-invalid={invalid || undefined} {...register(f.name)} />
            )}
          </Field>
        );
      case "list":
        return (
          <Field key={f.name} label={f.label} hint={f.hint ?? `${f.min}–${f.max} options, up to ${f.maxBytes} bytes each.`} error={error}>
            {({ id, describedBy }) => (
              <Controller
                control={control}
                name={f.name}
                render={({ field }) => (
                  <ListInput
                    id={id}
                    describedBy={describedBy}
                    values={(field.value as string[]) ?? []}
                    onChange={field.onChange}
                    min={f.min}
                    max={f.max}
                    addLabel={f.addLabel}
                    placeholder={f.placeholder}
                    errors={itemMessages(errors, f.name)}
                  />
                )}
              />
            )}
          </Field>
        );
      case "segmented":
        return (
          <Field key={f.name} label={f.label} hint={f.hint} error={error}>
            {({ id }) => (
              <Controller
                control={control}
                name={f.name}
                render={({ field }) => (
                  <SegmentedControl id={id} aria-label={f.label} options={f.options} value={String(field.value)} onChange={field.onChange} />
                )}
              />
            )}
          </Field>
        );
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
      {template.fields.map(renderField)}
      <div className="flex items-center justify-between gap-4 border-t border-ink-900/10 pt-6">
        <p className="text-small text-ink-500">Nothing is sent yet. You&apos;ll review everything first.</p>
        <Button type="submit" size="lg" trailingArrow>
          Review
        </Button>
      </div>
    </form>
  );
}
