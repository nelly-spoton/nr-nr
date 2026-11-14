"use client";
import { useState } from "react";
import { dollarsToPct, pctToDollars } from "@/lib/calc";
import type { NumField } from "@/lib/types";
import { FormField, NumberField, SegmentedControl } from "./Fields";

/**
 * Cost input in % of net sales (canonical) with optional monthly-dollar entry.
 * Dollar entry is monthly, entire group, converted against the same net-sales denominator.
 */
export function CostField({
  id,
  label,
  tooltip,
  pct,
  onPct,
  monthlyGroupSales,
  error,
  warning,
}: {
  id: string;
  label: string;
  tooltip: string;
  pct: NumField;
  onPct: (v: NumField) => void;
  monthlyGroupSales: number;
  error?: string;
  warning?: string;
}) {
  const [unit, setUnit] = useState<"pct" | "usd">("pct");
  const [usdTyped, setUsdTyped] = useState<NumField>(null);
  const canUsd = monthlyGroupSales > 0;
  const derived = pctToDollars(typeof pct === "number" ? pct : 0, monthlyGroupSales);
  const tol = Math.max(1, monthlyGroupSales * 1e-6);
  const usdShown = usdTyped !== null && Math.abs(derived - usdTyped) <= tol ? usdTyped : typeof pct === "number" ? derived : null;

  return (
    <FormField
      label={label}
      htmlFor={id}
      tooltip={tooltip}
      error={error}
      warning={warning}
      hint={
        unit === "usd"
          ? "Monthly dollars, entire group. Converted to % of the same net sales."
          : canUsd
            ? `≈ ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(derived)} per month (group)`
            : undefined
      }
    >
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          {unit === "pct" || !canUsd ? (
            <NumberField id={id} value={pct} onChange={onPct} suffix="%" invalid={!!error} />
          ) : (
            <NumberField
              id={id}
              value={usdShown}
              prefix="$"
              invalid={!!error}
              onChange={(d) => {
                setUsdTyped(d);
                onPct(d === null ? null : dollarsToPct(d, monthlyGroupSales));
              }}
            />
          )}
        </div>
        <SegmentedControl
          label={`${label} unit`}
          className="w-28 shrink-0"
          value={unit === "usd" && !canUsd ? "pct" : unit}
          options={[
            { value: "pct", label: "%" },
            { value: "usd", label: "$/mo" },
          ]}
          onChange={(u) => canUsd || u === "pct" ? setUnit(u) : undefined}
        />
      </div>
    </FormField>
  );
}
