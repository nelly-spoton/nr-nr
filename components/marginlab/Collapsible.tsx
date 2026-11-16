"use client";
import { ChevronDown } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Controlled section that is closed by default. Children stay in the DOM (so links and search work). */
export function Collapsible({
  title,
  tag,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  tag: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section className="rounded-card border border-rule bg-surface shadow-card">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-3 text-left"
        >
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold">{title}</span>
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">{tag}</span>
            {count !== undefined && <span className="text-xs text-muted">{count}</span>}
          </span>
          <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </h2>
      <div id={id} hidden={!open} className="border-t border-rule p-5">
        {children}
      </div>
    </section>
  );
}
