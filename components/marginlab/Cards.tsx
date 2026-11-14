import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  tooltip,
  action,
}: {
  title: string;
  description?: string;
  tooltip?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted">
          {title}
          {tooltip && <InfoTooltip text={tooltip} label={`About ${title}`} />}
        </h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ContentCard({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "brand";
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-rule p-4 shadow-card sm:p-5",
        tone === "default" && "bg-surface",
        tone === "muted" && "bg-surface-2",
        tone === "brand" && "border-brand/20 bg-brand-soft",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  sub,
  tone = "default",
  size = "md",
  tooltip,
  className,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  tone?: "default" | "brand" | "good";
  size?: "md" | "lg";
  tooltip?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-rule bg-surface p-4 shadow-card",
        tone === "brand" && "border-brand bg-brand text-white",
        tone === "good" && "border-good/20 bg-good-soft",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1 text-xs font-semibold uppercase tracking-wider",
          tone === "brand" ? "text-white/80" : "text-muted",
        )}
      >
        {label}
        {tooltip && <InfoTooltip text={tooltip} label={`About ${label}`} />}
      </div>
      <div
        className={cn(
          "tabular mt-1 font-extrabold tracking-tight",
          size === "lg" ? "text-4xl sm:text-5xl" : "text-2xl",
          tone === "good" && "text-good",
        )}
      >
        {value}
      </div>
      {sub && <div className={cn("mt-1 text-xs", tone === "brand" ? "text-white/80" : "text-muted")}>{sub}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "warn" | "good" | "bad" | "brand";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "neutral" && "bg-surface-2 text-muted",
        tone === "warn" && "bg-warn-soft text-warn",
        tone === "good" && "bg-good-soft text-good",
        tone === "bad" && "bg-bad-soft text-bad",
        tone === "brand" && "bg-brand-soft text-brand",
      )}
    >
      {children}
    </span>
  );
}

export function Callout({ children, tone = "warn" }: { children: ReactNode; tone?: "warn" | "info" }) {
  return (
    <div
      role="note"
      className={cn(
        "rounded-ctl border p-3 text-sm",
        tone === "warn" ? "border-warn/20 bg-warn-soft text-warn" : "border-brand/20 bg-brand-soft text-ink",
      )}
    >
      {children}
    </div>
  );
}
