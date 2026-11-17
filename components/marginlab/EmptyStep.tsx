"use client";
import { buttonStyles } from "./Buttons";
import { ContentCard } from "./Cards";
import { RequiredChecklist } from "./RequiredChecklist";
import Link from "next/link";

/** Shown on Steps 2 and 3 until the required Step 1 answers exist. */
export function EmptyStep({ what }: { what: string }) {
  return (
    <ContentCard className="mx-auto max-w-lg">
      <h2 className="text-lg font-semibold">Finish Step 1 first</h2>
      <p className="mt-1 text-sm text-muted">{what} are built from your answers. A few required questions are still open.</p>
      <RequiredChecklist className="mt-4 !p-0 border-0 shadow-none" />
      <Link href="/" className={buttonStyles({ variant: "primary" }) + " mt-4"}>
        Go to Step 1
      </Link>
    </ContentCard>
  );
}
