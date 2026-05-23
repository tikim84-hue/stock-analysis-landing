"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildEquityCurve, type EquityPoint } from "@/lib/analytics";
import { formatSignedCurrency, type Trade } from "@/lib/trades";

type Props = { trades: Trade[] };

function formatAxisDate(iso: string): string {
  return iso.slice(2);
}

function formatAxisCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

export function EquityCurveChart({ trades }: Props) {
  const data = useMemo(() => buildEquityCurve(trades), [trades]);

  const terminal = data.length > 0 ? data[data.length - 1].cumulativePnl : 0;
  const stroke =
    terminal > 0
      ? "var(--up)"
      : terminal < 0
        ? "var(--down)"
        : "var(--muted-foreground)";

  return (
    <div className="rounded-lg border border-border/40 bg-card/40 p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        누적 손익 곡선
      </h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatAxisDate}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              stroke="var(--border)"
            />
            <YAxis
              tickFormatter={formatAxisCurrency}
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
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(value) => [
                `${formatSignedCurrency(Number(value))}원`,
                "누적 손익",
              ]}
              labelFormatter={(label) => `처분일 ${label}`}
            />
            <Line
              type="monotone"
              dataKey="cumulativePnl"
              stroke={stroke}
              strokeWidth={2}
              dot={{ r: 3, fill: stroke }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export type { EquityPoint };
