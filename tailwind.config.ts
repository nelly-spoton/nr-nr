import type { Config } from "tailwindcss";

// Colors resolve to CSS variables defined in app/globals.css (the single token layer).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        rule: "var(--rule)",
        brand: "var(--brand)",
        link: "var(--link)",
        nav: "var(--nav)",
        "nav-fg": "var(--nav-fg)",
        lime: "var(--lime)",
        "lime-dot": "var(--lime-dot)",
        accent: "var(--accent-ink)",
        teal: "var(--teal)",
        "hero-sub": "var(--hero-sub)",
        "eyebrow-bg": "var(--eyebrow-bg)",
        "eyebrow-fg": "var(--eyebrow-fg)",
        "brand-soft": "var(--brand-soft)",
        good: "var(--good)",
        "good-soft": "var(--good-soft)",
        warn: "var(--warn)",
        "warn-soft": "var(--warn-soft)",
        bad: "var(--bad)",
        "bad-soft": "var(--bad-soft)",
      },
      fontFamily: { sans: ["var(--font-sans)"] },
      borderRadius: { card: "var(--radius-card)", hero: "var(--radius-hero)", ctl: "var(--radius-ctl)" },
      boxShadow: { card: "var(--shadow-card)" },
      maxWidth: { page: "var(--page-max)" },
    },
  },
  plugins: [],
};
export default config;
