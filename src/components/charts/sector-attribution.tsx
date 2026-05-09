"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { sectorAttribution } from "@/lib/mock-data";

export function SectorAttribution() {
  return (
    <div
      className="h-[360px] w-full"
      aria-label="섹터별 포트폴리오 기여도 가로 바 차트"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sectorAttribution}
          margin={{ top: 8, right: 32, left: 8, bottom: 8 }}
        >
          <CartesianGrid horizontal={false} stroke="#1f2937" />
          <XAxis
            type="number"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#1f2937" }}
            tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
          />
          <YAxis
            type="category"
            dataKey="sector"
            tick={{ fill: "#e2e8f0", fontSize: 13 }}
            tickLine={false}
            axisLine={false}
            width={96}
          />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1f2937",
              borderRadius: 8,
              fontSize: 12,
              color: "#e2e8f0",
            }}
            cursor={{ fill: "rgba(148,163,184,0.06)" }}
            formatter={(value: number) => [
              `${value > 0 ? "+" : ""}${value.toFixed(1)}%p`,
              "기여도",
            ]}
          />
          <Bar dataKey="contribution" radius={[4, 4, 4, 4]}>
            {sectorAttribution.map((s) => (
              <Cell
                key={s.sector}
                fill={s.contribution >= 0 ? "#ef4444" : "#3b82f6"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
