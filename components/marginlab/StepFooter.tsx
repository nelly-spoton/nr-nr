import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PrimaryButton, buttonStyles } from "./Buttons";

/** Back / Next at the bottom of each step. Next is disabled (with a reason) until the step is ready. */
export function StepFooter({
  backHref,
  backLabel = "Back",
  nextHref,
  nextLabel,
  disabled,
  hint,
}: {
  backHref?: string;
  backLabel?: string;
  nextHref?: string;
  nextLabel?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="no-print mt-6 flex flex-wrap items-center justify-between gap-3">
      {backHref ? (
        <Link href={backHref} className={buttonStyles({ variant: "secondary" })}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> {backLabel}
        </Link>
      ) : (
        <span />
      )}
      {nextHref && nextLabel && (
        <div className="flex flex-col items-end gap-1">
          {disabled ? (
            <PrimaryButton disabled aria-disabled>
              {nextLabel} <ArrowRight className="h-4 w-4" aria-hidden />
            </PrimaryButton>
          ) : (
            <Link href={nextHref} className={buttonStyles({ variant: "primary" })}>
              {nextLabel} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
          {disabled && hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      )}
    </div>
  );
}
