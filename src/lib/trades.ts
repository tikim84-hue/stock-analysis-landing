export type Trade = {
  id: string;
  ticker: string;
  name: string;
  buyPrice: number;
  quantity: number;
  buyDate: string;
  sellDate: string;
  sellAmount: number;
  feeOverride?: number;
  taxOverride?: number;
};

export const BROKER_FEE_RATE = 0.00015;
export const TRANSACTION_TAX_RATE = 0.0018;

export type DerivedTrade = {
  buyCost: number;
  fee: number;
  tax: number;
  pnl: number;
  returnRate: number;
  feeIsAuto: boolean;
  taxIsAuto: boolean;
};

export function computeDerived(trade: Trade): DerivedTrade {
  const buyCost = trade.buyPrice * trade.quantity;
  const autoFee = (buyCost + trade.sellAmount) * BROKER_FEE_RATE;
  const autoTax = trade.sellAmount * TRANSACTION_TAX_RATE;

  const feeIsAuto = trade.feeOverride === undefined;
  const taxIsAuto = trade.taxOverride === undefined;

  const fee = feeIsAuto ? autoFee : (trade.feeOverride as number);
  const tax = taxIsAuto ? autoTax : (trade.taxOverride as number);

  const pnl = trade.sellAmount - buyCost - fee - tax;
  const returnRate = buyCost > 0 ? (pnl / buyCost) * 100 : 0;

  return { buyCost, fee, tax, pnl, returnRate, feeIsAuto, taxIsAuto };
}

const krwFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return krwFormatter.format(Math.round(value));
}

export function formatPercent(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatSignedCurrency(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${krwFormatter.format(Math.round(Math.abs(value)))}`;
}

export const SEED_TRADES: Trade[] = [
  {
    id: "seed-samsung",
    ticker: "005930",
    name: "삼성전자",
    buyPrice: 70000,
    quantity: 100,
    buyDate: "2024-03-15",
    sellDate: "2024-09-20",
    sellAmount: 7850000,
  },
  {
    id: "seed-kakao",
    ticker: "035720",
    name: "카카오",
    buyPrice: 55000,
    quantity: 50,
    buyDate: "2024-01-10",
    sellDate: "2024-06-25",
    sellAmount: 2410000,
  },
  {
    id: "seed-hynix",
    ticker: "000660",
    name: "SK하이닉스",
    buyPrice: 130000,
    quantity: 30,
    buyDate: "2023-11-05",
    sellDate: "2025-01-15",
    sellAmount: 6600000,
  },
];
