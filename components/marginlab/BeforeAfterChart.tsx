"use client";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useScenario } from "./ScenarioProvider";
import { pct } from "@/lib/format";

/** Current vs improved cost, as % of net sales, stacked food + labor. Colors read from tokens. */
export function BeforeAfterChart() {
  const { result: r } = useScenario();
  const data = [
    { name: "Current", food: r.current.food, labor: r.current.labor },
    { name: "Improved", food: r.improved.food, labor: r.improved.labor },
  ];
  return (
    <div
      role="img"
      aria-label={`Prime cost before ${pct(r.current.prime)} and after ${pct(r.improved.prime)}, as a percent of net sales`}
      className="h-64 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            unit="%"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip formatter={(v: number) => pct(v)} cursor={{ fill: "var(--surface-2)" }} />
          <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="food" name="Food & beverage" stackId="a" fill="var(--brand)" isAnimationActive={false} />
          <Bar dataKey="labor" name="Labor" stackId="a" fill="var(--teal)" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
