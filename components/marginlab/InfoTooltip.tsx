"use client";
import { Info } from "lucide-react";
import { useId, useState } from "react";

/** Touch-friendly tooltip: tap/click toggles; also opens on hover and keyboard focus. */
export function InfoTooltip({ text, label = "More information" }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted hover:text-brand"
      >
        <Info className="h-4 w-4" aria-hidden />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-7 z-30 w-64 max-w-[80vw] rounded-ctl border border-rule bg-ink p-3 text-xs font-normal normal-case leading-relaxed text-white shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
