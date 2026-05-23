"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildMonthlyPnl } from "@/lib/analytics";
import { formatSignedCurrency, type Trade } from "@/lib/trades";

type Props = { trades: Trade[] };

function formatAxisMonth(iso: string): string {
  return iso.slice(2);
}

function formatTooltipMonth(iso: string): string {
  const [y, m] = iso.split("-");
  return `${y}년 ${m}월`;
}

function formatAxisCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

export function MonthlyPnlChart({ trades }: Props) {
  const data = useMemo(() => buildMonthlyPnl(trades), [trades]);

  return (
    <div className="rounded-lg border border-border/40 bg-card/40 p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        월별 실현 손익
      </h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={formatAxisMonth}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              stroke="var(--border)"
              interval={0}
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
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(value) => [
                `${formatSignedCurrency(Number(value))}원`,
                "실현 손익",
              ]}
              labelFormatter={(label) => formatTooltipMonth(String(label))}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={
                    entry.pnl > 0
                      ? "var(--up)"
                      : entry.pnl < 0
                        ? "var(--down)"
                        : "var(--muted-foreground)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
