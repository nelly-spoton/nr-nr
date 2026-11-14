"use client";
import { BarChart3, Calculator, FileText, LayoutDashboard, Puzzle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/", label: "Overview", short: "Overview", icon: LayoutDashboard },
  { href: "/benchmarks", label: "Benchmarks", short: "Benchmarks", icon: BarChart3 },
  { href: "/calculator", label: "Savings Calculator", short: "Calculator", icon: Calculator },
  { href: "/solutions", label: "SpotOn Solutions", short: "Solutions", icon: Puzzle },
  { href: "/summary", label: "Operator Summary", short: "Summary", icon: FileText },
] as const;

/** Desktop: left sidebar. Mobile: fixed bottom tab bar. Same destinations, same order. */
export function Navigation({ variant }: { variant: "sidebar" | "bottom" }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  if (variant === "sidebar") {
    return (
      <nav aria-label="Primary" className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-ctl px-3 text-sm font-semibold",
              active(href) ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav
      aria-label="Primary"
      className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-rule bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {NAV.map(({ href, short, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? "page" : undefined}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold",
            active(href) ? "text-brand" : "text-muted",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
          {short}
        </Link>
      ))}
    </nav>
  );
}
