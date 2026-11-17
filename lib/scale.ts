/**
 * Geometry for the benchmark scale: where the restaurant's value, the published median and the
 * "typical" (near) band sit on a horizontal track. Pure, so positions can be tested.
 */
export interface ScaleGeometry {
  lo: number;
  hi: number;
  /** Positions in percent of the track width (0–100). */
  pos: number;
  medianPos: number;
  nearFrom: number;
  nearTo: number;
  /** Set when the value is off the visible track; the marker is pinned to that edge. */
  clamped: "low" | "high" | null;
}

const pctOf = (x: number, lo: number, hi: number) => ((x - lo) / (hi - lo)) * 100;
const clamp = (x: number, a: number, b: number) => Math.min(Math.max(x, a), b);

/** Track spans ±halfRange points around the median (never below 0). */
export function scaleGeometry(value: number, median: number, windowPts: number, halfRange = 10): ScaleGeometry {
  const lo = Math.max(0, median - halfRange);
  const hi = Math.max(median + halfRange, lo + halfRange * 2);
  const raw = pctOf(value, lo, hi);
  return {
    lo,
    hi,
    pos: clamp(raw, 0, 100),
    medianPos: pctOf(median, lo, hi),
    nearFrom: clamp(pctOf(median - windowPts, lo, hi), 0, 100),
    nearTo: clamp(pctOf(median + windowPts, lo, hi), 0, 100),
    clamped: raw < 0 ? "low" : raw > 100 ? "high" : null,
  };
}
