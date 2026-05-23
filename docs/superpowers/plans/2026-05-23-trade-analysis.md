# Trade Analysis Charts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an "분석" tab inside the trade history section that shows two Recharts visualizations — an equity curve (cumulative realized PnL over time) and a per-ticker PnL bar chart.

**Architecture:** Refactor `trade-history.tsx` into a tabs orchestrator. Extract the existing form+table into `trade-history-table.tsx`. Add `trade-analytics.tsx` that composes two new chart components. All chart math lives in pure functions in `src/lib/analytics.ts`, which call `computeDerived` so derived values stay computed (not persisted) — matching the existing CLAUDE.md rule.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Recharts 3, Radix Tabs (shadcn wrapper at `src/components/ui/tabs.tsx`). No new dependencies.

**Verification:** This project has no test runner (CLAUDE.md). Each task verifies via `npm run lint` + `npm run build`, plus a manual browser pass at the end. Pure functions in `analytics.ts` are small and exercised directly through the UI.

**Spec:** `docs/superpowers/specs/2026-05-23-trade-analysis-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/analytics.ts` | Create | Pure functions: `buildEquityCurve`, `buildPnlByTicker`. Types: `EquityPoint`, `TickerPnl`. |
| `src/components/sections/equity-curve-chart.tsx` | Create | Recharts `LineChart` rendering `EquityPoint[]`. |
| `src/components/sections/pnl-by-ticker-chart.tsx` | Create | Recharts `BarChart` with per-bar `Cell` coloring rendering `TickerPnl[]`. |
| `src/components/sections/trade-analytics.tsx` | Create | Composes both charts. Empty-state guard. Receives `trades` as prop. |
| `src/components/sections/trade-history-table.tsx` | Create | Form-mode state + table render extracted from current `trade-history.tsx`. Receives `trades` + CRUD callbacks as props. |
| `src/components/sections/trade-history.tsx` | Refactor | Tabs orchestrator. Owns `useTrades` + `useAuth` + active-tab state. Renders summary cards above tabs; toolbar buttons only on the 내역 tab. |

---

## Task 1: Pure analytics functions

**Files:**
- Create: `src/lib/analytics.ts`

- [ ] **Step 1: Write the file**

Create `src/lib/analytics.ts`:

```ts
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
      existing.pnl += pnl;
    } else {
      groups.set(t.ticker, { ticker: t.ticker, name: t.name, pnl });
    }
  }
  return [...groups.values()].sort(
    (a, b) => Math.abs(b.pnl) - Math.abs(a.pnl),
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint`
Expected: no warnings/errors related to the new file.

Run: `npm run build`
Expected: build succeeds with no TypeScript errors. (The file is unused at this point but must compile.)

- [ ] **Step 3: Commit**

```powershell
git add src/lib/analytics.ts
git commit -m @'
Add pure trade analytics helpers

buildEquityCurve and buildPnlByTicker derive chart-ready data from
Trade[] via computeDerived. No persistence of derived values.
'@
```

---

## Task 2: Equity curve chart component

**Files:**
- Create: `src/components/sections/equity-curve-chart.tsx`

- [ ] **Step 1: Write the file**

Create `src/components/sections/equity-curve-chart.tsx`:

```tsx
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
  // "2024-09-20" -> "24-09-20"
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
              formatter={(value: number) => [
                `${formatSignedCurrency(value)}원`,
                "누적 손익",
              ]}
              labelFormatter={(label: string) => `처분일 ${label}`}
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
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint`
Run: `npm run build`
Expected: both pass.

- [ ] **Step 3: Commit**

```powershell
git add src/components/sections/equity-curve-chart.tsx
git commit -m @'
Add EquityCurveChart (Recharts LineChart)

Reads cumulative realized PnL over sellDate via buildEquityCurve.
Line color follows terminal-value sign using --up/--down CSS vars.
'@
```

---

## Task 3: Per-ticker PnL bar chart

**Files:**
- Create: `src/components/sections/pnl-by-ticker-chart.tsx`

- [ ] **Step 1: Write the file**

Create `src/components/sections/pnl-by-ticker-chart.tsx`:

```tsx
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
import { buildPnlByTicker, type TickerPnl } from "@/lib/analytics";
import { formatSignedCurrency, type Trade } from "@/lib/trades";

type Props = { trades: Trade[] };

function formatAxisCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

export function PnlByTickerChart({ trades }: Props) {
  const data = useMemo(() => buildPnlByTicker(trades), [trades]);

  return (
    <div className="rounded-lg border border-border/40 bg-card/40 p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        종목별 손익
      </h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              stroke="var(--border)"
              interval={0}
              angle={-20}
              textAnchor="end"
              height={56}
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
              formatter={(value: number, _name, item) => [
                `${formatSignedCurrency(value)}원`,
                `${item.payload.name} (${item.payload.ticker})`,
              ]}
              labelFormatter={() => ""}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.ticker}
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

export type { TickerPnl };
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint`
Run: `npm run build`
Expected: both pass.

- [ ] **Step 3: Commit**

```powershell
git add src/components/sections/pnl-by-ticker-chart.tsx
git commit -m @'
Add PnlByTickerChart (Recharts BarChart with per-bar Cell coloring)

Groups trades by ticker via buildPnlByTicker, sorts by |PnL|.
Each Cell colored by sign with Korean market convention.
'@
```

---

## Task 4: Analytics tab container

**Files:**
- Create: `src/components/sections/trade-analytics.tsx`

- [ ] **Step 1: Write the file**

Create `src/components/sections/trade-analytics.tsx`:

```tsx
"use client";

import { EquityCurveChart } from "@/components/sections/equity-curve-chart";
import { PnlByTickerChart } from "@/components/sections/pnl-by-ticker-chart";
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
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint`
Run: `npm run build`
Expected: both pass.

- [ ] **Step 3: Commit**

```powershell
git add src/components/sections/trade-analytics.tsx
git commit -m @'
Add TradeAnalytics tab container

Composes EquityCurveChart and PnlByTickerChart. Guards loading
and empty states with friendly Korean messages.
'@
```

---

## Task 5: Extract the existing table into its own component

**Files:**
- Create: `src/components/sections/trade-history-table.tsx`

The goal: lift the form mode state, table rendering, delete confirmation, and the auto-close-on-logout effect out of `trade-history.tsx` so the parent can become a clean tab orchestrator. **Do not modify `trade-history.tsx` yet** — that happens in Task 6.

- [ ] **Step 1: Write the new file**

Create `src/components/sections/trade-history-table.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TradeHistoryForm } from "@/components/sections/trade-history-form";
import {
  computeDerived,
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  type Trade,
} from "@/lib/trades";
import { cn } from "@/lib/utils";

type FormMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; trade: Trade };

type Props = {
  trades: Trade[];
  isHydrated: boolean;
  hasUser: boolean;
  pendingCreate: boolean;
  onCreateHandled: () => void;
  addTrade: (input: Omit<Trade, "id">) => void;
  updateTrade: (id: string, input: Omit<Trade, "id">) => void;
  removeTrade: (id: string) => void;
};

export function TradeHistoryTable({
  trades,
  isHydrated,
  hasUser,
  pendingCreate,
  onCreateHandled,
  addTrade,
  updateTrade,
  removeTrade,
}: Props) {
  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });

  useEffect(() => {
    if (!hasUser) setFormMode({ kind: "closed" });
  }, [hasUser]);

  useEffect(() => {
    if (pendingCreate) {
      setFormMode({ kind: "create" });
      onCreateHandled();
    }
  }, [pendingCreate, onCreateHandled]);

  function handleSubmit(input: Omit<Trade, "id">) {
    if (formMode.kind === "edit") {
      updateTrade(formMode.trade.id, input);
    } else {
      addTrade(input);
    }
    setFormMode({ kind: "closed" });
  }

  function handleDelete(trade: Trade) {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      `${trade.name}(${trade.ticker}) 거래를 삭제할까요?`,
    );
    if (ok) removeTrade(trade.id);
  }

  return (
    <>
      {formMode.kind !== "closed" ? (
        <div className="mb-8">
          <TradeHistoryForm
            key={formMode.kind === "edit" ? formMode.trade.id : "create"}
            initial={formMode.kind === "edit" ? formMode.trade : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setFormMode({ kind: "closed" })}
          />
        </div>
      ) : null}

      <div className="rounded-lg border border-border/60 bg-card/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주가코드</TableHead>
              <TableHead>이름</TableHead>
              <TableHead className="text-right">구입가</TableHead>
              <TableHead className="text-right">수량</TableHead>
              <TableHead>구입일</TableHead>
              <TableHead>처분일</TableHead>
              <TableHead className="text-right">처분금액</TableHead>
              <TableHead className="text-right">수수료</TableHead>
              <TableHead className="text-right">증권거래세</TableHead>
              <TableHead className="text-right">거래차액</TableHead>
              <TableHead className="text-right">수익율</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isHydrated ? (
              <EmptyRow message="불러오는 중…" />
            ) : trades.length === 0 ? (
              <EmptyRow message="거래 내역이 없습니다. 우측 상단의 '거래 추가'를 눌러 첫 거래를 입력해보세요." />
            ) : (
              trades.map((trade) => {
                const d = computeDerived(trade);
                return (
                  <TableRow key={trade.id}>
                    <TableCell className="font-mono text-xs">
                      {trade.ticker}
                    </TableCell>
                    <TableCell className="font-medium">{trade.name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(trade.buyPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(trade.quantity)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {trade.buyDate}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {trade.sellDate}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(trade.sellAmount)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right",
                        d.feeIsAuto && "text-muted-foreground/80",
                      )}
                      title={d.feeIsAuto ? "자동 계산값" : "수동 입력값"}
                    >
                      {formatCurrency(d.fee)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right",
                        d.taxIsAuto && "text-muted-foreground/80",
                      )}
                      title={d.taxIsAuto ? "자동 계산값" : "수동 입력값"}
                    >
                      {formatCurrency(d.tax)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        d.pnl > 0 && "text-up",
                        d.pnl < 0 && "text-down",
                      )}
                    >
                      {formatSignedCurrency(d.pnl)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        d.returnRate > 0 && "text-up",
                        d.returnRate < 0 && "text-down",
                      )}
                    >
                      {formatPercent(d.returnRate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <RowAction
                          label="수정"
                          onClick={() =>
                            setFormMode({ kind: "edit", trade })
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </RowAction>
                        <RowAction
                          label="삭제"
                          onClick={() => handleDelete(trade)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </RowAction>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground/80">
        ※ 자동 계산은 한국 시장 평균치(수수료 0.015%, 증권거래세 0.18%) 기준이며 실제 영수증과 차이가 있을 수 있습니다. 폼에서 수동으로 덮어쓸 수 있습니다.
      </p>
    </>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell
        colSpan={12}
        className="py-12 text-center text-sm text-muted-foreground"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

function RowAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/40 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
    >
      {children}
    </button>
  );
}
```

**Why `pendingCreate`/`onCreateHandled`?** The "거래 추가" button lives in the parent's header (outside this component) so the parent can hide it on the analytics tab. When the parent fires that button, it sets `pendingCreate=true`; the child opens its form and immediately calls `onCreateHandled` to flip the flag back. This keeps form-mode ownership inside the table without giving the parent a ref or imperative handle.

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint`
Run: `npm run build`
Expected: both pass. (The file is unused at this point but must compile.)

- [ ] **Step 3: Commit**

```powershell
git add src/components/sections/trade-history-table.tsx
git commit -m @'
Extract trade table + form into TradeHistoryTable

Lifts form mode state and table render out of trade-history.tsx so
the parent can host a Tabs orchestrator in the next commit.
'@
```

---

## Task 6: Refactor trade-history.tsx into a tabs orchestrator

**Files:**
- Modify: `src/components/sections/trade-history.tsx` (full rewrite — replace contents)

- [ ] **Step 1: Replace the file contents**

Overwrite `src/components/sections/trade-history.tsx` with:

```tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { LogIn, Plus, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeHistoryTable } from "@/components/sections/trade-history-table";
import { TradeAnalytics } from "@/components/sections/trade-analytics";
import { useAuth } from "@/components/auth/auth-context";
import { useTrades } from "@/lib/use-trades";
import {
  computeDerived,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/trades";
import { cn } from "@/lib/utils";

type TabValue = "history" | "analytics";

export function TradeHistory() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const { trades, isHydrated, addTrade, updateTrade, removeTrade, resetTrades } =
    useTrades();
  const [activeTab, setActiveTab] = useState<TabValue>("history");
  const [pendingCreate, setPendingCreate] = useState(false);

  const showAuthGate = !authLoading && !user;

  const summary = useMemo(() => {
    if (trades.length === 0) {
      return { count: 0, totalPnl: 0, avgReturn: 0 };
    }
    let totalPnl = 0;
    let totalReturn = 0;
    for (const t of trades) {
      const d = computeDerived(t);
      totalPnl += d.pnl;
      totalReturn += d.returnRate;
    }
    return {
      count: trades.length,
      totalPnl,
      avgReturn: totalReturn / trades.length,
    };
  }, [trades]);

  const handleCreateHandled = useCallback(() => setPendingCreate(false), []);

  function handleReset() {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      "입력하신 모든 거래 내역이 초기 시드 데이터로 되돌아갑니다. 계속할까요?",
    );
    if (ok) resetTrades();
  }

  const showToolbar = !showAuthGate && activeTab === "history";

  return (
    <section
      id="trade-history"
      className="relative border-t border-border/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-highlight">
              Trade history
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              내 매매내역으로 직접 계산해보기
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              처분이 끝난 거래를 입력하면 수수료와 증권거래세를 자동으로 차감해 실현 손익과 수익률을 계산합니다.
            </p>
          </div>
          {showToolbar ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40"
              >
                <RotateCcw className="h-4 w-4" />
                초기화
              </button>
              <button
                type="button"
                onClick={() => setPendingCreate(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-highlight/90 px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-highlight"
              >
                <Plus className="h-4 w-4" />
                거래 추가
              </button>
            </div>
          ) : null}
        </div>

        {showAuthGate ? (
          <div className="rounded-lg border border-border/60 bg-card/60 p-10 text-center">
            <h3 className="text-lg font-semibold">
              로그인하면 본인 거래내역을 안전하게 저장할 수 있습니다
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              모든 데이터는 본인 계정에서만 보입니다.
            </p>
            <button
              type="button"
              onClick={openLogin}
              className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-highlight/90 px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-highlight"
            >
              <LogIn className="h-4 w-4" />
              로그인 / 회원가입
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-3 md:grid-cols-3">
              <SummaryCard
                label="처분 거래 수"
                value={`${summary.count}건`}
                tone="neutral"
              />
              <SummaryCard
                label="총 실현 손익"
                value={
                  summary.count === 0
                    ? "—"
                    : formatSignedCurrency(summary.totalPnl) + "원"
                }
                tone={
                  summary.count === 0
                    ? "neutral"
                    : summary.totalPnl > 0
                      ? "up"
                      : summary.totalPnl < 0
                        ? "down"
                        : "neutral"
                }
              />
              <SummaryCard
                label="평균 수익률"
                value={
                  summary.count === 0 ? "—" : formatPercent(summary.avgReturn)
                }
                tone={
                  summary.count === 0
                    ? "neutral"
                    : summary.avgReturn > 0
                      ? "up"
                      : summary.avgReturn < 0
                        ? "down"
                        : "neutral"
                }
              />
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabValue)}
            >
              <TabsList>
                <TabsTrigger value="history">내역</TabsTrigger>
                <TabsTrigger value="analytics">분석</TabsTrigger>
              </TabsList>
              <TabsContent value="history">
                <TradeHistoryTable
                  trades={trades}
                  isHydrated={isHydrated}
                  hasUser={Boolean(user)}
                  pendingCreate={pendingCreate}
                  onCreateHandled={handleCreateHandled}
                  addTrade={addTrade}
                  updateTrade={updateTrade}
                  removeTrade={removeTrade}
                />
              </TabsContent>
              <TabsContent value="analytics">
                <TradeAnalytics trades={trades} isHydrated={isHydrated} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums",
          tone === "up" && "text-up",
          tone === "down" && "text-down",
        )}
      >
        {value}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint`
Run: `npm run build`
Expected: both pass with no warnings about unused imports.

- [ ] **Step 3: Commit**

```powershell
git add src/components/sections/trade-history.tsx
git commit -m @'
Wire up tabs orchestrator in TradeHistory

Summary cards stay above the tabs (apply to both views). Toolbar
buttons (초기화 / 거래 추가) only show on the 내역 tab. 분석 tab
renders TradeAnalytics with the same trades data.
'@
```

---

## Task 7: End-to-end manual verification

**Files:** None (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server starts on http://localhost:3000 with no compile errors.

- [ ] **Step 2: Logged-out check**

Open http://localhost:3000 in a browser. Scroll to "내 매매내역으로 직접 계산해보기".
Expected: still shows the "로그인 / 회원가입" gate card. No tabs are visible. No console errors.

- [ ] **Step 3: Logged-in check — 내역 tab**

Log in with a Supabase test user. After redirect:
- Summary cards (건수 / 총손익 / 평균수익률) appear above the tabs.
- Two tabs visible: 내역 (active by default), 분석.
- Toolbar buttons (초기화, 거래 추가) visible in the section header.
- The trade table renders existing rows (or empty-state message if none).
- 거래 추가 button still opens the inline form. Submitting adds a row.
- 수정 / 삭제 buttons still work. Delete confirm dialog appears.

- [ ] **Step 4: Logged-in check — 분석 tab**

Click 분석:
- Toolbar buttons in the header disappear.
- If trades exist: two cards render — "누적 손익 곡선" (line chart) and "종목별 손익" (bar chart).
- Line color is red (`--up`) if total realized PnL > 0, blue (`--down`) if < 0.
- Bar colors follow each ticker's PnL sign (red for winners, blue for losers).
- Hover tooltips show Korean labels and signed currency in 원.
- If no trades: empty-state card reads "거래를 1건 이상 입력하면 차트가 표시됩니다."

- [ ] **Step 5: Tab switch sanity**

Switch between 내역 and 분석 several times.
Expected: no flicker, no re-fetch from Supabase (network tab quiet), summary cards stay put.

- [ ] **Step 6: Final lint + build**

Stop the dev server.
Run: `npm run lint`
Run: `npm run build`
Expected: both pass cleanly.

- [ ] **Step 7: If any fixes were needed during verification, commit them**

```powershell
git add -A
git commit -m "Polish trade analytics after manual verification"
```

(Skip this step if no changes were needed.)

---

## Acceptance Criteria (from spec)

- [x] Logged-in user can switch between 내역 and 분석 tabs inside the trade history section. → Task 6
- [x] 내역 tab's behavior is identical to before (form, table, delete confirm, reset). → Tasks 5, 6
- [x] 분석 tab shows both charts. → Tasks 2, 3, 4
- [x] Empty / loading states don't crash the analytics tab. → Task 4
- [x] Charts use Korean market color convention (red gain, blue loss). → Tasks 2, 3
- [x] `npm run build` passes. → Tasks 1-7 each verify, Task 7 does a final pass.
