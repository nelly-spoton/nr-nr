import { describe, expect, it } from "vitest";
import { scaleGeometry } from "@/lib/scale";

describe("benchmark scale geometry", () => {
  it("centers the median and places the value", () => {
    const g = scaleGeometry(38, 36.5, 1);
    expect(g.lo).toBe(26.5);
    expect(g.hi).toBe(46.5);
    expect(g.medianPos).toBe(50);
    expect(g.pos).toBeCloseTo(57.5, 6);
    expect(g.clamped).toBeNull();
  });
  it("draws the typical band as median ± the window", () => {
    const g = scaleGeometry(32, 32, 1);
    expect(g.nearFrom).toBeCloseTo(45, 6);
    expect(g.nearTo).toBeCloseTo(55, 6);
    expect(scaleGeometry(32, 32, 2).nearTo).toBeCloseTo(60, 6);
  });
  it("pins an off-scale value to the edge and says which", () => {
    expect(scaleGeometry(10, 32, 1)).toMatchObject({ pos: 0, clamped: "low" });
    expect(scaleGeometry(80, 32, 1)).toMatchObject({ pos: 100, clamped: "high" });
  });
  it("never goes below zero and keeps a full-width track for small medians", () => {
    const g = scaleGeometry(3, 4, 1);
    expect(g.lo).toBe(0);
    expect(g.hi - g.lo).toBe(20);
  });
  it("a value equal to the median sits on the median tick", () => {
    const g = scaleGeometry(65, 65, 1);
    expect(g.pos).toBe(g.medianPos);
  });
});
