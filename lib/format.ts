const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/** Whole dollars unless there are cents worth showing. */
export function usd(x: number, opts: { cents?: boolean } = {}): string {
  if (!Number.isFinite(x)) return "—";
  if (opts.cents || (Math.abs(x) < 1000 && !Number.isInteger(x))) return usd2.format(x);
  return usd0.format(x);
}

export const pct = (x: number): string => (Number.isFinite(x) ? `${x.toFixed(2)}%` : "—");
export const pts = (x: number): string => (Number.isFinite(x) ? `${x.toFixed(2)} pts` : "—");
