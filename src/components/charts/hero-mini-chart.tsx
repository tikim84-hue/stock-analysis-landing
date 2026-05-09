"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { heroSparkline } from "@/lib/mock-data";

export function HeroMiniChart() {
  return (
    <div
      className="relative h-[260px] w-full"
      aria-label="포트폴리오 대 KOSPI 12개월 비교 차트"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={heroSparkline}
          margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillPortfolio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillKospi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(v) => v.slice(2)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            domain={["dataMin - 2", "dataMax + 2"]}
            tickFormatter={(v) => `${v}`}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1f2937",
              borderRadius: 8,
              fontSize: 12,
              color: "#e2e8f0",
            }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}`,
              name === "portfolio" ? "내 포트폴리오" : "KOSPI",
            ]}
          />
          <Area
            type="monotone"
            dataKey="kospi"
            stroke="#3b82f6"
            strokeWidth={1.5}
            fill="url(#fillKospi)"
          />
          <Area
            type="monotone"
            dataKey="portfolio"
            stroke="#ef4444"
            strokeWidth={2.5}
            fill="url(#fillPortfolio)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
