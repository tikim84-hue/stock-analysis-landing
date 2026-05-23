import { Activity, BarChart3, Gauge, ShieldAlert, TrendingDown } from "lucide-react";

type Metric = {
  key: string;
  label: string;
  full: string;
  body: string;
  sample: string;
  sampleTone: "up" | "down" | "neutral";
  icon: typeof Activity;
};

const METRICS: Metric[] = [
  {
    key: "twr",
    label: "TWR",
    full: "Time-Weighted Return",
    body: "현금 입출금 영향을 제거한 순수 운용 수익률. 펀드 평가의 표준입니다.",
    sample: "+18.7%",
    sampleTone: "up",
    icon: Activity,
  },
  {
    key: "mwr",
    label: "MWR",
    full: "Money-Weighted Return",
    body: "내 자금 흐름을 반영한 실제 수익률. 추가 매수·인출 타이밍까지 평가합니다.",
    sample: "+21.4%",
    sampleTone: "up",
    icon: BarChart3,
  },
  {
    key: "alpha",
    label: "알파",
    full: "Alpha vs Benchmark",
    body: "벤치마크 대비 초과 수익. 시장 덕이 아닌 매매 의사결정의 기여분입니다.",
    sample: "+9.2%p",
    sampleTone: "up",
    icon: Gauge,
  },
  {
    key: "sharpe",
    label: "샤프",
    full: "Sharpe Ratio",
    body: "감수한 변동성 대비 얼마나 효율적으로 수익을 냈는지 측정합니다.",
    sample: "1.42",
    sampleTone: "neutral",
    icon: ShieldAlert,
  },
  {
    key: "mdd",
    label: "MDD",
    full: "Max Drawdown",
    body: "고점 대비 가장 깊었던 낙폭. 손실 내성을 가늠하는 핵심 지표입니다.",
    sample: "−12.5%",
    sampleTone: "down",
    icon: TrendingDown,
  },
];

export function MetricsPreview() {
  return (
    <section
      id="metrics-preview"
      className="relative border-t border-border/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-highlight">
            Metrics preview
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            계산하는 지표
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            감으로 평가하던 매매 성과를 자산운용 업계에서 쓰는 표준 지표로 환산합니다. 모두
            한 화면에서 비교할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {METRICS.map((m) => (
            <div
              key={m.key}
              className="flex h-full flex-col rounded-lg border border-border/60 bg-card/60 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-highlight/15 text-highlight">
                  <m.icon className="h-5 w-5" />
                </span>
                <span
                  className={
                    "text-lg font-semibold tabular-nums " +
                    (m.sampleTone === "up"
                      ? "text-up"
                      : m.sampleTone === "down"
                        ? "text-down"
                        : "text-foreground")
                  }
                >
                  {m.sample}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold">{m.label}</h3>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                {m.full}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {m.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground/70">
          ※ 위 숫자는 예시이며, 실제 분석은 입력하신 거래내역을 기준으로 계산됩니다.
        </p>
      </div>
    </section>
  );
}
