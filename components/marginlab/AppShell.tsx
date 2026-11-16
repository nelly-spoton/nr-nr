"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { useScenario } from "./ScenarioProvider";
import { usd } from "@/lib/format";

function Header() {
  const { scenario, result } = useScenario();
  return (
    <header className="no-print sticky top-0 z-40 bg-nav text-white">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
            >
              M
            </span>
            <span className="text-lg font-semibold tracking-tight">MarginLab</span>
          </Link>
          <Navigation variant="top" />
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden max-w-[14rem] truncate text-sm text-nav-fg xl:inline">
            {scenario.restaurantName || "Unnamed restaurant"}
          </span>
          <span
            className={
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold " +
              (result.sales.preliminary ? "bg-lime text-ink" : "bg-white/10 text-white")
            }
          >
            {result.sales.preliminary ? "Preliminary estimate" : "Estimate"}
          </span>
        </div>
      </div>
    </header>
  );
}

/** Compact always-visible result for phones, so the number stays on screen while inputs change. */
function MobileResultBar() {
  const { result } = useScenario();
  const path = usePathname();
  if (path.startsWith("/summary") || path.startsWith("/stats")) return null;
  return (
    <div
      aria-live="polite"
      className="no-print fixed inset-x-0 bottom-14 z-30 flex items-center justify-between border-t border-white/10 bg-nav px-4 py-2 text-white lg:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-nav-fg">Est. annual opportunity</span>
      <span className="tabular text-lg font-bold text-lime">
        {result.sales.resolved ? usd(result.savings.annualTotal) : "—"}
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-page px-4 py-6 pb-32 sm:px-6 sm:py-8 lg:pb-12">{children}</main>
      <p className="no-print mx-auto max-w-page px-4 pb-24 text-xs text-muted sm:px-6 lg:pb-10">
        Illustrative estimates for discovery conversations. Not a quote, proposal or guarantee. Inputs stay in this browser.
      </p>
      <MobileResultBar />
      <Navigation variant="bottom" />
    </>
  );
}
