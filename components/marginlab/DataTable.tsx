import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  caption,
  rowKey,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  caption?: string;
  rowKey: (row: T) => string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-ctl border border-rule", className)}>
      <table className="w-full min-w-[420px] border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn("px-3 py-2 font-semibold", c.align === "right" ? "text-right" : "text-left")}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-t border-rule">
              {columns.map((c) => (
                <td key={c.key} className={cn("tabular px-3 py-2.5", c.align === "right" && "text-right")}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
