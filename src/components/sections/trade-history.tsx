"use client";

import { useEffect, useMemo, useState } from "react";
import { LogIn, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TradeHistoryForm } from "@/components/sections/trade-history-form";
import { useAuth } from "@/components/auth/auth-context";
import { useTrades } from "@/lib/use-trades";
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

export function TradeHistory() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const { trades, isHydrated, addTrade, updateTrade, removeTrade, resetTrades } =
    useTrades();
  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });

  useEffect(() => {
    if (!user) setFormMode({ kind: "closed" });
  }, [user]);

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

  function handleSubmit(input: Omit<Trade, "id">) {
    if (formMode.kind === "edit") {
      updateTrade(formMode.trade.id, input);
    } else {
      addTrade(input);
    }
    setFormMode({ kind: "closed" });
  }

  function handleReset() {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      "입력하신 모든 거래 내역이 초기 시드 데이터로 되돌아갑니다. 계속할까요?",
    );
    if (ok) resetTrades();
  }

  function handleDelete(trade: Trade) {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      `${trade.name}(${trade.ticker}) 거래를 삭제할까요?`,
    );
    if (ok) removeTrade(trade.id);
  }

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
          {!showAuthGate ? (
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
                onClick={() => setFormMode({ kind: "create" })}
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
            value={summary.count === 0 ? "—" : formatPercent(summary.avgReturn)}
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
