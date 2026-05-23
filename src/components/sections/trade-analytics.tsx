"use client";

import { EquityCurveChart } from "@/components/sections/equity-curve-chart";
import { PnlByTickerChart } from "@/components/sections/pnl-by-ticker-chart";
import { MonthlyPnlChart } from "@/components/sections/monthly-pnl-chart";
import type { Trade } from "@/lib/trades";

type Props = {
  trades: Trade[];
  isHydrated: boolean;
};

export function TradeAnalytics({ trades, isHydrated }: Props) {
  if (!isHydrated) {
    return (
      <div className="rounded-lg border border-border/40 bg-card/40 py-12 text-center text-sm text-muted-foreground">
        불러오는 중…
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="rounded-lg border border-border/40 bg-card/40 py-12 text-center text-sm text-muted-foreground">
        거래를 1건 이상 입력하면 차트가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <EquityCurveChart trades={trades} />
      <PnlByTickerChart trades={trades} />
      <MonthlyPnlChart trades={trades} />
    </div>
  );
}
