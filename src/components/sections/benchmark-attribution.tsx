import { TrendingUp, Sparkles } from "lucide-react";

const TOTAL_RETURN = 24.3;
const BETA_RETURN = 15.1;
const ALPHA_RETURN = 9.2;

export function BenchmarkAttribution() {
  const betaShare = (BETA_RETURN / TOTAL_RETURN) * 100;
  const alphaShare = (ALPHA_RETURN / TOTAL_RETURN) * 100;

  return (
    <section
      id="benchmark-attribution"
      className="relative border-t border-border/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-highlight">
              Benchmark attribution
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              시장 덕인지, 내 매매 덕인지 분리합니다
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              포트폴리오 수익률을 <strong className="text-foreground">시장 베타</strong>(보유
              비중에 따른 벤치마크 자연 상승분)와{" "}
              <strong className="text-foreground">알파</strong>(매매 의사결정으로 만든 초과
              수익)로 나눠 보여드립니다. 알파가 음수면 매매가 오히려 발목을 잡았다는 뜻입니다.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-down" />
                <span>
                  <strong className="text-foreground">시장 베타</strong> — 같은 비중으로
                  벤치마크(KOSPI / S&amp;P500 / NASDAQ)를 보유했을 때의 자연 수익
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-up" />
                <span>
                  <strong className="text-foreground">알파</strong> — 종목 선택과 매매 타이밍이
                  추가로 만든 초과 수익 (또는 누수)
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 p-6 md:p-8">
            <div className="mb-2 text-xs text-muted-foreground">12개월 누적 수익률 분해</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums text-up md:text-5xl">
                +{TOTAL_RETURN.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">총 수익률</span>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>벤치마크 기여 (베타)</span>
                <span className="tabular-nums">+{BETA_RETURN.toFixed(1)}%p</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                  className="flex h-full"
                  role="img"
                  aria-label={`수익률 분해: 시장 베타 ${BETA_RETURN.toFixed(1)}%p, 알파 ${ALPHA_RETURN.toFixed(1)}%p`}
                >
                  <div
                    className="h-full bg-down/70"
                    style={{ width: `${betaShare}%` }}
                  />
                  <div
                    className="h-full bg-up/80"
                    style={{ width: `${alphaShare}%` }}
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-down/70" /> 베타
                </span>
                <span className="tabular-nums">+{ALPHA_RETURN.toFixed(1)}%p</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">시장 베타</div>
                <div className="mt-1 text-lg font-semibold tabular-nums text-down">
                  +{BETA_RETURN.toFixed(1)}%p
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground/80">
                  {betaShare.toFixed(0)}% 비중
                </div>
              </div>
              <div className="rounded-md bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">알파</div>
                <div className="mt-1 text-lg font-semibold tabular-nums text-up">
                  +{ALPHA_RETURN.toFixed(1)}%p
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground/80">
                  {alphaShare.toFixed(0)}% 비중
                </div>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-muted-foreground/70">
              ※ 예시 수치. 실제 분해는 보유 비중과 거래일을 반영해 계산됩니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
