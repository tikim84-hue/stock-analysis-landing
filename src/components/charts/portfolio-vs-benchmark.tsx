"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { portfolioVsBenchmark } from "@/lib/mock-data";

const NAME_MAP: Record<string, string> = {
  portfolio: "내 포트폴리오",
  kospi: "KOSPI",
  sp500: "S&P 500",
};

export function PortfolioVsBenchmark() {
  return (
    <div
      className="h-[360px] w-full"
      aria-label="포트폴리오, KOSPI, S&P500 12개월 누적 수익률 비교"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={portfolioVsBenchmark}
          margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#1f2937" }}
            tickFormatter={(v) => v.slice(2)}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#1f2937" }}
            domain={["dataMin - 2", "dataMax + 2"]}
            tickFormatter={(v) => `${v}`}
            width={36}
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
            formatter={(value, name) => [
              Number(value).toFixed(1),
              NAME_MAP[String(name)] ?? String(name),
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="line"
            wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
            formatter={(name) => NAME_MAP[name] ?? name}
          />
          <Line
            type="monotone"
            dataKey="portfolio"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="kospi"
            stroke="#3b82f6"
            strokeWidth={1.8}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="sp500"
            stroke="#a78bfa"
            strokeWidth={1.8}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
