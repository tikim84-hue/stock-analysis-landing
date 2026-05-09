import { ArrowRight, BarChart3, Cpu, Upload } from "lucide-react";

const STEPS = [
  {
    n: 1,
    icon: Upload,
    title: "거래내역 CSV 업로드",
    body:
      "주요 증권사·해외 브로커 양식을 자동 인식합니다. 수동 매핑이 거의 필요 없습니다.",
  },
  {
    n: 2,
    icon: Cpu,
    title: "자동 정규화 & 벤치마크 매칭",
    body:
      "환율·수수료·세금을 차감해 실수익률로 변환하고, 보유 비중에 맞춰 벤치마크를 합성합니다.",
  },
  {
    n: 3,
    icon: BarChart3,
    title: "인터랙티브 리포트 생성",
    body:
      "TWR/MWR, 알파 분해, 섹터·종목 기여도, 드로다운까지 한 화면에서 드릴다운합니다.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-t border-border/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-highlight">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            3단계로 끝나는 분석
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            기록·정리에 쓰던 시간을 분석에 쓰도록 설계했습니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
          {STEPS.map((step, idx) => (
            <div
              key={step.n}
              className="flex h-full flex-col rounded-lg border border-border/60 bg-card/60 p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-highlight/15 text-highlight">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Step {step.n}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              {idx < STEPS.length - 1 ? (
                <div className="mt-4 hidden md:contents">
                  {/* arrow rendered between cards via separate column - handled below */}
                </div>
              ) : null}
            </div>
          )).flatMap((node, i, arr) => {
            if (i === arr.length - 1) return [node];
            return [
              node,
              <div
                key={`arrow-${i}`}
                className="hidden items-center justify-center text-muted-foreground md:flex"
                aria-hidden
              >
                <ArrowRight className="h-5 w-5" />
              </div>,
            ];
          })}
        </div>
      </div>
    </section>
  );
}
