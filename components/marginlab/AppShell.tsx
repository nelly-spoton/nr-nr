"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "./Cards";
import { Navigation } from "./Navigation";
import { useScenario } from "./ScenarioProvider";
import { usd } from "@/lib/format";

function Header() {
  const { scenario, result } = useScenario();
  return (
    <header className="no-print sticky top-0 z-40 border-b-2 border-ink bg-surface">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
          >
            M
          </span>
          <span className="text-base font-bold tracking-tight">
            Margin<em className="font-bold not-italic text-brand">Lab</em>
          </span>
          <span className="hidden text-xs text-muted md:inline">Restaurant Profit Opportunity Calculator</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden max-w-[16rem] truncate text-sm text-muted sm:inline">
            {scenario.restaurantName || "Unnamed restaurant"}
          </span>
          <Badge tone={result.sales.preliminary ? "warn" : "good"}>
            {result.sales.preliminary ? "Preliminary estimate" : "Estimate"}
          </Badge>
        </div>
      </div>
    </header>
  );
}

/** Compact always-visible result for phones, so the number stays on screen while inputs change. */
function MobileResultBar() {
  const { result } = useScenario();
  const path = usePathname();
  if (path.startsWith("/summary")) return null;
  return (
    <div
      aria-live="polite"
      className="no-print fixed inset-x-0 bottom-14 z-30 flex items-center justify-between border-t border-brand bg-brand px-4 py-2 text-white lg:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Est. annual opportunity</span>
      <span className="tabular text-lg font-extrabold">
        {result.sales.resolved ? usd(result.savings.annualTotal) : "—"}
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="mx-auto flex max-w-page gap-8 px-4 py-6 sm:px-6">
        <aside className="no-print hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20">
            <Navigation variant="sidebar" />
            <p className="mt-6 px-3 text-xs text-muted">
              Illustrative estimates for discovery conversations. Not a quote, proposal or guarantee. Inputs stay in this
              browser.
            </p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-32 lg:pb-8">{children}</main>
      </div>
      <MobileResultBar />
      <Navigation variant="bottom" />
    </>
  );
}
