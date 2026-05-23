import { Card, CardContent } from "@/components/ui/card";
import { Gauge, ShieldAlert, Receipt } from "lucide-react";

const ITEMS = [
  {
    icon: Gauge,
    title: "샤프지수 — 리스크 조정 수익",
    body:
      "수익률이 같아도 변동성이 컸다면 운이 따른 것일 수 있습니다. 감수한 위험 1단위당 초과 수익을 환산해 매매의 효율을 평가합니다.",
    sample: "1.42",
    tone: "neutral" as const,
  },
  {
    icon: ShieldAlert,
    title: "MDD — 견뎌야 했던 최악의 낙폭",
    body:
      "수익률은 결과일 뿐, 그 과정에서 −20% 평가손이 났다면 같은 전략을 반복하기 어렵습니다. 고점 대비 누적 낙폭으로 손실 내성을 점검합니다.",
    sample: "−12.5%",
    tone: "down" as const,
  },
  {
    icon: Receipt,
    title: "비용 누수 — 수수료와 세금",
    body:
      "매매 횟수가 늘면 수수료·증권거래세가 수익률을 갉아먹습니다. 실현손익에서 비용이 차지한 비중을 별도로 표시해 회전율의 대가를 보여드립니다.",
    sample: "−1.8%p",
    tone: "down" as const,
  },
];

export function RiskCost() {
  return (
    <section
      id="risk-cost"
      className="relative border-t border-border/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-highlight">
            Risk &amp; cost
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            수익률만 봐서는 안 보이는 것
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            플러스 수익률 뒤에 숨은 변동성, 낙폭, 비용을 따로 떼어 보여드립니다. 같은 +20%도
            완전히 다른 매매일 수 있습니다.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {ITEMS.map((item) => (
            <Card key={item.title} className="transition-colors hover:border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted/60 text-highlight">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={
                      "text-lg font-semibold tabular-nums " +
                      (item.tone === "down" ? "text-down" : "text-foreground")
                    }
                  >
                    {item.sample}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
