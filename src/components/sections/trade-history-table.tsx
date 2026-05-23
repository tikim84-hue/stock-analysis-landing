"use client";

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

export type FormMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; trade: Trade };

type Props = {
  trades: Trade[];
  isHydrated: boolean;
  formMode: FormMode;
  onFormModeChange: (mode: FormMode) => void;
  addTrade: (input: Omit<Trade, "id">) => void;
  updateTrade: (id: string, input: Omit<Trade, "id">) => void;
  removeTrade: (id: string) => void;
};

export function TradeHistoryTable({
  trades,
  isHydrated,
  formMode,
  onFormModeChange,
  addTrade,
  updateTrade,
  removeTrade,
}: Props) {
  function handleSubmit(input: Omit<Trade, "id">) {
    if (formMode.kind === "edit") {
      updateTrade(formMode.trade.id, input);
    } else {
      addTrade(input);
    }
    onFormModeChange({ kind: "closed" });
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
            onCancel={() => onFormModeChange({ kind: "closed" })}
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
                            onFormModeChange({ kind: "edit", trade })
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
