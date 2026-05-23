"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildHoldingScatter } from "@/lib/analytics";
import { formatPercent, type Trade } from "@/lib/trades";

type Props = { trades: Trade[] };

function formatDays(value: number): string {
  return `${value}d`;
}

function formatReturn(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function HoldingReturnScatter({ trades }: Props) {
  const data = useMemo(() => buildHoldingScatter(trades), [trades]);

  const positives = data.filter((p) => p.returnRate >= 0);
  const negatives = data.filter((p) => p.returnRate < 0);

  return (
    <div className="rounded-lg border border-border/40 bg-card/40 p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        보유기간 vs 수익률
      </h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="holdingDays"
              name="보유일수"
              tickFormatter={formatDays}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              stroke="var(--border)"
              domain={[0, "dataMax"]}
            />
            <YAxis
              type="number"
              dataKey="returnRate"
              name="수익률"
              tickFormatter={formatReturn}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              stroke="var(--border)"
              width={56}
            />
            <ReferenceLine
              y={0}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
            />
            <Tooltip
              cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(value, name) => {
                if (name === "수익률") {
                  return [formatPercent(Number(value)), name];
                }
                return [`${value}일`, name];
              }}
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload as
                  | { name?: string; ticker?: string }
                  | undefined;
                if (!p) return "";
                return `${p.name ?? ""} (${p.ticker ?? ""})`;
              }}
            />
            <Scatter
              name="수익"
              data={positives}
              fill="var(--up)"
              fillOpacity={0.85}
            />
            <Scatter
              name="손실"
              data={negatives}
              fill="var(--down)"
              fillOpacity={0.85}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
