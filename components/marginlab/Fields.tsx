"use client";
import { useEffect, useId, useState, type ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { NumField } from "@/lib/types";
import { InfoTooltip } from "./InfoTooltip";

export function FormField({
  label,
  htmlFor,
  tooltip,
  hint,
  error,
  warning,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  tooltip?: string;
  hint?: ReactNode;
  error?: string;
  warning?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1">
        {/* Segmented controls are radiogroups (named via aria-label), so they get a span, not a label. */}
        {htmlFor.endsWith("-group") ? (
          <span className="text-sm font-semibold text-ink">{label}</span>
        ) : (
          <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        {tooltip && <InfoTooltip text={tooltip} label={`About ${label}`} />}
      </div>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-err`} role="alert" className="text-xs font-semibold text-bad">
          {error}
        </p>
      )}
      {!error && warning && <p className="text-xs font-semibold text-warn">{warning}</p>}
    </div>
  );
}

const inputBase =
  "min-h-11 w-full rounded-ctl border bg-surface px-3 text-base text-ink placeholder:text-muted/60 focus-visible:outline-2 focus-visible:outline-brand sm:text-sm";

export function TextField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputBase, "border-rule")}
    />
  );
}

const parse = (t: string): NumField => {
  const c = t.replace(/[$,%\s]/g, "");
  if (c === "") return null;
  const n = Number(c);
  return Number.isFinite(n) ? n : Number.NaN;
};
const fmt = (v: NumField) => (typeof v === "number" && Number.isFinite(v) ? String(v) : "");

/** Numeric text field: keeps what the user typed, reports parsed value (null when blank). */
export function NumberField({
  id,
  value,
  onChange,
  prefix,
  suffix,
  invalid,
  disabled,
  ariaLabel,
  className,
}: {
  id: string;
  value: NumField;
  onChange: (v: NumField) => void;
  prefix?: string;
  suffix?: string;
  invalid?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  const [text, setText] = useState(fmt(value));
  useEffect(() => {
    const p = parse(text);
    const same = (Number.isNaN(p) && value === null) || p === value;
    if (!same) setText(fmt(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className={cn("relative", className)}>
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">{prefix}</span>
      )}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-err` : undefined}
        disabled={disabled}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const p = parse(e.target.value);
          onChange(Number.isNaN(p as number) ? null : p);
        }}
        className={cn(
          inputBase,
          "tabular",
          invalid ? "border-bad" : "border-rule",
          prefix && "pl-7",
          suffix && "pr-9",
          disabled && "bg-surface-2 text-muted",
        )}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">{suffix}</span>
      )}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; sub?: string }>;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex w-full rounded-ctl border border-rule bg-surface-2 p-1", className)}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const i = options.findIndex((x) => x.value === value);
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                onChange(options[(i + 1) % options.length]!.value);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                onChange(options[(i - 1 + options.length) % options.length]!.value);
              }
            }}
            tabIndex={on ? 0 : -1}
            className={cn(
              "min-h-9 flex-1 rounded-[6px] px-2 py-1.5 text-center text-sm font-semibold leading-tight transition-colors",
              on ? "bg-surface text-brand shadow-card" : "text-muted hover:text-ink",
            )}
          >
            {o.label}
            {o.sub && <span className="block text-[11px] font-normal">{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Slider + numeric input kept in sync; both edit the same value. */
export function SliderField({
  label,
  tooltip,
  value,
  onChange,
  min = 0,
  max = 5,
  step = 0.05,
  suffix = "pts",
  error,
  warning,
}: {
  label: string;
  tooltip?: string;
  value: NumField;
  onChange: (v: NumField) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  error?: string;
  warning?: string;
}) {
  const id = useId();
  const shown = typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(value, min), max) : 0;
  return (
    <FormField label={label} htmlFor={id} tooltip={tooltip} error={error} warning={warning}>
      <div className="flex items-center gap-4">
        <Slider value={shown} onChange={(v) => onChange(Math.round(v * 100) / 100)} min={min} max={max} step={step} label={label} />
        <NumberField id={id} value={value} onChange={onChange} suffix={suffix} invalid={!!error} className="w-28 shrink-0" />
      </div>
    </FormField>
  );
}

export function SelectField({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputBase, "border-rule")}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
