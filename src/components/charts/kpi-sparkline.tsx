"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

type Props = {
  data: number[];
  direction: "up" | "down" | "neutral";
};

const STROKE = {
  up: "#ef4444",
  down: "#3b82f6",
  neutral: "#a78bfa",
};

export function KpiSparkline({ data, direction }: Props) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 0, bottom: 4, left: 0 }}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line
            type="monotone"
            dataKey="v"
            stroke={STROKE[direction]}
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
