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
