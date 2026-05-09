"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { drawdownCurve } from "@/lib/mock-data";

export function DrawdownCurve() {
  return (
    <div
      className="h-[260px] w-full"
      aria-label="포트폴리오 12개월 드로다운 곡선"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={drawdownCurve}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <defs>
            <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#1f2937" }}
            tickFormatter={(v) => v.slice(2)}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#1f2937" }}
            tickFormatter={(v) => `${v}%`}
            domain={["dataMin - 2", 0]}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1f2937",
              borderRadius: 8,
              fontSize: 12,
              color: "#e2e8f0",
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, "낙폭"]}
          />
          <Area
            type="monotone"
            dataKey="drawdown"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#ddFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
