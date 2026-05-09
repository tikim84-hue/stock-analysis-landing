import { Badge } from "@/components/ui/badge";
import { HeroMiniChart } from "@/components/charts/hero-mini-chart";
import { TrendingUp, ShieldCheck, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
      <div className="absolute inset-0 bg-radial-fade" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 md:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-in-up">
            <div className="mb-6 flex flex-wrap gap-2">
              <Badge variant="accent">
                <Sparkles className="mr-1 h-3 w-3" />
                액티브 개인 투자자용
              </Badge>
              <Badge>KOSPI · S&P500 · NASDAQ 벤치마크</Badge>
              <Badge>수수료·세금 차감 후 실수익률</Badge>
            </div>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              당신의 수익률,
              <br />
              <span className="bg-gradient-to-r from-up via-highlight to-down-soft bg-clip-text text-transparent">
                정말 시장을 이기고 있나요?
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              감(感)으로 평가하던 매매 성과를{" "}
              <strong className="text-foreground">TWR · MWR · 알파 · 샤프 ·
              MDD</strong>{" "}
              같은 프로 지표로 자동 분석합니다. 수익률이 시장 덕인지, 진짜 내 매매
              덕인지 — 한 페이지에서 분리해 보여드립니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-up" />
                <span>벤치마크 대비 알파 분해</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-highlight" />
                <span>리스크 조정 수익 측정</span>
              </div>
            </div>
          </div>

          <div
            className="relative rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="mb-3 flex items-center justify-between px-2">
              <div className="text-xs text-muted-foreground">
                12개월 누적 수익률 (%, 100 기준)
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-up">
                  <span className="h-2 w-2 rounded-full bg-up" /> 내 포트폴리오
                </span>
                <span className="flex items-center gap-1.5 text-down">
                  <span className="h-2 w-2 rounded-full bg-down" /> KOSPI
                </span>
              </div>
            </div>
            <HeroMiniChart />
            <div className="mt-3 grid grid-cols-2 gap-3 px-2 text-xs">
              <div className="rounded-md bg-muted/40 p-3">
                <div className="text-muted-foreground">12M 수익률</div>
                <div className="mt-1 font-semibold text-up tabular-nums">
                  +24.3%
                </div>
              </div>
              <div className="rounded-md bg-muted/40 p-3">
                <div className="text-muted-foreground">vs KOSPI 알파</div>
                <div className="mt-1 font-semibold text-up tabular-nums">
                  +9.2%p
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
