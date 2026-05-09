"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  computeDerived,
  formatCurrency,
  formatPercent,
  type Trade,
} from "@/lib/trades";

type FormState = {
  ticker: string;
  name: string;
  buyPrice: string;
  quantity: string;
  buyDate: string;
  sellDate: string;
  sellAmount: string;
  feeAuto: boolean;
  fee: string;
  taxAuto: boolean;
  tax: string;
};

const EMPTY: FormState = {
  ticker: "",
  name: "",
  buyPrice: "",
  quantity: "",
  buyDate: "",
  sellDate: "",
  sellAmount: "",
  feeAuto: true,
  fee: "",
  taxAuto: true,
  tax: "",
};

function tradeToFormState(trade: Trade): FormState {
  return {
    ticker: trade.ticker,
    name: trade.name,
    buyPrice: String(trade.buyPrice),
    quantity: String(trade.quantity),
    buyDate: trade.buyDate,
    sellDate: trade.sellDate,
    sellAmount: String(trade.sellAmount),
    feeAuto: trade.feeOverride === undefined,
    fee: trade.feeOverride !== undefined ? String(trade.feeOverride) : "",
    taxAuto: trade.taxOverride === undefined,
    tax: trade.taxOverride !== undefined ? String(trade.taxOverride) : "",
  };
}

function parseFormToTrade(form: FormState): Omit<Trade, "id"> | null {
  const buyPrice = Number(form.buyPrice);
  const quantity = Number(form.quantity);
  const sellAmount = Number(form.sellAmount);
  const ticker = form.ticker.trim();
  const name = form.name.trim();

  if (!ticker || !name) return null;
  if (!Number.isFinite(buyPrice) || buyPrice <= 0) return null;
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  if (!Number.isFinite(sellAmount) || sellAmount < 0) return null;
  if (!form.buyDate || !form.sellDate) return null;

  const out: Omit<Trade, "id"> = {
    ticker,
    name,
    buyPrice,
    quantity,
    buyDate: form.buyDate,
    sellDate: form.sellDate,
    sellAmount,
  };

  if (!form.feeAuto) {
    const v = Number(form.fee);
    if (Number.isFinite(v) && v >= 0) out.feeOverride = v;
  }
  if (!form.taxAuto) {
    const v = Number(form.tax);
    if (Number.isFinite(v) && v >= 0) out.taxOverride = v;
  }
  return out;
}

type Props = {
  initial?: Trade;
  onSubmit: (input: Omit<Trade, "id">) => void;
  onCancel: () => void;
};

export function TradeHistoryForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(() =>
    initial ? tradeToFormState(initial) : EMPTY,
  );

  const preview = useMemo(() => {
    const candidate = parseFormToTrade(form);
    if (!candidate) return null;
    return computeDerived({ ...candidate, id: "preview" });
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trade = parseFormToTrade(form);
    if (!trade) return;
    onSubmit(trade);
  }

  const submitDisabled = parseFormToTrade(form) === null;

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in-up rounded-lg border border-border/60 bg-card/60 p-5 md:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">
          {initial ? "거래 수정" : "새 거래 추가"}
        </h3>
        <p className="text-xs text-muted-foreground">
          처분이 완료된 거래만 입력하세요.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label="주가코드">
          <Input
            value={form.ticker}
            onChange={(e) => update("ticker", e.target.value)}
            placeholder="예: 005930"
            inputMode="numeric"
            required
          />
        </Field>
        <Field label="이름">
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="예: 삼성전자"
            required
          />
        </Field>
        <Field label="수량">
          <Input
            type="number"
            min="1"
            step="1"
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            required
          />
        </Field>
        <Field label="구입가 (1주)">
          <Input
            type="number"
            min="0"
            step="1"
            value={form.buyPrice}
            onChange={(e) => update("buyPrice", e.target.value)}
            required
          />
        </Field>
        <Field label="구입일">
          <Input
            type="date"
            value={form.buyDate}
            onChange={(e) => update("buyDate", e.target.value)}
            required
          />
        </Field>
        <Field label="처분일">
          <Input
            type="date"
            value={form.sellDate}
            onChange={(e) => update("sellDate", e.target.value)}
            required
          />
        </Field>
        <Field label="처분금액 (총액)">
          <Input
            type="number"
            min="0"
            step="1"
            value={form.sellAmount}
            onChange={(e) => update("sellAmount", e.target.value)}
            required
          />
        </Field>
        <Field
          label="수수료"
          hint={form.feeAuto ? "자동: 거래대금 × 0.015%" : undefined}
        >
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              step="1"
              value={form.feeAuto ? "" : form.fee}
              onChange={(e) => update("fee", e.target.value)}
              placeholder={
                form.feeAuto && preview ? formatCurrency(preview.fee) : "0"
              }
              disabled={form.feeAuto}
            />
            <AutoToggle
              checked={form.feeAuto}
              onChange={(v) => update("feeAuto", v)}
            />
          </div>
        </Field>
        <Field
          label="증권거래세"
          hint={form.taxAuto ? "자동: 처분금액 × 0.18%" : undefined}
        >
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              step="1"
              value={form.taxAuto ? "" : form.tax}
              onChange={(e) => update("tax", e.target.value)}
              placeholder={
                form.taxAuto && preview ? formatCurrency(preview.tax) : "0"
              }
              disabled={form.taxAuto}
            />
            <AutoToggle
              checked={form.taxAuto}
              onChange={(v) => update("taxAuto", v)}
            />
          </div>
        </Field>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border/40 pt-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-muted-foreground">예상 거래차액</span>
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              preview && preview.pnl > 0 && "text-up",
              preview && preview.pnl < 0 && "text-down",
            )}
          >
            {preview ? formatCurrency(preview.pnl) + "원" : "—"}
          </span>
          <span className="text-muted-foreground">예상 수익률</span>
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              preview && preview.returnRate > 0 && "text-up",
              preview && preview.returnRate < 0 && "text-down",
            )}
          >
            {preview ? formatPercent(preview.returnRate) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border/60 bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitDisabled}
            className="rounded-md bg-highlight/90 px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-50"
          >
            {initial ? "수정 저장" : "거래 추가"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint ? (
        <span className="text-[11px] text-muted-foreground/70">{hint}</span>
      ) : null}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm tabular-nums outline-none transition-colors",
        "focus:border-ring focus:ring-1 focus:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-60",
        props.className,
      )}
    />
  );
}

function AutoToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
        checked
          ? "border-highlight/60 bg-highlight/15 text-highlight"
          : "border-border/60 bg-transparent text-muted-foreground hover:bg-muted/40",
      )}
      aria-pressed={checked}
    >
      자동
    </button>
  );
}
