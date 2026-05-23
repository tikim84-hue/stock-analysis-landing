import { computeDerived, type Trade } from "@/lib/trades";

export type EquityPoint = {
  date: string;
  cumulativePnl: number;
};

export type TickerPnl = {
  ticker: string;
  name: string;
  pnl: number;
};

export function buildEquityCurve(trades: Trade[]): EquityPoint[] {
  const sorted = [...trades].sort((a, b) =>
    a.sellDate.localeCompare(b.sellDate),
  );
  const points: EquityPoint[] = [];
  let running = 0;
  for (const t of sorted) {
    running += computeDerived(t).pnl;
    points.push({ date: t.sellDate, cumulativePnl: running });
  }
  return points;
}

export function buildPnlByTicker(trades: Trade[]): TickerPnl[] {
  const groups = new Map<string, TickerPnl>();
  for (const t of trades) {
    const pnl = computeDerived(t).pnl;
    const existing = groups.get(t.ticker);
    if (existing) {
      groups.set(t.ticker, { ...existing, pnl: existing.pnl + pnl });
    } else {
      groups.set(t.ticker, { ticker: t.ticker, name: t.name, pnl });
    }
  }
  return [...groups.values()].sort(
    (a, b) =>
      Math.abs(b.pnl) - Math.abs(a.pnl) || a.ticker.localeCompare(b.ticker),
  );
}
