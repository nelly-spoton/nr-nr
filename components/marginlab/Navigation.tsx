"use client";
import { BarChart3, Calculator, FileText, LayoutDashboard, Library, Puzzle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/", label: "Overview", short: "Overview", icon: LayoutDashboard },
  { href: "/benchmarks", label: "Benchmarks", short: "Benchmarks", icon: BarChart3 },
  { href: "/calculator", label: "Savings Calculator", short: "Calculator", icon: Calculator },
  { href: "/solutions", label: "SpotOn Solutions", short: "Solutions", icon: Puzzle },
  { href: "/summary", label: "Operator Summary", short: "Summary", icon: FileText },
  { href: "/stats", label: "Industry Stats", short: "Stats", icon: Library },
] as const;

/** Desktop: left sidebar. Mobile: fixed bottom tab bar. Same destinations, same order. */
export function Navigation({ variant }: { variant: "top" | "bottom" }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  if (variant === "top") {
    return (
      <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={cn(
              "flex h-10 items-center rounded-full px-3 text-sm font-medium transition-colors",
              active(href) ? "bg-white/10 text-white" : "text-nav-fg hover:text-white",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav
      aria-label="Primary"
      className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-white/10 bg-nav pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {NAV.map(({ href, short, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? "page" : undefined}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold",
            active(href) ? "text-white" : "text-nav-fg",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
          {short}
        </Link>
      ))}
    </nav>
  );
}
